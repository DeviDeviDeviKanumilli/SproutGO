// Friend-visibility helper. Accepted friendships are materialized one row per pair
// (userAId < userBId), so the viewer may sit in either column — collect ids from both sides.
// Used by privacy-filtered reads (map bbox query, Library plant detail) to resolve who the
// caller is allowed to see FRIENDS-scoped content from.

import { prisma } from "@/lib/prisma";

export async function getFriendIds(userId: string): Promise<string[]> {
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    select: { userAId: true, userBId: true },
  });
  return friendships.map((f) => (f.userAId === userId ? f.userBId : f.userAId));
}
