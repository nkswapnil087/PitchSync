import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection } from "@/lib/db/oracle";
import { findPlayerPerformance } from "@/lib/db/queries/performance";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;
  if (!/^\d+$/.test(playerId)) return apiError("Invalid player reference.", 400);
  try {
    const data = await withOracleConnection((connection) => findPlayerPerformance(connection, Number(playerId)));
    if (!data) return apiError("Player performance record not found.", 404);
    return NextResponse.json({ data });
  } catch (error) {
    logServerError("player performance detail", error);
    return apiError("Unable to load this performance record.");
  }
}
