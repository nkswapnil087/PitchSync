import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection } from "@/lib/db/oracle";
import { findPlayerById } from "@/lib/db/queries/players";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;
  if (!/^\d+$/.test(playerId)) return apiError("Invalid player reference.", 400);

  try {
    const data = await withOracleConnection((connection) => findPlayerById(connection, Number(playerId)));
    if (!data) return apiError("Player record not found.", 404);
    return NextResponse.json({ data });
  } catch (error) {
    logServerError("player profile", error);
    return apiError("Unable to load this player record.");
  }
}
