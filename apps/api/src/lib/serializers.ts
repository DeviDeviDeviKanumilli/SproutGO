// Serializers: Prisma rows → API wire shapes (dates as ISO strings, etc.).

import type { Profile as ProfileRow } from "@sproutgo/db";
import type { Profile, ProfileStats, ProfileWithStats } from "@sproutgo/shared";

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
