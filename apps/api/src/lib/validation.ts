// Request-body validation schemas (zod) — validated at every route boundary
// (SECURITY_AND_PRIVACY §input hardening). Never trust a client-supplied userId.

import { z } from "zod";

export const createProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores"),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(300).optional(),
});

export const updateProfileSchema = z
  .object({
    username: createProfileSchema.shape.username.optional(),
    avatarUrl: z.string().url().optional(),
    bio: z.string().max(300).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
