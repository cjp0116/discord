"use server"

import { createClient } from "@/lib/supabase/server"
import { verifySession, canManageServer } from "@/lib/dal"
import { revalidatePath } from "next/cache"
import { createChannelSchema, updateChannelSchema } from "@/lib/validations/channels"
import { redirect } from "next/navigation"
import { invalidateServerDetailsCache } from "@/lib/utils/cache-invalidation"

export async function createChannel(serverId: string, prevState: any, formData: FormData) {
  const rawFormData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    type: formData.get("type") as string,
  }

  // Validate form data
  const validatedFields = createChannelSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, description, type } = validatedFields.data

  let channelIdToRedirect: string | null = null

  try {
    await verifySession()

    // Check if the user has permission to manage this server (owner/admin)
    if (!(await canManageServer(serverId))) {
      return {
        success: false,
        errors: { name: ["Unauthorized to create channels in this server"] },
      }
    }

    const supabase = await createClient()

    // Get the current max position for channels in this server
    const { data: maxPositionData, error: maxPositionError } = await supabase
      .from("channels")
      .select("position")
      .eq("server_id", serverId)
      .order("position", { ascending: false })
      .limit(1)
      .single()

    const newPosition = (maxPositionData?.position || -1) + 1

    // Create channel
    const { data: channel, error: channelError } = await supabase
      .from("channels")
      .insert({
        server_id: serverId,
        name,
        description,
        type,
        position: newPosition,
      })
      .select("id")
      .single()

    if (channelError) {
      return {
        success: false,
        errors: { name: [channelError.message] },
      }
    }

    // Invalidate cache
    invalidateServerDetailsCache(serverId)

    // Revalidate specific paths
    revalidatePath(`/servers/${serverId}`);
    revalidatePath('/dashboard');
    channelIdToRedirect = channel.id
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: { name: ["Unauthorized to create channels in this server"] },
      }
    }
    console.error("Create channel error:", error)
    return {
      success: false,
      errors: { name: ["An unexpected error occurred. Please try again."] },
    }
  }

  if (channelIdToRedirect) {
    redirect(`/channels/${channelIdToRedirect}`)
  }
  return { success: true }
}


export async function updateChannel(channelId: string, prevState: any, formData: FormData) {
  const rawFormData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    type: formData.get("type") as string,
  }

  // Validate form data
  const validatedFields = updateChannelSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, description, type } = validatedFields.data

  try {
    await verifySession()
    const supabase = await createClient()

    // Get server_id for authorization check
    const { data: channelData, error: channelError } = await supabase
      .from("channels")
      .select("server_id")
      .eq("id", channelId)
      .single()

    if (channelError || !channelData) {
      return {
        success: false,
        errors: { name: ["Channel not found or inaccessible"] },
      }
    }

    // Check if the user has permission to manage this server (owner/admin)
    if (!(await canManageServer(channelData.server_id))) {
      return {
        success: false,
        errors: { name: ["Unauthorized to edit this channel"] },
      }
    }

    // Update channel
    const { error: updateError } = await supabase
      .from("channels")
      .update({
        name,
        description,
        type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", channelId)

    if (updateError) {
      return {
        success: false,
        errors: { name: [updateError.message] },
      }
    }

    // Invalidate cache
    invalidateServerDetailsCache(channelData.server_id)

    // Revalidate specific paths
    revalidatePath(`/channels/${channelId}`);
    revalidatePath(`/servers/${channelData.server_id}`);
    revalidatePath('/dashboard');
  
  }
  catch (error: any) {
    if (error.message === "Unauthorized") {
      return {
        success: false,
        errors: { name: ["Unauthorized to edit this channel"] },
      }
    }
    console.error("Update channel error:", error)
    return {
      success: false,
      errors: { name: ["An unexpected error occurred. Please try again."] },
    }
  }
  redirect(`/channels/${channelId}`);
  return { success : true }
}

export async function deleteChannel(channelId: string) {
  try {
    const supabase = await createClient();
        
  } catch (error) {
    
  }
}