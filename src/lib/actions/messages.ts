'use server';

import { createClient } from "@/lib/supabase/server"
import { verifySession, canAccessChannel } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { editMessageSchema, sendMessageSchema } from "@/lib/validations/messages";
import { invalidateMessagesCache } from "@/lib/utils/cache-invalidation";

export async function sendMessage(channelId: string, content: string) {
  const { user } = await verifySession();
  const validatedFields = sendMessageSchema.safeParse({ content });
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  if (!(await canAccessChannel(channelId))) {
    return {
      success: false,
      errors: { content: ['Unauthorized to send message in this channel'] }
    }
  }
  const supabase = await createClient();
  const { error } = await supabase.from('messages').insert({
    channel_id: channelId,
    user_id: user.id,
    content: validatedFields.data.content,
  });
  const { data: serverId } = await supabase.from('channels').select('server_id').eq('id', channelId).single();
  if (error) {
    return {
      success: false,
      errors: { content: [error.message] },
    }
  }

  // Invalidate cache - this should trigger client-side refetch
  invalidateMessagesCache(channelId)

  // Revalidate the specific channel page and related paths
  revalidatePath(`/channels/${channelId}`);
  revalidatePath('/dashboard');
  return {
    success: true,
  }
}

export async function editMessage(messageId: string, content: string) {
  const { user } = await verifySession();
  const validatedFields = editMessageSchema.safeParse({ content });
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  const supabase = await createClient();
  const { data: message } = await supabase.from('messages').select('user_id, channel_id').eq('id', messageId).single();
  if (!message || message.user_id !== user.id) {
    return {
      success: false,
      errors: { content: ['Unauthorized to edit this message'] }
    }
  }
  const { error } = await supabase.from('messages').update({ content: validatedFields.data.content, edited_at: new Date().toISOString() }).eq('id', messageId);
  if (error) {
    return {
      success: false,
      errors: { content: [error.message] }
    }
  }

  // Invalidate cache - this should trigger client-side refetch
  invalidateMessagesCache(message.channel_id)

  // Revalidate the specific channel page
  revalidatePath(`/channels/${message.channel_id}`);
  return { success: true }
}


export async function deleteMessage(messageId: string) {
  const { user } = await verifySession()
  const supabase = await createClient()

  // Check if user owns the message
  const { data: message } = await supabase.from("messages").select("user_id, channel_id").eq("id", messageId).single()

  if (!message || message.user_id !== user.id) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("messages").delete().eq("id", messageId)

  if (error) {
    throw new Error(error.message)
  }

  // Invalidate cache - this should trigger client-side refetch
  invalidateMessagesCache(message.channel_id)

  // Revalidate the specific channel page
  revalidatePath(`/channels/${message.channel_id}`)
}
