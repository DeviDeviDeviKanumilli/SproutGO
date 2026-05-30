// GET /api/v1/plantdex/me → the caller's discovered species + collection stats
// (API_CONTRACT §plantdex). Powers the PlantDex tab grid. Scoped to the authenticated
// userId; each entry embeds its resolved Plant so the badge grid renders in one fetch.

import { NextResponse } from "next/server";
import type { ProfileStats } from "@sproutgo/shared";
import { Rarity } from "@sproutgo/shared";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";
import { serializePlantDexEntry } from "@/lib/serializers";

export const dynamic = "force-dynamic";

async function computeStats(userId: string): Promise<ProfileStats> {
  const [profile, speciesDiscovered, photosSubmitted, rareFound, librarySize] =
    await Promise.all([
      prisma.profile.findUnique({ where: { id: userId }, select: { totalPoints: true } }),
      prisma.plantDexEntry.count({ where: { userId } }),
      prisma.observation.count({ where: { userId } }),
      prisma.plantDexEntry.count({
        where: { userId, plant: { rarity: { in: [Rarity.RARE, Rarity.LEGENDARY] } } },
      }),
      prisma.plant.count(),
    ]);
  const completionPct =
    librarySize > 0 ? Math.round((speciesDiscovered / librarySize) * 1000) / 10 : 0;
  return {
    speciesDiscovered,
    photosSubmitted,
    rareFound,
    totalPoints: profile?.totalPoints ?? 0,
    completionPct,
  };
}

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth(req);
    const [rows, stats] = await Promise.all([
      prisma.plantDexEntry.findMany({
        where: { userId },
        include: { plant: true },
        orderBy: { firstDiscoveredAt: "desc" },
      }),
      computeStats(userId),
    ]);
    return NextResponse.json({ entries: rows.map(serializePlantDexEntry), stats });
  } catch (err) {
    return errorResponse(err);
  }
}
