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
  const { user, profile } = useSession()
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
    onMessageReceived: useCallback((message: ChatMessage) => {
      setMessages(prev => [...prev, message as Message])
    }, []),
    onMessageEdited: useCallback((message: ChatMessage) => {
      setMessages(prev => prev.map(msg =>
        msg.id === message.id ? { ...msg, ...message } : msg
      ))
    }, []),
    onMessageDeleted: useCallback((messageId: string) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
    }, []),
    onReactionUpdated: useCallback((messageId: string, reactions: any[]) => {
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, reactions } : msg
      ))
    }, []),
    onError: useCallback((error: string) => {
      setError(error)
    }, [])
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

  // Helper function to process reactions
  const processReactions = useCallback((messageReactions: any[]) => {
    const reactionGroups = new Map();
    messageReactions?.forEach((reaction: any) => {
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
      if (reaction.user_id === user?.id) {
        group.hasReacted = true
      }
    })
    return Array.from(reactionGroups.values())
  }, [user])

  // Set up Supabase real-time subscription for messages and reactions
  useEffect(() => {
    if (!user || !channelId) return

    const channel = supabase
      .channel(`realtime_messages_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new message with user data
            supabase
              .from('messages')
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
              .eq('id', payload.new.id)
              .single()
              .then(({ data }: { data: any }) => {
                if (data) {
                  // Process reactions
                  const processedMessage = {
                    ...data,
                    reactions: processReactions(data.message_reactions)
                  }

                  setMessages(prev => {
                    // Remove optimistic message and avoid duplicates
                    const filtered = prev.filter(msg => !msg.id.startsWith('temp-') && msg.id !== data.id)
                    return [...filtered, processedMessage as Message]
                  })
                }
              })
          } else if (payload.eventType === 'UPDATE') {
            // Update existing message
            supabase
              .from('messages')
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
              .eq('id', payload.new.id)
              .single()
              .then(({ data }: { data: any }) => {
                if (data) {
                  const processedMessage = {
                    ...data,
                    reactions: processReactions(data.message_reactions)
                  }

                  setMessages(prev => prev.map(msg =>
                    msg.id === data.id ? processedMessage as Message : msg
                  ))
                }
              })
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions'
        },
        () => {
          // Refetch to update reactions
          query.refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, channelId, supabase, query, processReactions])

  // Send message via WebSocket or fallback to server action
  const sendMessage = useCallback(async (content: string) => {
    // Optimistic update - add message immediately to UI
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      created_at: new Date().toISOString(),
      edited_at: null,
      user_id: user?.id || '',
      users: {
        username: profile?.username || '',
        display_name: profile?.display_name || null,
        avatar_url: profile?.avatar_url || null,
      },
      reactions: []
    }

    setMessages(prev => [...prev, optimisticMessage])

    if (!isConnected || !isAuthenticated) {
      // Fallback to server action if WebSocket not available
      const { sendMessage: serverSendMessage } = await import('@/lib/actions/messages')
      const result = await serverSendMessage(channelId, content)

      if (!result.success) {
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
      }
      // Note: Supabase realtime will handle adding the actual message

      return result
    }

    const success = wsSendMessage(content, channelId)
    if (!success) {
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
    }
    // Note: WebSocket or Supabase realtime will handle adding the actual message

    return { success }
  }, [isConnected, isAuthenticated, wsSendMessage, channelId, user, profile])

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