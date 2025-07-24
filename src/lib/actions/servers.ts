"use server"

import { createClient } from "@/lib/supabase/server"
import { verifySession, canManageServer } from "@/lib/dal"
import { revalidatePath } from "next/cache"
import { createServerSchema, joinServerSchema } from "@/lib/validations/servers"
import { invalidateServersCache, invalidateServerDetailsCache } from "@/lib/utils/cache-invalidation"

export async function createServer(prevState: any, formData: FormData) {
  const { user } = await verifySession()

  const rawFormData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  }

  // Validate form data
  const validatedFields = createServerSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, description } = validatedFields.data

  const supabase = await createClient()

  // Create server
  const { data: server, error: serverError } = await supabase
    .from("servers")
    .insert({
      name,
      description,
      owner_id: user.id,
    })
    .select()
    .single()

  if (serverError) {
    return {
      success: false,
      errors: { name: [serverError.message] },
    }
  }

  // Add owner as member
  const { error: memberError } = await supabase.from("server_members").insert({
    server_id: server.id,
    user_id: user.id,
    role: "owner",
  })

  if (memberError) {
    return {
      success: false,
      errors: { name: [memberError.message] },
    }
  }

  // Create default channels
  await supabase.from("channels").insert([
    {
      server_id: server.id,
      name: "general",
      description: "General discussion",
      position: 0,
    },
    {
      server_id: server.id,
      name: "random",
      description: "Random chat",
      position: 1,
    },
  ])

  // Invalidate cache
  invalidateServersCache()
  invalidateServerDetailsCache(server.id)

  // Revalidate specific paths
  revalidatePath('/dashboard');
  return { success: true, server }
}

export async function joinServer(prevState: any, formData: FormData) {
  const { user } = await verifySession()

  const rawFormData = {
    inviteCode: formData.get("inviteCode") as string,
  }

  // Validate form data
  const validatedFields = joinServerSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { inviteCode } = validatedFields.data

  const supabase = await createClient()

  // Find server by invite code
  const { data: server, error: serverError } = await supabase
    .from("servers")
    .select("id, name")
    .eq("invite_code", inviteCode)
    .single()

  if (serverError || !server) {
    return {
      success: false,
      errors: { inviteCode: ["Invalid invite code"] },
    }
  }

  // Check if already a member
  const { data: existingMember } = await supabase
    .from("server_members")
    .select("id")
    .eq("server_id", server.id)
    .eq("user_id", user.id)
    .single()

  if (existingMember) {
    return {
      success: false,
      errors: { inviteCode: ["Already a member of this server"] },
    }
  }

  // Add as member
  const { error: memberError } = await supabase.from("server_members").insert({
    server_id: server.id,
    user_id: user.id,
    role: "member",
  })

  if (memberError) {
    return {
      success: false,
      errors: { inviteCode: [memberError.message] },
    }
  }

  // Invalidate cache
  invalidateServersCache()
  invalidateServerDetailsCache(server.id)

  // Revalidate specific paths
  revalidatePath('/dashboard');
  return { success: true, server }
}

export async function updateServer(serverId: string, formData: FormData) {
  await verifySession()

  if (!(await canManageServer(serverId))) {
    throw new Error("Unauthorized")
  }

  const supabase = await createClient()
  const name = formData.get("name") as string
  const description = formData.get("description") as string

  const { error } = await supabase.from("servers").update({ name, description }).eq("id", serverId)

  if (error) {
    throw new Error(error.message)
  }

  // Invalidate cache
  invalidateServersCache()
  invalidateServerDetailsCache(serverId)

  // Revalidate specific paths
  revalidatePath('/dashboard');
  revalidatePath(`/servers/${serverId}`);
  return { success: true, serverId };
}
