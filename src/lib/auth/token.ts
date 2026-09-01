import { jwtVerify, SignJWT } from "jose";
import { isRoleId } from "@/config/roles";
import type { AuthSession } from "@/features/auth/types";

export const SESSION_COOKIE = "pitchsync_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("Authentication secret is incomplete.");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(session: AuthSession) {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined): Promise<AuthSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.accountId !== "string" || typeof payload.personId !== "string" || typeof payload.username !== "string" || typeof payload.fullName !== "string" || !isRoleId(payload.role)) return null;
    return { accountId: payload.accountId, personId: payload.personId, username: payload.username, fullName: payload.fullName, role: payload.role };
  } catch {
    return null;
  }
}
