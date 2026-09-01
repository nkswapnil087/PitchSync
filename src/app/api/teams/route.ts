import { NextResponse } from "next/server";
import { z } from "zod";
import { paginationMetadata, paginationSchema } from "@/lib/api/pagination";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection } from "@/lib/db/oracle";
import { listTeams } from "@/lib/db/queries/teams";

export const runtime = "nodejs";

const teamListSchema = paginationSchema.extend({
  q: z.string().trim().max(100).optional(),
  ownership: z.enum(["franchise", "board"]).optional(),
  sort: z.enum(["name", "id", "category"]).default("name"),
});

export async function GET(request: Request) {
  const parsed = teamListSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return apiError("Invalid team registry filters.", 400);
  try {
    const result = await withOracleConnection((connection) => listTeams(connection, parsed.data));
    return NextResponse.json({ data: result.data, pagination: paginationMetadata(parsed.data.page, parsed.data.pageSize, result.totalItems) });
  } catch (error) {
    logServerError("team registry", error);
    return apiError("Unable to load the team registry.");
  }
}
