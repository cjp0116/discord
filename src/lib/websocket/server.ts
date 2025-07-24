import { Server as SocketIOServer } from 'socket.io'
import { createClient } from '@/lib/supabase/server'

export interface ChatMessage {
  id: string
  content: string
  channel_id: string
  user_id: string
  created_at: string
  edited_at?: string
  users: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  reactions?: Array<{
    id: string
    emoji: string
    count: number
    users: Array<{
      id: string
      username: string
      display_name: string | null
    }>
    hasReacted: boolean
  }>
}

export interface ChatEvent {
  type: 'message' | 'edit' | 'delete' | 'reaction'
  data: any
  channelId: string
}

class WebSocketServer {
  private io: SocketIOServer | null = null
  private userSockets = new Map<string, Set<string>>() // userId -> Set of socketIds
  private channelSockets = new Map<string, Set<string>>() // channelId -> Set of socketIds

  initialize(server: any) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        // origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    })

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`)

      // Authenticate user
      socket.on('authenticate', async (token: string) => {
        try {
          // Verify the user session
          const supabase = await createClient()
          const { data: { user }, error } = await supabase.auth.getUser()
          
          if (error || !user) {
            socket.emit('auth_error', 'Invalid authentication')
            return
          }

          // Store user socket mapping
          if (!this.userSockets.has(user.id)) {
            this.userSockets.set(user.id, new Set())
          }
          this.userSockets.get(user.id)!.add(socket.id)

          // Store user info in socket
          socket.data.userId = user.id
          socket.data.authenticated = true

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
          // Verify user has access to this channel
          const supabase = await createClient()
          const { data: channel } = await supabase
            .from('channels')
            .select('id')
            .eq('id', channelId)
            .single()

          if (!channel) {
            socket.emit('error', 'Channel not found')
            return
          }

          // Check if user is member of the server
          const { data: member } = await supabase
            .from('server_members')
            .select('id')
            .eq('server_id', channel.server_id)
            .eq('user_id', socket.data.userId)
            .single()

          if (!member) {
            socket.emit('error', 'Not a member of this server')
            return
          }

          socket.join(`channel:${channelId}`)
          
          // Store channel socket mapping
          if (!this.channelSockets.has(channelId)) {
            this.channelSockets.set(channelId, new Set())
          }
          this.channelSockets.get(channelId)!.add(socket.id)

          socket.emit('joined_channel', { channelId })
          console.log(`User ${socket.data.userId} joined channel ${channelId}`)
        } catch (error) {
          console.error('Join channel error:', error)
          socket.emit('error', 'Failed to join channel')
        }
      })

      // Leave a channel
      socket.on('leave_channel', (channelId: string) => {
        socket.leave(`channel:${channelId}`)
        
        // Remove from channel mapping
        this.channelSockets.get(channelId)?.delete(socket.id)
        if (this.channelSockets.get(channelId)?.size === 0) {
          this.channelSockets.delete(channelId)
        }

        socket.emit('left_channel', { channelId })
        console.log(`User ${socket.data.userId} left channel ${channelId}`)
      })

      // Handle new message
      socket.on('new_message', async (messageData: { content: string; channelId: string }) => {
        if (!socket.data.authenticated) {
          socket.emit('error', 'Not authenticated')
          return
        }

        try {
          const supabase = await createClient()
          
          // Insert message into database
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
            socket.emit('error', 'Failed to send message')
            return
          }

          // Broadcast to all users in the channel
          const messageWithReactions: ChatMessage = {
            ...message,
            reactions: []
          }

          this.io?.to(`channel:${messageData.channelId}`).emit('message_received', messageWithReactions)
          console.log(`Message sent in channel ${messageData.channelId}: ${message.id}`)
        } catch (error) {
          console.error('Send message error:', error)
          socket.emit('error', 'Failed to send message')
        }
      })

      // Handle message edit
      socket.on('edit_message', async (editData: { messageId: string; content: string; channelId: string }) => {
        if (!socket.data.authenticated) {
          socket.emit('error', 'Not authenticated')
          return
        }

        try {
          const supabase = await createClient()
          
          // Verify user owns the message
          const { data: message } = await supabase
            .from('messages')
            .select('user_id')
            .eq('id', editData.messageId)
            .single()

          if (!message || message.user_id !== socket.data.userId) {
            socket.emit('error', 'Not authorized to edit this message')
            return
          }

          // Update message
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
            socket.emit('error', 'Failed to edit message')
            return
          }

          // Broadcast to all users in the channel
          const messageWithReactions: ChatMessage = {
            ...updatedMessage,
            reactions: []
          }

          this.io?.to(`channel:${editData.channelId}`).emit('message_edited', messageWithReactions)
          console.log(`Message edited in channel ${editData.channelId}: ${editData.messageId}`)
        } catch (error) {
          console.error('Edit message error:', error)
          socket.emit('error', 'Failed to edit message')
        }
      })

      // Handle message deletion
      socket.on('delete_message', async (deleteData: { messageId: string; channelId: string }) => {
        if (!socket.data.authenticated) {
          socket.emit('error', 'Not authenticated')
          return
        }

        try {
          const supabase = await createClient()
          
          // Verify user owns the message
          const { data: message } = await supabase
            .from('messages')
            .select('user_id')
            .eq('id', deleteData.messageId)
            .single()

          if (!message || message.user_id !== socket.data.userId) {
            socket.emit('error', 'Not authorized to delete this message')
            return
          }

          // Delete message
          const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', deleteData.messageId)

          if (error) {
            socket.emit('error', 'Failed to delete message')
            return
          }

          // Broadcast to all users in the channel
          this.io?.to(`channel:${deleteData.channelId}`).emit('message_deleted', {
            messageId: deleteData.messageId,
            channelId: deleteData.channelId
          })
          console.log(`Message deleted in channel ${deleteData.channelId}: ${deleteData.messageId}`)
        } catch (error) {
          console.error('Delete message error:', error)
          socket.emit('error', 'Failed to delete message')
        }
      })

      // Handle reactions
      socket.on('add_reaction', async (reactionData: { messageId: string; emoji: string; channelId: string }) => {
        if (!socket.data.authenticated) {
          socket.emit('error', 'Not authenticated')
          return
        }

        try {
          const supabase = await createClient()
          
          // Check if user already reacted
          const { data: existingReaction } = await supabase
            .from('message_reactions')
            .select('id')
            .eq('message_id', reactionData.messageId)
            .eq('user_id', socket.data.userId)
            .eq('emoji', reactionData.emoji)
            .single()

          if (existingReaction) {
            // Remove reaction
            await supabase
              .from('message_reactions')
              .delete()
              .eq('id', existingReaction.id)
          } else {
            // Add reaction
            await supabase
              .from('message_reactions')
              .insert({
                message_id: reactionData.messageId,
                user_id: socket.data.userId,
                emoji: reactionData.emoji
              })
          }

          // Get updated reactions for the message
          const { data: reactions } = await supabase
            .from('message_reactions')
            .select(`
              id,
              emoji,
              user_id,
              users(id, username, display_name)
            `)
            .eq('message_id', reactionData.messageId)

          // Group reactions
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

          // Broadcast to all users in the channel
          this.io?.to(`channel:${reactionData.channelId}`).emit('reaction_updated', {
            messageId: reactionData.messageId,
            reactions: Array.from(reactionGroups.values())
          })
          console.log(`Reaction updated in channel ${reactionData.channelId}: ${reactionData.messageId}`)
        } catch (error) {
          console.error('Reaction error:', error)
          socket.emit('error', 'Failed to update reaction')
        }
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`)
        
        // Clean up user socket mapping
        if (socket.data.userId) {
          this.userSockets.get(socket.data.userId)?.delete(socket.id)
          if (this.userSockets.get(socket.data.userId)?.size === 0) {
            this.userSockets.delete(socket.data.userId)
          }
        }

        // Clean up channel socket mapping
        for (const [channelId, sockets] of this.channelSockets.entries()) {
          sockets.delete(socket.id)
          if (sockets.size === 0) {
            this.channelSockets.delete(channelId)
          }
        }
      })
    })

    console.log('WebSocket server initialized')
  }

  // Method to broadcast events from server actions
  broadcastToChannel(channelId: string, event: string, data: any) {
    this.io?.to(`channel:${channelId}`).emit(event, data)
  }

  // Method to get connected users in a channel
  getChannelUsers(channelId: string): string[] {
    const socketIds = this.channelSockets.get(channelId) || new Set()
    const userIds: string[] = []
    
    for (const socketId of socketIds) {
      const socket = this.io?.sockets.sockets.get(socketId)
      if (socket?.data.userId) {
        userIds.push(socket.data.userId)
      }
    }
    
    return userIds
  }
}

export const wsServer = new WebSocketServer() 