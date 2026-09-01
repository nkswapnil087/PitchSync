import { NextResponse } from "next/server";
import { z } from "zod";
import { paginationMetadata, paginationSchema } from "@/lib/api/pagination";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection } from "@/lib/db/oracle";
import { listMatches } from "@/lib/db/queries/matches";

export const runtime = "nodejs";
const listSchema = paginationSchema.extend({ q: z.string().trim().max(100).optional(), tournament: z.string().trim().max(100).optional(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), sort: z.enum(["date", "id", "tournament"]).default("date") });

export async function GET(request: Request) {
  const parsed = listSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return apiError("Invalid match registry filters.", 400);
  try {
    const result = await withOracleConnection((connection) => listMatches(connection, parsed.data));
    return NextResponse.json({ data: result.data, pagination: paginationMetadata(parsed.data.page, parsed.data.pageSize, result.totalItems) });
  } catch (error) {
    logServerError("match registry", error);
    return apiError("Unable to load the match registry.");
  }
}
