"use client"

import { useCallback, useMemo, useEffect } from "react"
import { useCachedQuery } from "@/lib/hooks/use-cached-query"
import { createClient } from "@/lib/supabase/client"
import { useSession } from "@/components/providers/session-provider"
import { subscribeToCacheInvalidation } from "@/lib/utils/cache-invalidation"

interface Server {
  id: string
  name: string
  description: string | null
  icon_url: string | null
  owner_id: string
}

interface ServerMember {
  servers: Server
  role: string
}

export function useServers() {
  const { user } = useSession()
  const supabase = useMemo(() => createClient(), [])

  // Stable query function
  const queryFn = useCallback(async () => {
    if (!user) throw new Error("No user")

    const { data, error } = await supabase
      .from("server_members")
      .select(`
        servers(id, name, description, icon_url, owner_id),
        role
      `)
      .eq("user_id", user.id)

    if (error) throw error
    return data as ServerMember[]
  }, [user, supabase])

  // Stable query key
  const queryKey = useMemo(() => (user ? `servers:${user.id}` : "servers:none"), [user])

  const query = useCachedQuery({
    key: queryKey,
    queryFn,
    enabled: !!user,
    staleTime: 10 * 1000, // 10 seconds instead of 3 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes instead of 15 minutes
    refetchOnWindowFocus: true,
  })

  // Subscribe to cache invalidation events
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToCacheInvalidation('servers', () => {
      // Force refetch when cache is invalidated
      query.refetch()
    })

    return unsubscribe
  }, [user, query.refetch])

  // Set up real-time subscription for server_members
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('server_members_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'server_members',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch data when server_members change
          query.refetch()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'servers'
        },
        () => {
          // Refetch data when servers change
          query.refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, query.refetch])

  return query
}
