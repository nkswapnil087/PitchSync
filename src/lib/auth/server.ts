import "server-only";

import { cookies } from "next/headers";
import type { RoleId } from "@/features/auth/types";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";

export async function getServerSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireServerSession(allowedRoles?: readonly RoleId[]) {
  const session = await getServerSession();
  if (!session || (allowedRoles && !allowedRoles.includes(session.role))) return null;
  return session;
}
