import { NextResponse } from "next/server";

export function apiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function logServerError(context: string, error: unknown) {
  const detail = error instanceof Error ? error.message : "Unknown server error";
  console.error(`[PitchSync] ${context}: ${detail}`);
}
