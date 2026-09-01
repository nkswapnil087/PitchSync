import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection } from "@/lib/db/oracle";
import { findTournamentById } from "@/lib/db/queries/tournaments";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params;
  if (!/^\d+$/.test(tournamentId)) return apiError("Invalid tournament reference.", 400);
  try {
    const data = await withOracleConnection((connection) => findTournamentById(connection, Number(tournamentId)));
    if (!data) return apiError("Tournament record not found.", 404);
    return NextResponse.json({ data });
  } catch (error) {
    logServerError("tournament detail", error);
    return apiError("Unable to load this tournament record.");
  }
}
