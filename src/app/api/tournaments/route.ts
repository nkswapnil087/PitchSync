import { NextResponse } from "next/server";
import { z } from "zod";
import { paginationMetadata, paginationSchema } from "@/lib/api/pagination";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection } from "@/lib/db/oracle";
import { listTournaments } from "@/lib/db/queries/tournaments";

export const runtime = "nodejs";

const listSchema = paginationSchema.extend({ q: z.string().trim().max(100).optional(), tier: z.string().trim().max(20).optional(), sort: z.enum(["name", "id", "season"]).default("season") });

export async function GET(request: Request) {
  const parsed = listSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return apiError("Invalid tournament registry filters.", 400);
  try {
    const result = await withOracleConnection((connection) => listTournaments(connection, parsed.data));
    return NextResponse.json({ data: result.data, pagination: paginationMetadata(parsed.data.page, parsed.data.pageSize, result.totalItems) });
  } catch (error) {
    logServerError("tournament registry", error);
    return apiError("Unable to load the tournament registry.");
  }
}
