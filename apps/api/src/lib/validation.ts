// Request-body validation schemas (zod) — validated at every route boundary
// (SECURITY_AND_PRIVACY §input hardening). Never trust a client-supplied userId.

import { z } from "zod";

// Server-side 13+ attestation (SECURITY_AND_PRIVACY §audience). The client signup check
// is UX-only and bypassable, so age is enforced here at profile creation.
const atLeast13 = (dob: string): boolean => {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 13);
  return d <= cutoff;
};

export const createProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores"),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "dateOfBirth must be YYYY-MM-DD")
    .refine(atLeast13, "You must be at least 13 years old to use SproutGo"),
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

// POST /observations — the capture→identify pipeline input (API_CONTRACT §observations).
// imagePath is a Supabase Storage path; the route additionally enforces that it lives
// under the caller's own prefix (never trust the client to scope itself).
export const createObservationSchema = z.object({
  imagePath: z.string().trim().min(1, "imagePath is required"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  privacy: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]).optional(),
});

export type CreateObservationInput = z.infer<typeof createObservationSchema>;

// PATCH /observations/:id — owner changes the visibility of an existing capture.
export const updateObservationSchema = z.object({
  privacy: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]),
});

export type UpdateObservationInput = z.infer<typeof updateObservationSchema>;

// GET /observations?bbox=minLng,minLat,maxLng,maxLat — map bounding-box query.
// Parse the CSV string into this shape before validating.
export const bboxSchema = z
  .object({
    minLng: z.number().min(-180).max(180),
    minLat: z.number().min(-90).max(90),
    maxLng: z.number().min(-180).max(180),
    maxLat: z.number().min(-90).max(90),
  })
  .refine((b) => b.minLng <= b.maxLng && b.minLat <= b.maxLat, {
    message: "bbox min must be <= max",
  });

export type BboxInput = z.infer<typeof bboxSchema>;

// Parse a `bbox=minLng,minLat,maxLng,maxLat` query string into validated numbers.
// Returns null on any malformed/out-of-range input so the route can 400.
export function parseBbox(raw: string | null): BboxInput | null {
  if (!raw) return null;
  const parts = raw.split(",").map((s) => Number(s.trim()));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  const [minLng, minLat, maxLng, maxLat] = parts;
  const parsed = bboxSchema.safeParse({ minLng, minLat, maxLng, maxLat });
  return parsed.success ? parsed.data : null;
}
