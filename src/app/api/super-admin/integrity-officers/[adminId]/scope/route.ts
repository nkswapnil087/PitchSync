import { NextResponse } from "next/server";
import { z } from "zod";

import {
  apiError,
  logServerError,
} from "@/lib/api/responses";
import { requireServerSession } from "@/lib/auth/server";
import { withOracleTransaction } from "@/lib/db/oracle";
import { setIntegrityOfficerScope } from "@/lib/db/queries/integrity-access";

export const runtime = "nodejs";

const bodySchema = z.object({
  scope: z.enum([
    "MANAGER",
    "INVESTIGATOR",
  ]),
});

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ adminId: string }>;
  },
) {
  const session = await requireServerSession([
    "super-admin",
  ]);

  if (!session) {
    return apiError(
      "Super Administrator access is required.",
      403,
    );
  }

  const { adminId } = await context.params;

  const numericAdminId = Number(adminId);

  if (!Number.isInteger(numericAdminId)) {
    return apiError(
      "Invalid Integrity Officer.",
      400,
    );
  }

  const parsed = bodySchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return apiError(
      "Select a valid Integrity responsibility.",
      400,
    );
  }

  try {
    await withOracleTransaction(
      async (connection) => {
        await setIntegrityOfficerScope(
          connection,
          numericAdminId,
          parsed.data.scope,

          // no hard-coded 200001
          Number(session.personId),
        );
      },
    );

    return NextResponse.json({
      data: {
        adminId: numericAdminId,
        scope: parsed.data.scope,
      },
    });
  } catch (error) {
    logServerError(
      "update integrity officer scope",
      error,
    );

    return apiError(
      error instanceof Error
        ? error.message
        : "Unable to update responsibility.",
      400,
    );
  }
}