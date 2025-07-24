import { z } from 'zod';

export const createServerSchema = z.object({
  name: z
    .string()
  .min(1, 'Server name is required')
    .max(100, 'Server name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Server name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z
    .string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  image: z
    .string()
    .url('Invalid image URL')
    .optional(),
});

export const joinServerSchema = z.object({
  inviteCode: z
    .string()
    .min(6, "Invite code must be at least 6 characters")
    .max(10, "Invite code must be less than 10 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Invite code can only contain letters and numbers"),
});

export const updateServerSchema = z.object({
  name: z.string().min(1, "Server name is required").max(100, "Server name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

export type CreateServerSchema = z.infer<typeof createServerSchema>
export type JoinServerSchema = z.infer<typeof joinServerSchema>
export type UpdateServerSchema = z.infer<typeof updateServerSchema>
