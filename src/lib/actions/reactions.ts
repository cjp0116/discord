'use server'
import { createClient } from "@/lib/supabase/server"
import { verifySession, canAccessChannel } from "@/lib/dal"
import { revalidatePath } from "next/cache"
import { addReactionSchema } from "@/lib/validations/reactions"


export async function addReaction(messageId: string, emoji: string) {
  try {
    const { user } = await verifySession()
    const supabase = await createClient()

    // Validate emoji
    const validatedFields = addReactionSchema.safeParse({ emoji })
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Get message and check channel access
    const { data: message } = await supabase.from("messages").select("channel_id").eq("id", messageId).single()

    if (!message || !(await canAccessChannel(message.channel_id))) {
      return {
        success: false,
        errors: { emoji: ["Unauthorized to react to this message"] },
      }
    }

    // Check if user already reacted with this emoji
    const { data: existingReaction } = await supabase
      .from("message_reactions")
      .select("id")
      .eq("message_id", messageId)
      .eq("user_id", user.id)
      .eq("emoji", emoji)
      .single()

    if (existingReaction) {
      // Remove reaction if it already exists
      await supabase.from("message_reactions").delete().eq("id", existingReaction.id)
    } else {
      // Add new reaction
      await supabase.from("message_reactions").insert({
        message_id: messageId,
        user_id: user.id,
        emoji: validatedFields.data.emoji,
      })
    }

    // Revalidate the specific channel page
    revalidatePath(`/channels/${message.channel_id}`)
    return { success: true }
  } catch (error: any) {
    console.error("Add reaction error:", error)
    return {
      success: false,
      errors: { emoji: ["Failed to add reaction"] },
    }
  }
}
