import { NextResponse } from "next/server";
import { apiError, logServerError } from "@/lib/api/responses";
import { queryRows, withOracleConnection } from "@/lib/db/oracle";

type HealthRow = {
  SESSION_USER: string;
  CONTAINER_NAME: string;
};

const healthSql = `
  SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') AS session_user,
         SYS_CONTEXT('USERENV', 'CON_NAME') AS container_name
  FROM dual
`;

export async function GET() {
  try {
    const health = await withOracleConnection(async (connection) => {
      const [row] = await queryRows<HealthRow>(connection, healthSql);
      return row;
    });

    if (!health) return apiError("Database health information is unavailable.", 503);

    return NextResponse.json({
      data: {
        status: "ok",
        sessionUser: health.SESSION_USER,
        containerName: health.CONTAINER_NAME,
      },
    });
  } catch (error) {
    logServerError("database health check failed", error);
    return apiError("Database connection is unavailable.", 503);
  }
}
