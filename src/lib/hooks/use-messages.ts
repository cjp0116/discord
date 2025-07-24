"use client"

import { useCallback, useMemo, useEffect } from "react"
import { useCachedQuery } from "@/lib/hooks/use-cached-query"
import { createClient } from "@/lib/supabase/client"
import { useSession } from "@/components/providers/session-provider"
import { subscribeToCacheInvalidation } from "@/lib/utils/cache-invalidation"

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
    message_id: string
    user_id: string
    emoji: string
    created_at: string
    users: {
      username: string
      display_name: string | null
      avatar_url: string | null
    }
  }>
  hasReacted: boolean
}



export function useMessages(channelId: string) {
  const { user } = useSession()
  const supabase = useMemo(() => createClient(), [])

  // Stable query function
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
      .limit(50) // Limit to reduce payload size

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
    staleTime: 2 * 1000, // 2 seconds for messages (reduced from 5)
    cacheTime: 1 * 60 * 1000, // 1 minute (reduced from 2 minutes)
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 1000, // Refresh every 5 seconds (reduced from 10)
  })

  // Subscribe to cache invalidation events
  useEffect(() => {
    if (!channelId) return

    const unsubscribe = subscribeToCacheInvalidation(`messages:${channelId}`, () => {
      // Force refetch when cache is invalidated
      query.refetch()
    })

    return unsubscribe
  }, [channelId, query.refetch])

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!user || !channelId) return

    const channel = supabase
      .channel(`messages_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        () => {
          // Refetch data when messages change
          query.refetch()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=in.(select id from messages where channel_id='${channelId}')`
        },
        () => {
          // Refetch data when reactions change
          query.refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, channelId, supabase, query.refetch])

  return query
}
