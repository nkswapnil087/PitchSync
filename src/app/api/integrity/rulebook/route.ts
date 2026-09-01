import { NextResponse } from "next/server";
import { z } from "zod";
import { paginationMetadata, paginationSchema } from "@/lib/api/pagination";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection } from "@/lib/db/oracle";
import { listRules } from "@/lib/db/queries/rulebook";

export const runtime = "nodejs";
const listSchema = paginationSchema.extend({ q: z.string().trim().max(100).optional(), category: z.string().trim().max(50).optional(), sort: z.enum(["clause", "id", "category"]).default("clause") });
export async function GET(request: Request) {
  const parsed = listSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return apiError("Invalid rulebook filters.", 400);
  try {
    const result = await withOracleConnection((connection) => listRules(connection, parsed.data));
    return NextResponse.json({ data: result.data, pagination: paginationMetadata(parsed.data.page, parsed.data.pageSize, result.totalItems) });
  } catch (error) {
    logServerError("rulebook registry", error);
    return apiError("Unable to load the rulebook.");
  }
}
