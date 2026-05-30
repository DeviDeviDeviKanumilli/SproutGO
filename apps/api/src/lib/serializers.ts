// Serializers: Prisma rows → API wire shapes (dates as ISO strings, etc.).

import type {
  Profile as ProfileRow,
  Plant as PlantRow,
  Observation as ObservationRow,
  PlantDexEntry as PlantDexEntryRow,
} from "@sproutgo/db";
import type {
  Profile,
  ProfileStats,
  ProfileWithStats,
  Plant,
  Observation,
  PlantDexEntry,
  ObservationMarker,
} from "@sproutgo/shared";
import { snapToGrid, shouldFuzz } from "./geo";

export function serializeProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    avatarUrl: row.avatarUrl,
    bio: row.bio,
    totalPoints: row.totalPoints,
    isAdmin: row.isAdmin,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeProfileWithStats(
  row: ProfileRow,
  stats: ProfileStats,
): ProfileWithStats {
  return { ...serializeProfile(row), stats };
}

// Public projection — hides admin flag from non-self views.
export function serializePublicProfile(row: ProfileRow): Omit<Profile, "isAdmin"> {
  const { isAdmin: _omit, ...rest } = serializeProfile(row);
  return rest;
}

export function serializePlant(row: PlantRow): Plant {
  return {
    id: row.id,
    scientificName: row.scientificName,
    commonName: row.commonName,
    family: row.family,
    genus: row.genus,
    type: row.type,
    description: row.description,
    habitat: row.habitat,
    nativeStatus: row.nativeStatus,
    rarity: row.rarity,
    imageUrl: row.imageUrl,
    source: row.source,
    confidence: row.confidence,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeObservation(row: ObservationRow): Observation {
  return {
    id: row.id,
    userId: row.userId,
    plantId: row.plantId,
    imagePath: row.imagePath,
    latitude: row.latitude,
    longitude: row.longitude,
    confidence: row.confidence,
    idStatus: row.idStatus,
    privacy: row.privacy,
    pointsAwarded: row.pointsAwarded,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializePlantDexEntry(
  row: PlantDexEntryRow & { plant: PlantRow },
): PlantDexEntry {
  return {
    id: row.id,
    plantId: row.plantId,
    firstDiscoveredAt: row.firstDiscoveredAt.toISOString(),
    timesObserved: row.timesObserved,
    plant: serializePlant(row.plant),
  };
}

// A map pin for GET /observations?bbox=. The viewer's own observations always carry
// exact coordinates; for everyone else, rare/sensitive plant coords are snapped to a
// grid before they leave the backend (R3: fuzzing must happen server-side). Rows are
// pre-filtered to have non-null lat/long and a linked plant.
export function serializeObservationMarker(
  row: ObservationRow & { plant: PlantRow | null },
  viewerId: string,
): ObservationMarker {
  const isOwn = row.userId === viewerId;
  const rarity = row.plant?.rarity ?? null;
  const fuzz = !isOwn && shouldFuzz(rarity, row.plant?.nativeStatus ?? null);

  let latitude = row.latitude as number;
  let longitude = row.longitude as number;
  if (fuzz) {
    ({ latitude, longitude } = snapToGrid(latitude, longitude));
  }

  return {
    id: row.id,
    plantId: row.plantId,
    latitude,
    longitude,
    rarity,
    isOwn,
    fuzzed: fuzz,
    plant: row.plant
      ? {
          id: row.plant.id,
          commonName: row.plant.commonName,
          scientificName: row.plant.scientificName,
          rarity: row.plant.rarity,
          imageUrl: row.plant.imageUrl,
        }
      : null,
    createdAt: row.createdAt.toISOString(),
  };
}
