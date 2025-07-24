"use client"

import { useCallback, useMemo, useEffect, useState } from "react"
import { useCachedQuery } from "@/lib/hooks/use-cached-query"
import { createClient } from "@/lib/supabase/client"
import { useSession } from "@/components/providers/session-provider"
import { useWebSocket } from "@/lib/websocket/client"
import { ChatMessage } from "@/lib/websocket/server"

interface Message {
  id: string
  content: string
  created_at: string
  edited_at: string | null
  user_id: string
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

export function useWebSocketMessages(channelId: string) {
  const { user } = useSession()
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // WebSocket hook
  const {
    isConnected,
    isAuthenticated,
    sendMessage: wsSendMessage,
    editMessage: wsEditMessage,
    deleteMessage: wsDeleteMessage,
    addReaction: wsAddReaction
  } = useWebSocket({
    channelId,
    onMessageReceived: (message: ChatMessage) => {
      setMessages(prev => [...prev, message as Message])
    },
    onMessageEdited: (message: ChatMessage) => {
      setMessages(prev => prev.map(msg =>
        msg.id === message.id ? { ...msg, ...message } : msg
      ))
    },
    onMessageDeleted: (messageId: string) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
    },
    onReactionUpdated: (messageId: string, reactions: any[]) => {
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, reactions } : msg
      ))
    },
    onError: (error: string) => {
      setError(error)
    }
  })

  // Stable query function for initial load
  const queryFn = useCallback(async () => {
    if (!user) throw new Error("No user")

    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        users(username, display_name, avatar_url),
        message_reactions(
          id,
          emoji,
          user_id,
          users(id, username, display_name, avatar_url)
        )
      `)
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true })
      .limit(50)

    if (error) throw error

    const messagesWithReaction = data.map((message: any) => {
      const reactionGroups = new Map();
      message.message_reactions?.forEach((reaction: any) => {
        const key = reaction.emoji;
        if (!reactionGroups.has(key)) {
          reactionGroups.set(key, {
            id: reaction.id,
            emoji: reaction.emoji,
            count: 0,
            users: [],
            hasReacted: false,
          })
        }

        const group = reactionGroups.get(key);
        group.count++;
        group.users.push(reaction.users);
        if (reaction.user_id === user.id) {
          group.hasReacted = true
        }
      })

      return {
        ...message,
        reactions: Array.from(reactionGroups.values()),
      }
    })
    return messagesWithReaction as Message[]
  }, [user, channelId, supabase])

  // Stable query key
  const queryKey = useMemo(() => `messages:${channelId}`, [channelId])

  const query = useCachedQuery({
    key: queryKey,
    queryFn,
    enabled: !!user && !!channelId,
    staleTime: 30 * 1000, // 30 seconds for initial load
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 0, // Disable polling since we use WebSocket
  })

  // Initialize messages from cache/query
  useEffect(() => {
    if (query.data) {
      setMessages(query.data)
      setLoading(false)
    } else if (query.loading) {
      setLoading(true)
    } else if (query.error) {
      setError(query.error)
      setLoading(false)
    }
  }, [query.data, query.loading, query.error])

  // Send message via WebSocket
  const sendMessage = useCallback(async (content: string) => {
    if (!isConnected || !isAuthenticated) {
      // Fallback to server action if WebSocket not available
      const { sendMessage: serverSendMessage } = await import('@/lib/actions/messages')
      const result = await serverSendMessage(channelId, content)
      if (result.success) {
        // Refetch messages to get the new message
        query.refetch()
      }
      return result
    }

    const success = wsSendMessage(content, channelId)
    return { success }
  }, [isConnected, isAuthenticated, wsSendMessage, channelId, query])

  // Edit message via WebSocket
  const editMessage = useCallback(async (messageId: string, content: string) => {
    if (!isConnected || !isAuthenticated) {
      // Fallback to server action if WebSocket not available
      const { editMessage: serverEditMessage } = await import('@/lib/actions/messages')
      const result = await serverEditMessage(messageId, content)
      if (result.success) {
        // Refetch messages to get the updated message
        query.refetch()
      }
      return result
    }

    const success = wsEditMessage(messageId, content, channelId)
    return { success }
  }, [isConnected, isAuthenticated, wsEditMessage, channelId, query])

  // Delete message via WebSocket
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!isConnected || !isAuthenticated) {
      // Fallback to server action if WebSocket not available
      const { deleteMessage: serverDeleteMessage } = await import('@/lib/actions/messages')
      try {
        await serverDeleteMessage(messageId)
        // Refetch messages to get the updated list
        query.refetch()
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }

    const success = wsDeleteMessage(messageId, channelId)
    return { success }
  }, [isConnected, isAuthenticated, wsDeleteMessage, channelId, query])

  // Add reaction via WebSocket
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!isConnected || !isAuthenticated) {
      // Fallback to server action if WebSocket not available
      const { addReaction: serverAddReaction } = await import('@/lib/actions/reactions')
      const result = await serverAddReaction(messageId, emoji)
      if (result.success) {
        // Refetch messages to get the updated reactions
        query.refetch()
      }
      return result
    }

    const success = wsAddReaction(messageId, emoji, channelId)
    return { success }
  }, [isConnected, isAuthenticated, wsAddReaction, channelId, query])

  // Refetch function
  const refetch = useCallback(() => {
    query.refetch()
  }, [query])

  return {
    data: messages,
    loading,
    error,
    isConnected,
    isAuthenticated,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    refetch
  }
} 