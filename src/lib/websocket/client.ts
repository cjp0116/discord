"use client"

import { useEffect, useRef, useCallback, useState } from 'react'
import { useSession } from '@/components/providers/session-provider'
import { ChatMessage } from './server'
import { wsManager } from './manager'

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
  const [isConnected, setIsConnected] = useState(wsManager.isConnected)
  const [isAuthenticated, setIsAuthenticated] = useState(wsManager.isAuthenticated)
  const [currentChannel, setCurrentChannel] = useState<string | null>(wsManager.currentChannel)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize connection
  const connect = useCallback(async () => {
    if (!user) {
      console.log('No user available, skipping WebSocket connection')
      return
    }

    try {
      const response = await fetch('/api/auth/session')
      const { data, error } = await response.json()

      if (error || !data?.session?.access_token) {
        console.error('No access token available')
        onError?.('No access token available. Please log in.')
        return
      }

      await wsManager.connect(data.session.access_token)
    } catch (error) {
      console.error('Failed to connect:', error)
      onError?.('Failed to connect to WebSocket')
    }
  }, [user, onError])

  // Join channel
  const joinChannel = useCallback((channelId: string) => {
    wsManager.joinChannel(channelId)
  }, [])

  // Leave channel
  const leaveChannel = useCallback((channelId: string) => {
    wsManager.leaveChannel(channelId)
  }, [])

  // Send message
  const sendMessage = useCallback((content: string, channelId: string) => {
    return wsManager.sendMessage(content, channelId)
  }, [])

  // Edit message
  const editMessage = useCallback((messageId: string, content: string, channelId: string) => {
    return wsManager.editMessage(messageId, content, channelId)
  }, [])

  // Delete message
  const deleteMessage = useCallback((messageId: string, channelId: string) => {
    return wsManager.deleteMessage(messageId, channelId)
  }, [])

  // Add reaction
  const addReaction = useCallback((messageId: string, emoji: string, channelId: string) => {
    return wsManager.addReaction(messageId, emoji, channelId)
  }, [])

  // Disconnect
  const disconnect = useCallback(() => {
    wsManager.disconnect()
  }, [])

  // Set up listeners
  useEffect(() => {
    if (onMessageReceived) wsManager.addListener('message_received', onMessageReceived)
    if (onMessageEdited) wsManager.addListener('message_edited', onMessageEdited)
    if (onMessageDeleted) wsManager.addListener('message_deleted', onMessageDeleted)
    if (onReactionUpdated) wsManager.addListener('reaction_updated', onReactionUpdated)
    if (onError) wsManager.addListener('error', onError)

    return () => {
      if (onMessageReceived) wsManager.removeListener('message_received', onMessageReceived)
      if (onMessageEdited) wsManager.removeListener('message_edited', onMessageEdited)
      if (onMessageDeleted) wsManager.removeListener('message_deleted', onMessageDeleted)
      if (onReactionUpdated) wsManager.removeListener('reaction_updated', onReactionUpdated)
      if (onError) wsManager.removeListener('error', onError)
    }
  }, [onMessageReceived, onMessageEdited, onMessageDeleted, onReactionUpdated, onError])

  // Update state from manager
  useEffect(() => {
    const updateState = () => {
      setIsConnected(wsManager.isConnected)
      setIsAuthenticated(wsManager.isAuthenticated)
      setCurrentChannel(wsManager.currentChannel)
    }

    updateState()
    wsManager.addListener('authenticated', updateState)
    wsManager.addListener('disconnect', updateState)
    wsManager.addListener('joined_channel', updateState)
    wsManager.addListener('left_channel', updateState)

    return () => {
      wsManager.removeListener('authenticated', updateState)
      wsManager.removeListener('disconnect', updateState)
      wsManager.removeListener('joined_channel', updateState)
      wsManager.removeListener('left_channel', updateState)
    }
  }, [])

  // Auto-join channel when channelId changes
  useEffect(() => {
    if (channelId && isAuthenticated) {
      // Only join if we're not already in this channel
      if (currentChannel !== channelId) {
        // Leave current channel if different
        if (currentChannel) {
          leaveChannel(currentChannel)
        }

        // Join new channel
        joinChannel(channelId)
      }
    }
  }, [channelId, isAuthenticated, currentChannel, joinChannel, leaveChannel])

  // Initialize connection
  useEffect(() => {
    if (user && !isAuthenticated) {
      // Debounce connection to prevent rapid reconnections
      connectionTimeoutRef.current = setTimeout(() => {
        connect()
      }, 1000)
    } else if (!user) {
      disconnect()
    }

    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }
    }
  }, [user?.id, connect, disconnect, isAuthenticated])

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