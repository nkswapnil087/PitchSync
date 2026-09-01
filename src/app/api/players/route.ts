import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, logServerError } from "@/lib/api/responses";
import { paginationMetadata, paginationSchema } from "@/lib/api/pagination";
import { withOracleConnection, withOracleTransaction } from "@/lib/db/oracle";
import { listPlayers } from "@/lib/db/queries/players";
import { createPlayer } from "@/lib/db/queries/player-writes";
import { requireServerSession } from "@/lib/auth/server";
import { playerWriteSchema } from "@/lib/validation/player";

export const runtime = "nodejs";

const playerListSchema = paginationSchema.extend({
  q: z.string().trim().max(100).optional(),
  role: z.string().trim().max(50).optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  team: z.coerce.number().int().positive().transform(String).optional(),
  sort: z.enum(["name", "id", "role"]).default("name"),
});

export async function GET(request: Request) {
  const parameters = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = playerListSchema.safeParse(parameters);
  if (!parsed.success) return apiError("Invalid player registry filters.", 400);

  try {
    const result = await withOracleConnection((connection) => listPlayers(connection, parsed.data));
    return NextResponse.json({ data: result.data, pagination: paginationMetadata(parsed.data.page, parsed.data.pageSize, result.totalItems) });
  } catch (error) {
    logServerError("player registry", error);
    return apiError("Unable to load the player registry.");
  }
}

export async function POST(request: Request) {
  const session = await requireServerSession(["super-admin", "board-admin"]);
  if (!session) return apiError("You are not authorized to register players.", 403);
  const parsed = playerWriteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Player details are invalid.", 400);
  try {
    const playerId = await withOracleTransaction((connection) => createPlayer(connection, parsed.data, Number(session.personId)));
    return NextResponse.json({ data: { playerId: String(playerId) } }, { status: 201 });
  } catch (error) {
    logServerError("player registration", error);
    return apiError("Unable to register the player.");
  }
}
