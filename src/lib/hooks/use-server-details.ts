"use client"

import { useCallback, useMemo, useEffect } from "react"
import { useCachedQuery } from "@/lib/hooks/use-cached-query"
import { createClient } from "@/lib/supabase/client"
import { useSession } from "@/components/providers/session-provider"
import { subscribeToCacheInvalidation } from "@/lib/utils/cache-invalidation"

interface Channel {
  id: string
  name: string
  description: string | null
  type: string
  position: number
}

interface Member {
  id: string
  user_id: string
  role: string
  users: {
    username: string
    display_name: string | null
    avatar_url: string | null
    status: string
  }
}

interface ServerDetails {
  server: {
    id: string
    name: string
    description: string | null
    icon_url: string | null
  }
  channels: Channel[]
  members: Member[]
}

export function useServerDetails(serverId: string) {
  const { user } = useSession()
  const supabase = useMemo(() => createClient(), [])

  // Stable query function
  const queryFn = useCallback(async () => {
    if (!user) throw new Error("No user")

    // Fetch server, channels, and members in parallel
    const [serverResult, channelsResult, membersResult] = await Promise.all([
      supabase.from("servers").select("*").eq("id", serverId).single(),
      supabase.from("channels").select("*").eq("server_id", serverId).order("position"),
      supabase
        .from("server_members")
        .select(`
          *,
          users(username, display_name, avatar_url, status)
        `)
        .eq("server_id", serverId),
    ])

    if (serverResult.error) throw serverResult.error
    if (channelsResult.error) throw channelsResult.error
    if (membersResult.error) throw membersResult.error

    return {
      server: serverResult.data,
      channels: channelsResult.data as Channel[],
      members: membersResult.data as Member[],
    } as ServerDetails
  }, [user, serverId, supabase])

  // Stable query key
  const queryKey = useMemo(() => `server-details:${serverId}`, [serverId])

  const query = useCachedQuery({
    key: queryKey,
    queryFn,
    enabled: !!user && !!serverId,
    staleTime: 10 * 1000, // 10 seconds instead of 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Subscribe to cache invalidation events
  useEffect(() => {
    if (!serverId) return

    const unsubscribe = subscribeToCacheInvalidation(`server-details:${serverId}`, () => {
      // Force refetch when cache is invalidated
      query.refetch()
    })

    return unsubscribe
  }, [serverId, query.refetch])

  // Set up real-time subscription for server details
  useEffect(() => {
    if (!user || !serverId) return

    const channel = supabase
      .channel(`server_details_${serverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'servers',
          filter: `id=eq.${serverId}`
        },
        () => {
          // Refetch data when server changes
          query.refetch()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channels',
          filter: `server_id=eq.${serverId}`
        },
        () => {
          // Refetch data when channels change
          query.refetch()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'server_members',
          filter: `server_id=eq.${serverId}`
        },
        () => {
          // Refetch data when members change
          query.refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, serverId, supabase, query.refetch])

  return query
}
