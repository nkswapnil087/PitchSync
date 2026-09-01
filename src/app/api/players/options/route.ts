import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection } from "@/lib/db/oracle";
import { listPlayerTeamOptions } from "@/lib/db/queries/players";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await withOracleConnection(listPlayerTeamOptions);
    return NextResponse.json({ data });
  } catch (error) {
    logServerError("player filter options", error);
    return apiError("Unable to load player filter options.");
  }
}
