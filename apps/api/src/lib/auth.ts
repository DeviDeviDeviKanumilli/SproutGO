// JWT verification — the real authorization boundary (TECH_RISKS R3, SECURITY_AND_PRIVACY).
// The mobile app sends the Supabase session JWT as `Authorization: Bearer <token>`.
// We verify it with the project's JWT secret and resolve the caller's userId.
// Writes ALWAYS use this id — never a client-supplied userId.

import { jwtVerify } from "jose";
import { env } from "./env";
import { errors } from "./errors";

export interface AuthContext {
  userId: string;
}

/** Verify the Bearer token on a request and return the authenticated userId. */
export async function requireAuth(req: Request): Promise<AuthContext> {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw errors.unauthenticated("Missing Bearer token");
  }
  const token = header.slice("Bearer ".length).trim();

  let payload: Record<string, unknown>;
  try {
    const secret = new TextEncoder().encode(env.supabaseJwtSecret);
    // Defense-in-depth (Prisma bypasses RLS): constrain the issuer and audience to this
    // Supabase project's end-user tokens, not just a valid signature.
    const verified = await jwtVerify(token, secret, {
      // Normalize a possible trailing slash so SUPABASE_URL="https://x.supabase.co/" still
      // matches the real issuer "https://x.supabase.co/auth/v1".
      issuer: `${env.supabaseUrl.replace(/\/$/, "")}/auth/v1`,
      audience: "authenticated",
    });
    payload = verified.payload as Record<string, unknown>;
  } catch {
    throw errors.unauthenticated("Invalid or expired token");
  }

  // Reject service-role / non-end-user tokens even if signed with the same secret.
  if (payload.role !== "authenticated") {
    throw errors.unauthenticated("Token is not an authenticated end-user token");
  }

  // Supabase puts the auth user id in `sub`.
  const userId = typeof payload.sub === "string" ? payload.sub : null;
  if (!userId) {
    throw errors.unauthenticated("Token missing subject");
  }
  return { userId };
}
