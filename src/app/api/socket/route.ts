import { NextRequest } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'
import { createWebSocketClient } from '@/lib/supabase/websocket'

// Global variable to store the Socket.IO server instance
let io: SocketIOServer | null = null
export const config = {
  api: {
    bodyParser: false
  }
}

// Initialize Socket.IO server
function getIO() {
  if (!io) {
    io = new SocketIOServer(3001, {
      cors: {
        origin: "*",
        // origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    })

    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`)

      // Authenticate user with access token
      socket.on('authenticate', async (accessToken: string) => {
        try {
          const supabase = createWebSocketClient(accessToken)

          // Get the user from the session
          const { data: { user }, error } = await supabase.auth.getUser()

          if (error || !user) {
            console.error('Authentication error:', error)
            socket.emit('auth_error', 'Invalid authentication')
            return
          }

          socket.data.userId = user.id
          socket.data.authenticated = true
          socket.data.accessToken = accessToken

          socket.emit('authenticated', { userId: user.id })
          console.log(`User authenticated: ${user.id}`)
        } catch (error) {
          console.error('Authentication error:', error)
          socket.emit('auth_error', 'Authentication failed')
        }
      })

      // Join a channel
      socket.on('join_channel', async (channelId: string) => {
        if (!socket.data.authenticated) {
          socket.emit('error', 'Not authenticated')
          return
        }

        try {
          const supabase = createWebSocketClient(socket.data.accessToken)
          const { data: channel } = await supabase
            .from('channels')
            .select('id')
            .eq('id', channelId)
            .single()

          if (!channel) {
            socket.emit('error', 'Channel not found')
            return
          }

          socket.join(`channel:${channelId}`)
          socket.emit('joined_channel', { channelId })
          console.log(`User ${socket.data.userId} joined channel ${channelId}`)
        } catch (error) {
          console.error('Join channel error:', error)
          socket.emit('error', 'Failed to join channel')
        }
      })

      // Handle new message
      socket.on('new_message', async (messageData: { content: string; channelId: string }) => {
        console.log('Received new_message event:', messageData)
        console.log('Socket data:', {
          authenticated: socket.data.authenticated,
          userId: socket.data.userId,
          accessToken: socket.data.accessToken ? 'present' : 'missing'
        })

        if (!socket.data.authenticated) {
          console.error('User not authenticated for new_message')
          socket.emit('error', 'Not authenticated')
          return
        }

        try {
          const supabase = createWebSocketClient(socket.data.accessToken)
          console.log('Inserting message with data:', {
            content: messageData.content,
            channel_id: messageData.channelId,
            user_id: socket.data.userId
          })

          const { data: message, error } = await supabase
            .from('messages')
            .insert({
              content: messageData.content,
              channel_id: messageData.channelId,
              user_id: socket.data.userId
            })
            .select(`
              *,
              users(username, display_name, avatar_url)
            `)
            .single()

          if (error) {
            console.error('Supabase insert error:', error)
            console.error('Error details:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            })
            socket.emit('error', `Failed to send message: ${error.message}`)
            return
          }

          console.log('Message inserted successfully:', message)

          const messageWithReactions = {
            ...message,
            reactions: []
          }

          io?.to(`channel:${messageData.channelId}`).emit('message_received', messageWithReactions)
          console.log(`Message sent in channel ${messageData.channelId}: ${message.id}`)
        } catch (error) {
          console.error('Send message error:', error)
          console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
          socket.emit('error', `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      })

      // Handle message edit
      socket.on('edit_message', async (editData: { messageId: string; content: string; channelId: string }) => {
        console.log('Received edit_message event:', editData)

        if (!socket.data.authenticated) {
          console.error('User not authenticated for edit_message')
          socket.emit('error', 'Not authenticated')
          return
        }

        try {
          const supabase = createWebSocketClient(socket.data.accessToken)
          console.log('Editing message with data:', editData)

          const { data: message } = await supabase
            .from('messages')
            .select('user_id')
            .eq('id', editData.messageId)
            .single()

          if (!message || message.user_id !== socket.data.userId) {
            console.error('User not authorized to edit message:', socket.data.userId, 'message owner:', message?.user_id)
            socket.emit('error', 'Not authorized to edit this message')
            return
          }

          const { data: updatedMessage, error } = await supabase
            .from('messages')
            .update({
              content: editData.content,
              edited_at: new Date().toISOString()
            })
            .eq('id', editData.messageId)
            .select(`
              *,
              users(username, display_name, avatar_url)
            `)
            .single()

          if (error) {
            console.error('Supabase update error:', error)
            socket.emit('error', `Failed to edit message: ${error.message}`)
            return
          }

          console.log('Message edited successfully:', updatedMessage)

          const messageWithReactions = {
            ...updatedMessage,
            reactions: []
          }

          io?.to(`channel:${editData.channelId}`).emit('message_edited', messageWithReactions)
          console.log(`Message edited in channel ${editData.channelId}: ${editData.messageId}`)
        } catch (error) {
          console.error('Edit message error:', error)
          socket.emit('error', `Failed to edit message: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      })

      // Handle message deletion
      socket.on('delete_message', async (deleteData: { messageId: string; channelId: string }) => {
        console.log('Received delete_message event:', deleteData)

        if (!socket.data.authenticated) {
          console.error('User not authenticated for delete_message')
          socket.emit('error', 'Not authenticated')
          return
        }

        try {
          const supabase = createWebSocketClient(socket.data.accessToken)
          console.log('Deleting message with data:', deleteData)

          const { data: message } = await supabase
            .from('messages')
            .select('user_id')
            .eq('id', deleteData.messageId)
            .single()

          if (!message || message.user_id !== socket.data.userId) {
            console.error('User not authorized to delete message:', socket.data.userId, 'message owner:', message?.user_id)
            socket.emit('error', 'Not authorized to delete this message')
            return
          }

          const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', deleteData.messageId)

          if (error) {
            console.error('Supabase delete error:', error)
            socket.emit('error', `Failed to delete message: ${error.message}`)
            return
          }

          console.log('Message deleted successfully')

          io?.to(`channel:${deleteData.channelId}`).emit('message_deleted', {
            messageId: deleteData.messageId,
            channelId: deleteData.channelId
          })
          console.log(`Message deleted in channel ${deleteData.channelId}: ${deleteData.messageId}`)
        } catch (error) {
          console.error('Delete message error:', error)
          socket.emit('error', `Failed to delete message: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      })

      // Handle reactions
      socket.on('add_reaction', async (reactionData: { messageId: string; emoji: string; channelId: string }) => {
        console.log('Received add_reaction event:', reactionData)

        if (!socket.data.authenticated) {
          console.error('User not authenticated for add_reaction')
          socket.emit('error', 'Not authenticated')
          return
        }

        try {
          const supabase = createWebSocketClient(socket.data.accessToken)
          console.log('Adding reaction with data:', reactionData)

          const { data: existingReaction } = await supabase
            .from('message_reactions')
            .select('id')
            .eq('message_id', reactionData.messageId)
            .eq('user_id', socket.data.userId)
            .eq('emoji', reactionData.emoji)
            .single()

          if (existingReaction) {
            console.log('Removing existing reaction')
            await supabase
              .from('message_reactions')
              .delete()
              .eq('id', existingReaction.id)
          } else {
            console.log('Adding new reaction')
            await supabase
              .from('message_reactions')
              .insert({
                message_id: reactionData.messageId,
                user_id: socket.data.userId,
                emoji: reactionData.emoji
              })
          }

          const { data: reactions } = await supabase
            .from('message_reactions')
            .select(`
              id,
              emoji,
              user_id,
              users(id, username, display_name)
            `)
            .eq('message_id', reactionData.messageId)

          const reactionGroups = new Map()
          reactions?.forEach((reaction: any) => {
            const key = reaction.emoji
            if (!reactionGroups.has(key)) {
              reactionGroups.set(key, {
                id: reaction.id,
                emoji: reaction.emoji,
                count: 0,
                users: [],
                hasReacted: false
              })
            }
            const group = reactionGroups.get(key)
            group.count++
            group.users.push(reaction.users)
            if (reaction.user_id === socket.data.userId) {
              group.hasReacted = true
            }
          })

          console.log('Reaction groups:', Array.from(reactionGroups.values()))

          io?.to(`channel:${reactionData.channelId}`).emit('reaction_updated', {
            messageId: reactionData.messageId,
            reactions: Array.from(reactionGroups.values())
          })
          console.log(`Reaction updated in channel ${reactionData.channelId}: ${reactionData.messageId}`)
        } catch (error) {
          console.error('Reaction error:', error)
          socket.emit('error', `Failed to update reaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      })

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`)
      })
    })

    console.log('WebSocket server initialized on port 3001')
  }

  return io
}

export async function GET(req: NextRequest) {
  // Initialize the WebSocket server
  getIO()

  return new Response('WebSocket server is running', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  })
} 