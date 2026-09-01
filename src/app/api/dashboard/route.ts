import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api/responses";
import { requireServerSession } from "@/lib/auth/server";
import { withOracleConnection } from "@/lib/db/oracle";
import { getDashboardOverview } from "@/lib/db/queries/dashboard";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireServerSession();
  if (!session) return apiError("Authentication required.", 401);
  try {
    const data = await withOracleConnection((connection) => getDashboardOverview(connection, session.role, Number(session.personId)));
    return NextResponse.json({ data });
  } catch (error) {
    logServerError("dashboard overview", error);
    return apiError("Unable to load the dashboard overview.");
  }
}
