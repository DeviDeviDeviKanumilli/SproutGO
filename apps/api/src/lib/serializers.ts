// Serializers: Prisma rows → API wire shapes (dates as ISO strings, etc.).

import type {
  Profile as ProfileRow,
  Plant as PlantRow,
  Observation as ObservationRow,
} from "@sproutgo/db";
import type {
  Profile,
  ProfileStats,
  ProfileWithStats,
  Plant,
  Observation,
} from "@sproutgo/shared";

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
