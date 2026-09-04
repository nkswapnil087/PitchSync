import "server-only";

import {
  isIntegrityScope,
  type AuthSession,
  type RoleId,
} from "@/features/auth/types";
import {
  queryRows,
  type Connection,
} from "@/lib/db/oracle";

type AccountRow = {
  ACCOUNT_ID: number;
  PERSON_ID: number;
  USERNAME: string;
  PASSWORD_HASH: string;
  FULL_NAME: string;
  DESIGNATION: string | null;
  PLAYER_ID: number | null;
  ACCESS_SCOPE: string | null;
};

const designationRoles: Readonly<Record<string, RoleId>> = {
  "Super Administrator": "super-admin",
  "Cricket Board Administrator": "board-admin",
  "Team Performance Manager": "performance-manager",
  "Match Official": "match-official",
  "Integrity & Compliance Officer": "integrity-officer",
};

export type LoginAccount =
  AuthSession & { passwordHash: string };

export async function findLoginAccount(
  connection: Connection,
  identifier: string,
): Promise<LoginAccount | null> {
  const rows = await queryRows<AccountRow>(
    connection,
    `
      SELECT
        ua.account_id,
        ua.person_id,
        ua.username,
        ua.password_hash,

        p.first_name || ' ' || p.last_name
          AS full_name,

        a.designation,
        pl.person_id AS player_id,
        ioa.access_scope

      FROM user_account ua

      JOIN person p
        ON p.person_id = ua.person_id
       AND p.is_deleted = 0

      LEFT JOIN admin a
        ON a.person_id = ua.person_id
       AND a.is_deleted = 0

      LEFT JOIN player pl
        ON pl.person_id = ua.person_id
       AND pl.is_deleted = 0

      LEFT JOIN integrity_officer_access ioa
        ON ioa.admin_id = ua.person_id
       AND ioa.is_deleted = 0

      WHERE (
          LOWER(ua.username) = LOWER(:identifier)
          OR LOWER(a.email) = LOWER(:identifier)
      )
        AND ua.account_status = 'ACTIVE'
        AND ua.is_deleted = 0
    `,
    { identifier },
  );

  const row = rows[0];

  if (!row) {
    return null;
  }

  const role =
    row.PLAYER_ID !== null
      ? "player"
      : row.DESIGNATION
        ? designationRoles[row.DESIGNATION]
        : undefined;

  if (!role) {
    return null;
  }

  if (role === "integrity-officer") {
    if (!isIntegrityScope(row.ACCESS_SCOPE)) {
      return null;
    }

    return {
      accountId: String(row.ACCOUNT_ID),
      personId: String(row.PERSON_ID),
      username: row.USERNAME,
      fullName: row.FULL_NAME,
      role,
      integrityScope: row.ACCESS_SCOPE,
      passwordHash: row.PASSWORD_HASH,
    };
  }

  return {
    accountId: String(row.ACCOUNT_ID),
    personId: String(row.PERSON_ID),
    username: row.USERNAME,
    fullName: row.FULL_NAME,
    role,
    passwordHash: row.PASSWORD_HASH,
  };
}

export async function recordSuccessfulLogin(
  connection: Connection,
  accountId: number,
) {
  await connection.execute(
    `
      UPDATE user_account
      SET last_login = SYSTIMESTAMP
      WHERE account_id = :accountId
        AND is_deleted = 0
    `,
    { accountId },
  );
}