import { NextResponse } from "next/server";
import { z } from "zod";
import { paginationMetadata, paginationSchema } from "@/lib/api/pagination";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection } from "@/lib/db/oracle";
import { listCases } from "@/lib/db/queries/cases";

export const runtime = "nodejs";
const listSchema = paginationSchema.extend({ q: z.string().trim().max(100).optional(), status: z.string().trim().max(30).optional(), opened: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), sort: z.enum(["opened", "id", "status"]).default("opened") });
export async function GET(request: Request) {
  const parsed = listSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return apiError("Invalid integrity case filters.", 400);
  try {
    const result = await withOracleConnection((connection) => listCases(connection, parsed.data));
    return NextResponse.json({ data: result.data, pagination: paginationMetadata(parsed.data.page, parsed.data.pageSize, result.totalItems) });
  } catch (error) {
    logServerError("integrity case registry", error);
    return apiError("Unable to load integrity cases.");
  }
}
