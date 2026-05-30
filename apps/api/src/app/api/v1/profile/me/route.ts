// GET  /api/v1/profile/me  → caller's Profile + stats
// PATCH /api/v1/profile/me → update own profile (username / avatarUrl / bio)
// API_CONTRACT §auth/profile. All reads/writes scope to the authenticated userId.

import { NextResponse } from "next/server";
import { Prisma } from "@sproutgo/db";
import type { ProfileStats } from "@sproutgo/shared";
import { Rarity } from "@sproutgo/shared";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { errors, errorResponse } from "@/lib/errors";
import { updateProfileSchema } from "@/lib/validation";
import { serializeProfile, serializeProfileWithStats } from "@/lib/serializers";

export const dynamic = "force-dynamic";

async function computeStats(userId: string, totalPoints: number): Promise<ProfileStats> {
  const [speciesDiscovered, photosSubmitted, rareFound, librarySize] = await Promise.all([
    prisma.plantDexEntry.count({ where: { userId } }),
    prisma.observation.count({ where: { userId } }),
    prisma.plantDexEntry.count({
      where: { userId, plant: { rarity: { in: [Rarity.RARE, Rarity.LEGENDARY] } } },
    }),
    prisma.plant.count(),
  ]);
  const completionPct =
    librarySize > 0 ? Math.round((speciesDiscovered / librarySize) * 1000) / 10 : 0;
  return { speciesDiscovered, photosSubmitted, rareFound, totalPoints, completionPct };
}

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth(req);
    const profile = await prisma.profile.findUnique({ where: { id: userId } });
    if (!profile) {
      throw errors.notFound("Profile not found");
    }
    const stats = await computeStats(userId, profile.totalPoints);
    return NextResponse.json(serializeProfileWithStats(profile, stats));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth(req);
    const parsed = updateProfileSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      throw errors.validation(parsed.error.issues[0]?.message ?? "Invalid body");
    }
    try {
      const updated = await prisma.profile.update({
        where: { id: userId },
        data: parsed.data,
      });
      return NextResponse.json(serializeProfile(updated));
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") throw errors.conflict("Username taken");
        if (e.code === "P2025") throw errors.notFound("Profile not found");
      }
      throw e;
    }
  } catch (err) {
    return errorResponse(err);
  }
}
