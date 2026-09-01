import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isRoleId } from "@/config/roles";
import type { RoleId } from "@/features/auth/types";
import { apiError, logServerError } from "@/lib/api/responses";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/token";
import { withOracleTransaction } from "@/lib/db/oracle";
import { findLoginAccount, recordSuccessfulLogin } from "@/lib/db/queries/auth";

export const runtime = "nodejs";
const loginSchema = z.object({ identifier: z.string().trim().min(1).max(100), password: z.string().min(1).max(200), role: z.custom<RoleId>(isRoleId) });

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Enter a valid username, password, and role.", 400);
  try {
    const account = await withOracleTransaction(async (connection) => {
      const candidate = await findLoginAccount(connection, parsed.data.identifier);
      if (!candidate || candidate.role !== parsed.data.role || !(await compare(parsed.data.password, candidate.passwordHash))) return null;
      await recordSuccessfulLogin(connection, Number(candidate.accountId));
      return candidate;
    });
    if (!account) return apiError("The credentials or selected role are incorrect.", 401);
    const session = { accountId: account.accountId, personId: account.personId, username: account.username, fullName: account.fullName, role: account.role };
    const token = await createSessionToken(session);
    const response = NextResponse.json({ data: session });
    response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE_SECONDS });
    return response;
  } catch (error) {
    logServerError("sign in", error);
    return apiError("Unable to sign in right now.");
  }
}
