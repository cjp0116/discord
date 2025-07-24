"use client"

import { io, Socket } from 'socket.io-client'
import { ChatMessage } from './server'

interface WebSocketManager {
  socket: Socket | null
  isConnected: boolean
  isAuthenticated: boolean
  currentChannel: string | null
  listeners: Map<string, Set<Function>>
  connect: (token: string) => Promise<void>
  disconnect: () => void
  joinChannel: (channelId: string) => void
  leaveChannel: (channelId: string) => void
  sendMessage: (content: string, channelId: string) => boolean
  editMessage: (messageId: string, content: string, channelId: string) => boolean
  deleteMessage: (messageId: string, channelId: string) => boolean
  addReaction: (messageId: string, emoji: string, channelId: string) => boolean
  addListener: (event: string, callback: Function) => void
  removeListener: (event: string, callback: Function) => void
}

class WebSocketManagerImpl implements WebSocketManager {
  socket: Socket | null = null
  isConnected = false
  isAuthenticated = false
  currentChannel: string | null = null
  listeners = new Map<string, Set<Function>>()
  private connecting = false

  async connect(token: string): Promise<void> {
    if (this.connecting) {
      console.log('Connection already in progress')
      return
    }

    if (this.socket?.connected && this.isAuthenticated) {
      console.log('Already connected and authenticated')
      return
    }

    this.connecting = true
    console.log('Attempting WebSocket connection')

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
        this.isConnected = true
        socket.emit('authenticate', token)
      })

      socket.on('authenticated', (data: { userId: string }) => {
        console.log('WebSocket authenticated:', data.userId)
        this.isAuthenticated = true
        this.connecting = false
        this.emit('authenticated', data)
      })

      socket.on('auth_error', (error: string) => {
        console.error('WebSocket authentication error:', error)
        this.connecting = false
        this.emit('auth_error', error)
      })

      socket.on('joined_channel', (data: { channelId: string }) => {
        console.log('Joined channel:', data.channelId)
        this.currentChannel = data.channelId
        this.emit('joined_channel', data)
      })

      socket.on('left_channel', (data: { channelId: string }) => {
        console.log('Left channel:', data.channelId)
        if (this.currentChannel === data.channelId) {
          this.currentChannel = null
        }
        this.emit('left_channel', data)
      })

      socket.on('message_received', (message: ChatMessage) => {
        console.log('Message received:', message)
        this.emit('message_received', message)
      })

      socket.on('message_edited', (message: ChatMessage) => {
        console.log('Message edited:', message)
        this.emit('message_edited', message)
      })

      socket.on('message_deleted', (data: { messageId: string; channelId: string }) => {
        console.log('Message deleted:', data.messageId)
        this.emit('message_deleted', data.messageId)
      })

      socket.on('reaction_updated', (data: { messageId: string; reactions: any[] }) => {
        console.log('Reaction updated:', data)
        this.emit('reaction_updated', data.messageId, data.reactions)
      })

      socket.on('error', (error: string) => {
        console.error('WebSocket error:', error)
        this.connecting = false
        this.emit('error', error)
      })

      socket.on('disconnect', (reason: string) => {
        console.log('WebSocket disconnected:', reason)
        this.isConnected = false
        this.isAuthenticated = false
        this.currentChannel = null
        this.connecting = false
        this.emit('disconnect', reason)
      })

      this.socket = socket
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.connecting = false
    }
  }

  disconnect(): void {
    if (this.socket) {
      console.log('Manually disconnecting WebSocket')
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
    this.isAuthenticated = false
    this.currentChannel = null
    this.connecting = false
  }

  joinChannel(channelId: string): void {
    if (!this.socket || !this.isAuthenticated) {
      console.warn('Cannot join channel: socket not connected or not authenticated')
      return
    }

    console.log('Joining channel:', channelId)
    this.socket.emit('join_channel', channelId)
  }

  leaveChannel(channelId: string): void {
    if (!this.socket) return

    console.log('Leaving channel:', channelId)
    this.socket.emit('leave_channel', channelId)
  }

  sendMessage(content: string, channelId: string): boolean {
    if (!this.socket || !this.isAuthenticated) {
      console.warn('Cannot send message: socket not connected or not authenticated')
      return false
    }

    console.log('Sending message to channel:', channelId, 'content:', content)
    this.socket.emit('new_message', { content, channelId })
    return true
  }

  editMessage(messageId: string, content: string, channelId: string): boolean {
    if (!this.socket || !this.isAuthenticated) {
      console.warn('Cannot edit message: socket not connected or not authenticated')
      return false
    }

    console.log('Editing message:', messageId)
    this.socket.emit('edit_message', { messageId, content, channelId })
    return true
  }

  deleteMessage(messageId: string, channelId: string): boolean {
    if (!this.socket || !this.isAuthenticated) {
      console.warn('Cannot delete message: socket not connected or not authenticated')
      return false
    }

    console.log('Deleting message:', messageId)
    this.socket.emit('delete_message', { messageId, channelId })
    return true
  }

  addReaction(messageId: string, emoji: string, channelId: string): boolean {
    if (!this.socket || !this.isAuthenticated) {
      console.warn('Cannot add reaction: socket not connected or not authenticated')
      return false
    }

    console.log('Adding reaction:', emoji, 'to message:', messageId)
    this.socket.emit('add_reaction', { messageId, emoji, channelId })
    return true
  }

  addListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  removeListener(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback)
  }

  private emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error('Error in WebSocket listener:', error)
      }
    })
  }
}

// Singleton instance
export const wsManager = new WebSocketManagerImpl() 