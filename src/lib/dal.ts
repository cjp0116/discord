import "server-only"
import { createClient } from "@/lib/supabase/server"
import { cache } from "react"

export const getUser = cache(async () => {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get user profile data
    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()
    return profile
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
})

export const verifySession = cache(async () => {
  const user = await getUser()
  if (!user) {
    throw new Error("Unauthorized");
  }
  return { user }
})

// Server authorization functions
export async function canAccessServer(serverId: string) {
  try {
    const user = await getUser()
    if (!user) {
      console.log('canAccessServer: No user found')
      return false
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("server_members")
      .select("id")
      .eq("server_id", serverId)
      .eq("user_id", user.id)
      .single()

    console.log('canAccessServer:', { serverId, userId: user.id, data, error })
    return !!data
  } catch (error) {
    console.error("Error checking server access:", error)
    return false
  }
}

export async function canManageServer(serverId: string) {
  try {
    const user = await getUser()
    if (!user) return false

    const supabase = await createClient()
    const { data } = await supabase
      .from("server_members")
      .select("role")
      .eq("server_id", serverId)
      .eq("user_id", user.id)
      .single()

    return data?.role === "owner" || data?.role === "admin"
  } catch (error) {
    console.error("Error checking server management permissions:", error)
    return false
  }
}

export async function canAccessChannel(channelId: string) {
  try {
    const user = await getUser()
    if (!user) return false

    const supabase = await createClient()
    const { data } = await supabase
      .from("channels")
      .select(`
        server_id,
        servers!inner(
          server_members!inner(user_id)
        )
      `)
      .eq("id", channelId)
      .eq("servers.server_members.user_id", user.id)
      .single()

    return !!data
  } catch (error) {
    console.error("Error checking channel access:", error)
    return false
  }
}
