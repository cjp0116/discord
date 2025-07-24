"use client"

import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from '@/components/providers/session-provider'
import { ChatMessage } from './server'

interface UseWebSocketOptions {
  channelId?: string
  onMessageReceived?: (message: ChatMessage) => void
  onMessageEdited?: (message: ChatMessage) => void
  onMessageDeleted?: (messageId: string) => void
  onReactionUpdated?: (messageId: string, reactions: any[]) => void
  onError?: (error: string) => void
}

export function useWebSocket({
  channelId,
  onMessageReceived,
  onMessageEdited,
  onMessageDeleted,
  onReactionUpdated,
  onError
}: UseWebSocketOptions = {}) {
  const { user } = useSession()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentChannel, setCurrentChannel] = useState<string | null>(null)
  const connectingRef = useRef(false)
  const userRef = useRef(user)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update user ref when user changes
  useEffect(() => {
    userRef.current = user
  }, [user])

  // Initialize socket connection
  const connect = useCallback(async () => {
    if (!user) {
      console.log('No user available, skipping WebSocket connection')
      return
    }

    // Prevent multiple simultaneous connection attempts
    if (connectingRef.current) {
      console.log('Connection already in progress, skipping')
      return
    }

    // If already connected and authenticated, don't reconnect
    if (socketRef.current?.connected && isAuthenticated) {
      console.log('Already connected and authenticated, skipping connection')
      return
    }

    connectingRef.current = true
    console.log('Attempting WebSocket connection for user:', user.id)

    try {
      const socket = io('http://localhost:3001', {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: false
      })

      socket.on('connect', async () => {
        console.log('WebSocket connected')
        setIsConnected(true)

        // Get the access token from the session
        try {
          const response = await fetch('/api/auth/session')
          const { data, error } = await response.json()

          if (error) {
            console.error('Session API error:', error)
            onError?.('Authentication required. Please log in.')
            return
          }

          if (data?.session?.access_token) {
            console.log('Sending authentication to WebSocket server')
            socket.emit('authenticate', data.session.access_token)
          } else {
            console.error('No access token available')
            onError?.('No access token available. Please log in.')
          }
        } catch (error) {
          console.error('Failed to get session:', error)
          onError?.('Failed to get session. Please log in.')
        }
      })

      socket.on('authenticated', (data: { userId: string }) => {
        console.log('WebSocket authenticated:', data.userId)
        setIsAuthenticated(true)
        connectingRef.current = false
      })

      socket.on('auth_error', (error: string) => {
        console.error('WebSocket authentication error:', error)
        onError?.(error)
        connectingRef.current = false
      })

      socket.on('joined_channel', (data: { channelId: string }) => {
        console.log('Joined channel:', data.channelId)
        setCurrentChannel(data.channelId)
      })

      socket.on('left_channel', (data: { channelId: string }) => {
        console.log('Left channel:', data.channelId)
        if (currentChannel === data.channelId) {
          setCurrentChannel(null)
        }
      })

      socket.on('message_received', (message: ChatMessage) => {
        console.log('Message received:', message)
        onMessageReceived?.(message)
      })

      socket.on('message_edited', (message: ChatMessage) => {
        console.log('Message edited:', message)
        onMessageEdited?.(message)
      })

      socket.on('message_deleted', (data: { messageId: string; channelId: string }) => {
        console.log('Message deleted:', data.messageId)
        onMessageDeleted?.(data.messageId)
      })

      socket.on('reaction_updated', (data: { messageId: string; reactions: any[] }) => {
        console.log('Reaction updated:', data)
        onReactionUpdated?.(data.messageId, data.reactions)
      })

      socket.on('error', (error: string) => {
        console.error('WebSocket error:', error)
        onError?.(error)
        connectingRef.current = false
      })

      // Listen for server-side errors
      socket.on('server_error', (error: string) => {
        console.error('Server error:', error)
        onError?.(error)
      })

      socket.on('disconnect', (reason: string) => {
        console.log('WebSocket disconnected:', reason)
        setIsConnected(false)
        setIsAuthenticated(false)
        setCurrentChannel(null)
        connectingRef.current = false

        // Only reconnect if user is still available and it's not a manual disconnect
        if (userRef.current && reason !== 'io client disconnect') {
          console.log('Attempting to reconnect...')
          setTimeout(() => {
            if (userRef.current) {
              connect()
            }
          }, 1000)
        }
      })

      socketRef.current = socket
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      connectingRef.current = false
    }
  }, [user, onMessageReceived, onMessageEdited, onMessageDeleted, onReactionUpdated, onError, currentChannel, isAuthenticated])

  // Join channel
  const joinChannel = useCallback((channelId: string) => {
    if (!socketRef.current || !isAuthenticated) {
      console.warn('Cannot join channel: socket not connected or not authenticated')
      return
    }

    console.log('Joining channel:', channelId)
    socketRef.current.emit('join_channel', channelId)
  }, [isAuthenticated])

  // Leave channel
  const leaveChannel = useCallback((channelId: string) => {
    if (!socketRef.current) return

    console.log('Leaving channel:', channelId)
    socketRef.current.emit('leave_channel', channelId)
  }, [])

  // Send message
  const sendMessage = useCallback((content: string, channelId: string) => {
    if (!socketRef.current || !isAuthenticated) {
      console.warn('Cannot send message: socket not connected or not authenticated')
      return false
    }

    console.log('Sending message to channel:', channelId, 'content:', content)
    socketRef.current.emit('new_message', { content, channelId })
    return true
  }, [isAuthenticated])

  // Edit message
  const editMessage = useCallback((messageId: string, content: string, channelId: string) => {
    if (!socketRef.current || !isAuthenticated) {
      console.warn('Cannot edit message: socket not connected or not authenticated')
      return false
    }

    console.log('Editing message:', messageId)
    socketRef.current.emit('edit_message', { messageId, content, channelId })
    return true
  }, [isAuthenticated])

  // Delete message
  const deleteMessage = useCallback((messageId: string, channelId: string) => {
    if (!socketRef.current || !isAuthenticated) {
      console.warn('Cannot delete message: socket not connected or not authenticated')
      return false
    }

    console.log('Deleting message:', messageId)
    socketRef.current.emit('delete_message', { messageId, channelId })
    return true
  }, [isAuthenticated])

  // Add reaction
  const addReaction = useCallback((messageId: string, emoji: string, channelId: string) => {
    if (!socketRef.current || !isAuthenticated) {
      console.warn('Cannot add reaction: socket not connected or not authenticated')
      return false
    }

    console.log('Adding reaction:', emoji, 'to message:', messageId)
    socketRef.current.emit('add_reaction', { messageId, emoji, channelId })
    return true
  }, [isAuthenticated])

  // Disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Manually disconnecting WebSocket')
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setIsConnected(false)
    setIsAuthenticated(false)
    setCurrentChannel(null)
    connectingRef.current = false
  }, [])

  // Auto-join channel when channelId changes
  useEffect(() => {
    if (channelId && isAuthenticated && socketRef.current) {
      // Leave current channel if different
      if (currentChannel && currentChannel !== channelId) {
        leaveChannel(currentChannel)
      }

      // Join new channel
      joinChannel(channelId)
    }
  }, [channelId, isAuthenticated, currentChannel, joinChannel, leaveChannel])

  // Initialize connection with debounce
  useEffect(() => {
    // Clear any existing timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
    }

    if (user) {
      // Only connect if we're not already connected and authenticated
      if (!socketRef.current?.connected || !isAuthenticated) {
        // Debounce connection to prevent rapid reconnections
        connectionTimeoutRef.current = setTimeout(() => {
          connect()
        }, 500)
      } else {
        console.log('Already connected and authenticated, skipping reconnection')
      }
    } else {
      // Disconnect if no user
      disconnect()
    }

    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }
      // Only disconnect on unmount, not on user changes
      if (!user) {
        disconnect()
      }
    }
  }, [user, connect, disconnect, isAuthenticated])

  return {
    isConnected,
    isAuthenticated,
    currentChannel,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    joinChannel,
    leaveChannel,
    disconnect
  }
} 