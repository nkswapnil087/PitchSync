import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection } from "@/lib/db/oracle";
import { findTeamById } from "@/lib/db/queries/teams";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  if (!/^\d+$/.test(teamId)) return apiError("Invalid team reference.", 400);
  try {
    const data = await withOracleConnection((connection) => findTeamById(connection, Number(teamId)));
    if (!data) return apiError("Team record not found.", 404);
    return NextResponse.json({ data });
  } catch (error) {
    logServerError("team detail", error);
    return apiError("Unable to load this team record.");
  }
}
