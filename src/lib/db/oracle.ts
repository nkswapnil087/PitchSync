import "server-only";

import oracledb, {
  type BindParameters,
  type Connection,
  type ExecuteOptions,
  type Pool,
  type PoolAttributes,
} from "oracledb";
import { z } from "zod";

const TARGET_CONNECT_STRING = "localhost:1522/PITCHPDB";
const poolAlias = "pitchsync-nextjs";

const oracleEnvironmentSchema = z.object({
  ORACLE_USER: z.string().trim().min(1),
  ORACLE_PASSWORD: z.string().min(1),
  ORACLE_CONNECT_STRING: z.string().trim().min(1),
});

type OracleGlobal = typeof globalThis & {
  pitchsyncOraclePool?: Promise<Pool>;
};

const oracleGlobal = globalThis as OracleGlobal;

function getPoolAttributes(): PoolAttributes {
  const parsed = oracleEnvironmentSchema.safeParse({
    ORACLE_USER: process.env.ORACLE_USER,
    ORACLE_PASSWORD: process.env.ORACLE_PASSWORD,
    ORACLE_CONNECT_STRING: process.env.ORACLE_CONNECT_STRING,
  });

  if (!parsed.success) {
    throw new Error("Oracle server configuration is incomplete.");
  }

  if (parsed.data.ORACLE_CONNECT_STRING.toLowerCase() !== TARGET_CONNECT_STRING.toLowerCase()) {
    throw new Error("Oracle server configuration must target the PitchSync PITCHPDB service on port 1522.");
  }

  return {
    user: parsed.data.ORACLE_USER,
    password: parsed.data.ORACLE_PASSWORD,
    connectString: parsed.data.ORACLE_CONNECT_STRING,
    poolAlias,
    poolMin: 1,
    poolMax: 6,
    poolIncrement: 1,
    poolTimeout: 60,
    queueTimeout: 10_000,
    stmtCacheSize: 30,
  };
}

export function getOraclePool(): Promise<Pool> {
  oracleGlobal.pitchsyncOraclePool ??= oracledb.createPool(getPoolAttributes());
  return oracleGlobal.pitchsyncOraclePool;
}

export async function withOracleConnection<T>(operation: (connection: Connection) => Promise<T>): Promise<T> {
  const pool = await getOraclePool();
  const connection = await pool.getConnection();

  try {
    return await operation(connection);
  } finally {
    await connection.close();
  }
}

export async function withOracleTransaction<T>(operation: (connection: Connection) => Promise<T>): Promise<T> {
  return withOracleConnection(async (connection) => {
    try {
      const result = await operation(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

export async function queryRows<T>(
  connection: Connection,
  sql: string,
  binds: BindParameters = {},
  options: ExecuteOptions = {},
): Promise<readonly T[]> {
  const result = await connection.execute<T>(sql, binds, {
    outFormat: oracledb.OUT_FORMAT_OBJECT,
    ...options,
  });

  return result.rows ?? [];
}

export { oracledb };
export type { BindParameters, Connection };
