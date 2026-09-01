import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api/responses";
import { withOracleConnection, withOracleTransaction } from "@/lib/db/oracle";
import { findPlayerById } from "@/lib/db/queries/players";
import { softDeletePlayer, updatePlayer } from "@/lib/db/queries/player-writes";
import { requireServerSession } from "@/lib/auth/server";
import { playerWriteSchema } from "@/lib/validation/player";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;
  if (!/^\d+$/.test(playerId)) return apiError("Invalid player reference.", 400);

  try {
    const data = await withOracleConnection((connection) => findPlayerById(connection, Number(playerId)));
    if (!data) return apiError("Player record not found.", 404);
    return NextResponse.json({ data });
  } catch (error) {
    logServerError("player profile", error);
    return apiError("Unable to load this player record.");
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ playerId: string }> }) {
  const session = await requireServerSession(["super-admin", "board-admin"]);
  if (!session) return apiError("You are not authorized to update players.", 403);
  const { playerId } = await params;
  if (!/^\d+$/.test(playerId)) return apiError("Invalid player reference.", 400);
  const parsed = playerWriteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Player details are invalid.", 400);
  try {
    const updated = await withOracleTransaction((connection) => updatePlayer(connection, Number(playerId), parsed.data, Number(session.personId)));
    if (!updated) return apiError("Player record not found.", 404);
    return NextResponse.json({ data: { playerId } });
  } catch (error) {
    logServerError("player update", error);
    return apiError("Unable to update this player record.");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ playerId: string }> }) {
  const session = await requireServerSession(["super-admin", "board-admin"]);
  if (!session) return apiError("You are not authorized to remove players.", 403);
  const { playerId } = await params;
  if (!/^\d+$/.test(playerId)) return apiError("Invalid player reference.", 400);
  if (playerId === session.personId) return apiError("You cannot remove your own account record.", 400);
  try {
    const deleted = await withOracleTransaction((connection) => softDeletePlayer(connection, Number(playerId), Number(session.personId)));
    if (!deleted) return apiError("Player record not found.", 404);
    return NextResponse.json({ data: { playerId, softDeleted: true } });
  } catch (error) {
    logServerError("player soft delete", error);
    return apiError("Unable to remove this player record.");
  }
}
