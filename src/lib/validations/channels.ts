import { z } from "zod"

export const createChannelSchema = z.object({
  name: z
    .string()
    .min(1, "Channel name is required")
    .max(100, "Channel name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Channel name can only contain letters, numbers, spaces, hyphens, and underscores"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  type: z.enum(["text", "voice"]).default("text"),
})

export const updateChannelSchema = z.object({
  name: z
    .string()
    .min(1, "Channel name is required")
    .max(100, "Channel name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Channel name can only contain letters, numbers, spaces, hyphens, and underscores"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  type: z.enum(["text", "voice"]).default("text"),
})
export type CreateChannelFormData = z.infer<typeof createChannelSchema>
export type UpdateChannelFormData = z.infer<typeof updateChannelSchema>
