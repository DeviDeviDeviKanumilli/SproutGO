// GET /api/v1/profile/:id — public profile view of another user.
// API_CONTRACT §auth/profile. Auth required; returns the public projection (no admin flag).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { errors, errorResponse } from "@/lib/errors";
import { serializePublicProfile } from "@/lib/serializers";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    await requireAuth(req);
    const profile = await prisma.profile.findUnique({ where: { id: params.id } });
    if (!profile) {
      throw errors.notFound("Profile not found");
    }
    return NextResponse.json(serializePublicProfile(profile));
  } catch (err) {
    return errorResponse(err);
  }
}
