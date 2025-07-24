import { z } from "zod"

export const addReactionSchema = z.object({
  emoji: z.string().min(1, "Emoji is required").max(10, "Emoji must be less than 10 characters"),
})

export type AddReactionFormData = z.infer<typeof addReactionSchema>
