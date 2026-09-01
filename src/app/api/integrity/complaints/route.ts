import { NextResponse } from "next/server";
import { z } from "zod";
import { paginationMetadata, paginationSchema } from "@/lib/api/pagination";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection } from "@/lib/db/oracle";
import { listComplaints } from "@/lib/db/queries/complaints";

export const runtime = "nodejs";
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const listSchema = paginationSchema.extend({ q: z.string().trim().max(200).optional(), source: z.string().trim().max(50).optional(), from: date.optional(), to: date.optional(), sort: z.enum(["received", "id", "source"]).default("received") });
export async function GET(request: Request) {
  const parsed = listSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return apiError("Invalid complaint registry filters.", 400);
  if (parsed.data.from && parsed.data.to && parsed.data.from > parsed.data.to) return apiError("Received-from date must not be after received-to date.", 400);
  try {
    const result = await withOracleConnection((connection) => listComplaints(connection, parsed.data));
    return NextResponse.json({ data: result.data, pagination: paginationMetadata(parsed.data.page, parsed.data.pageSize, result.totalItems) });
  } catch (error) {
    logServerError("complaint registry", error);
    return apiError("Unable to load the complaint registry.");
  }
}
