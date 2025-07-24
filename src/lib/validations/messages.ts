import { z } from "zod"

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message must be less than 2000 characters"),
})

export const editMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message must be less than 2000 characters"),
})

export type SendMessageFormData = z.infer<typeof sendMessageSchema>
export type EditMessageFormData = z.infer<typeof editMessageSchema>
