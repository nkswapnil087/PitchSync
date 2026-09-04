import "server-only";

import { cookies } from "next/headers";
import type { AuthSession, RoleId } from "@/features/auth/types";
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

export type IntegrityManagerSession = AuthSession & {
  role: "integrity-officer";
  integrityScope: "MANAGER";
};

export type IntegrityInvestigatorSession = AuthSession & {
  role: "integrity-officer";
  integrityScope: "INVESTIGATOR";
};

export async function requireIntegrityManager(): Promise<IntegrityManagerSession | null> {
  const session = await requireServerSession(["integrity-officer"]);
  if (!session || session.integrityScope !== "MANAGER") return null;
  return session as IntegrityManagerSession;
}

export async function requireIntegrityInvestigator(): Promise<IntegrityInvestigatorSession | null> {
  const session = await requireServerSession(["integrity-officer"]);
  if (!session || session.integrityScope !== "INVESTIGATOR") return null;
  return session as IntegrityInvestigatorSession;
}
