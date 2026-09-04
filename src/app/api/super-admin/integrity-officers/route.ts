import { NextResponse } from "next/server";

import {
  apiError,
  logServerError,
} from "@/lib/api/responses";
import { requireServerSession } from "@/lib/auth/server";
import { withOracleConnection } from "@/lib/db/oracle";
import { listIntegrityOfficers } from "@/lib/db/queries/integrity-access";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireServerSession([
    "super-admin",
  ]);

  if (!session) {
    return apiError(
      "Super Administrator access is required.",
      403,
    );
  }

  try {
    const officers = await withOracleConnection(
      listIntegrityOfficers,
    );

    return NextResponse.json({
      data: officers,
    });
  } catch (error) {
    logServerError(
      "load integrity officers",
      error,
    );

    return apiError(
      "Unable to load Integrity Officers.",
    );
  }
}