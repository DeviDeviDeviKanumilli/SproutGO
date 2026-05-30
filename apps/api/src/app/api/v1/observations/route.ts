// POST /api/v1/observations — the core capture→identify→score→PlantDex pipeline
// (API_CONTRACT §observations, AI_INTEGRATION.md). Verifies the caller, identifies the
// species via the swappable PlantIdentifier, matches/auto-creates the Library Plant,
// enforces the daily same-species quota, awards points, and upserts the PlantDexEntry —
// all transactionally so Profile.totalPoints and timesObserved never drift.

import { NextResponse } from "next/server";
import { Prisma, IdSource, IdStatus } from "@sproutgo/db";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { errors, errorResponse } from "@/lib/errors";
import { createObservationSchema } from "@/lib/validation";
import { serializePlant, serializeObservation } from "@/lib/serializers";
import {
  MIN_AUTO_CREATE_CONFIDENCE,
  SCORING,
  firstDiscoveryPoints,
  duplicatePoints,
} from "@/config/scoring";
import { getPlantIdentifier } from "@/lib/identify";
import type { ObservationResult } from "@sproutgo/shared";

export const dynamic = "force-dynamic";

function startOfUtcDay(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth(req);
    const parsed = createObservationSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      throw errors.validation(parsed.error.issues[0]?.message ?? "Invalid body");
    }
    const { imagePath, latitude, longitude, privacy } = parsed.data;

    // R3: the API is the real auth boundary. The storage path must live under the
    // caller's own prefix — never trust the client to scope its own uploads.
    if (!imagePath.startsWith(`${userId}/`)) {
      throw errors.forbidden("imagePath must be under your own storage prefix");
    }

    // Identify outside the transaction — it may hit the network (OpenAI) and we
    // don't want to hold a DB transaction open across that latency.
    const idResult = await getPlantIdentifier().identify(imagePath);

    const result = await prisma.$transaction(async (tx): Promise<ObservationResult> => {
      // Create the observation up front (PENDING) so every capture is recorded,
      // even uncertain ones or those over quota.
      const observation = await tx.observation.create({
        data: {
          userId,
          imagePath,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          privacy: privacy ?? undefined,
          idStatus: IdStatus.PENDING,
        },
      });

      // --- Match / auto-create the Library Plant (AI_INTEGRATION.md branching) ---
      let plant = await tx.plant.findUnique({
        where: { scientificName: idResult.scientificName },
      });

      if (!plant && idResult.confidence >= MIN_AUTO_CREATE_CONFIDENCE && idResult.scientificName) {
        plant = await tx.plant.create({
          data: {
            scientificName: idResult.scientificName,
            commonName: idResult.commonName,
            family: idResult.family,
            source: IdSource.OPENAI,
            confidence: idResult.confidence,
          },
        });
      }

      // Confidence too low and no existing match → UNCERTAIN: record, award nothing,
      // no PlantDex unlock until the user confirms.
      if (!plant) {
        const updated = await tx.observation.update({
          where: { id: observation.id },
          data: { confidence: idResult.confidence, idStatus: IdStatus.UNCERTAIN },
        });
        return {
          observation: serializeObservation(updated),
          plant: null,
          confidence: idResult.confidence,
          isFirstDiscovery: false,
          pointsAwarded: 0,
          idStatus: IdStatus.UNCERTAIN,
        };
      }

      // --- Score + PlantDex upsert (POINTS_AND_RARITY.md) ---
      const existing = await tx.plantDexEntry.findUnique({
        where: { userId_plantId: { userId, plantId: plant.id } },
      });
      const isFirstDiscovery = !existing;

      // Daily same-species quota. The just-created observation still has a null
      // plantId, so it isn't counted here; priorToday = earlier matched captures today.
      const priorToday = await tx.observation.count({
        where: { userId, plantId: plant.id, createdAt: { gte: startOfUtcDay() } },
      });
      const quotaReached = priorToday >= SCORING.dailySameSpeciesCap;

      let pointsAwarded = 0;
      if (!quotaReached) {
        pointsAwarded = isFirstDiscovery
          ? firstDiscoveryPoints(plant.rarity)
          : duplicatePoints(plant.rarity, existing.timesObserved);
      }

      if (isFirstDiscovery) {
        await tx.plantDexEntry.create({
          data: { userId, plantId: plant.id, firstObservationId: observation.id },
        });
      } else {
        await tx.plantDexEntry.update({
          where: { userId_plantId: { userId, plantId: plant.id } },
          data: { timesObserved: { increment: 1 } },
        });
      }

      const updated = await tx.observation.update({
        where: { id: observation.id },
        data: {
          plantId: plant.id,
          confidence: idResult.confidence,
          idStatus: IdStatus.MATCHED,
          pointsAwarded,
        },
      });

      if (pointsAwarded > 0) {
        await tx.profile.update({
          where: { id: userId },
          data: { totalPoints: { increment: pointsAwarded } },
        });
      }

      return {
        observation: serializeObservation(updated),
        plant: serializePlant(plant),
        confidence: idResult.confidence,
        isFirstDiscovery,
        pointsAwarded,
        idStatus: IdStatus.MATCHED,
        quotaReached,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
