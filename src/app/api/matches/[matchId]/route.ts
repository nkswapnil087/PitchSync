import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection } from "@/lib/db/oracle";
import { findMatchById } from "@/lib/db/queries/matches";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  if (!/^\d+$/.test(matchId)) return apiError("Invalid match reference.", 400);
  try {
    const data = await withOracleConnection((connection) => findMatchById(connection, Number(matchId)));
    if (!data) return apiError("Match record not found.", 404);
    return NextResponse.json({ data });
  } catch (error) {
    logServerError("match detail", error);
    return apiError("Unable to load this match record.");
  }
}
