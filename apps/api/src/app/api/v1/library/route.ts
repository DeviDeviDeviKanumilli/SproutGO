// GET /api/v1/library?q=&type=&rarity=&native=&sort=&limit=&offset=
// The global Library browse/search (API_CONTRACT §plantdex/library, design §8.10). Faceted
// filters hit the Plant B-tree indexes; `q` is a case-insensitive name match (no FTS for MVP).
// The Library is small (a few hundred seeded species), so we apply the chosen sort — including
// the rarity-tier order Prisma's alphabetical enum sort can't express — and paginate the
// filtered set in-memory, returning `total` for the client.

import { NextResponse } from "next/server";
import type { LibraryResponse, Plant } from "@sproutgo/shared";
import { Rarity } from "@sproutgo/shared";
import { Prisma } from "@sproutgo/db";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { errors, errorResponse } from "@/lib/errors";
import { parseLibraryQuery, type LibrarySort } from "@/lib/validation";
import { serializePlant } from "@/lib/serializers";

export const dynamic = "force-dynamic";

// Rarest first for the "rarity" sort (design: rare species stand out).
const RARITY_RANK: Record<Rarity, number> = {
  [Rarity.LEGENDARY]: 0,
  [Rarity.RARE]: 1,
  [Rarity.UNCOMMON]: 2,
  [Rarity.COMMON]: 3,
};

export function compareBy(sort: LibrarySort) {
  return (a: Plant, b: Plant): number => {
    if (sort === "rarity") {
      const r = RARITY_RANK[a.rarity] - RARITY_RANK[b.rarity];
      if (r !== 0) return r;
    } else if (sort === "recent") {
      const t = b.createdAt.localeCompare(a.createdAt); // ISO strings sort chronologically
      if (t !== 0) return t;
    }
    // Stable, human-friendly tiebreak: common name (fallback scientific), case-insensitive.
    const an = (a.commonName ?? a.scientificName).toLowerCase();
    const bn = (b.commonName ?? b.scientificName).toLowerCase();
    return an.localeCompare(bn);
  };
}

export async function GET(req: Request): Promise<NextResponse> {
  try {
    await requireAuth(req);

    const query = parseLibraryQuery(new URL(req.url).searchParams);
    if (!query) {
      throw errors.validation("Invalid library query parameters");
    }
    const { q, type, rarity, native, sort, limit, offset } = query;

    const where: Prisma.PlantWhereInput = {};
    if (type) where.type = type;
    if (rarity) where.rarity = rarity;
    if (native) where.nativeStatus = native;
    if (q) {
      where.OR = [
        { commonName: { contains: q, mode: "insensitive" } },
        { scientificName: { contains: q, mode: "insensitive" } },
      ];
    }

    const rows = await prisma.plant.findMany({ where });
    const plants = rows.map(serializePlant).sort(compareBy(sort));
    const page = plants.slice(offset, offset + limit);

    const body: LibraryResponse = { plants: page, total: plants.length, limit, offset };
    return NextResponse.json(body);
  } catch (err) {
    return errorResponse(err);
  }
}
