import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection } from "@/lib/db/oracle";
import { findCaseById } from "@/lib/db/queries/cases";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  if (!/^\d+$/.test(caseId)) return apiError("Invalid case reference.", 400);
  try {
    const data = await withOracleConnection((connection) => findCaseById(connection, Number(caseId)));
    if (!data) return apiError("Integrity case not found.", 404);
    return NextResponse.json({ data });
  } catch (error) {
    logServerError("integrity case detail", error);
    return apiError("Unable to load this integrity case.");
  }
}
