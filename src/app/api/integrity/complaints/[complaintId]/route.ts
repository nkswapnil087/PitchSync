import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection } from "@/lib/db/oracle";
import { findComplaintById } from "@/lib/db/queries/complaints";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ complaintId: string }> }) {
  const { complaintId } = await params;
  if (!/^\d+$/.test(complaintId)) return apiError("Invalid complaint reference.", 400);
  try {
    const data = await withOracleConnection((connection) => findComplaintById(connection, Number(complaintId)));
    if (!data) return apiError("Complaint record not found.", 404);
    return NextResponse.json({ data });
  } catch (error) {
    logServerError("complaint detail", error);
    return apiError("Unable to load this complaint record.");
  }
}
