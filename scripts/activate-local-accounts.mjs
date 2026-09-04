import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import bcrypt from "bcryptjs";
import oracledb from "oracledb";

const projectRoot = process.cwd();

const localEnvironmentPath = path.join(projectRoot, ".env.local");
const credentialsPath = path.join(projectRoot, "DEMO_CREDENTIALS.txt");

const defaultApprovedTarget = "localhost:1522/PITCHPDB";

const accounts = [
  ["Super Administrator", "superadmin"],
  ["Cricket Board Administrator", "boardadmin"],
  ["Team Performance Manager", "performancemanager"],
  ["Match Official", "matchofficial"],
  ["Integrity & Compliance Officer", "integrity1"],
  ["Integrity & Compliance Officer", "integrity2"],
  ["Player", "player1"],
  ["Player", "player2"],
];

/**
 * Parse a simple .env file into a Map.
 */
function parseEnvironment(source) {
  const values = new Map();

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");

    if (separator < 1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    // Remove surrounding single/double quotes.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values.set(key, value);
  }

  return values;
}

/**
 * Load .env.local.
 */
const environment = parseEnvironment(
  await readFile(localEnvironmentPath, "utf8")
);

const connectString = environment.get("ORACLE_CONNECT_STRING");

const approvedTarget =
  environment.get("PITCHSYNC_LOCAL_DB_TARGET") ||
  defaultApprovedTarget;

const oracleUser = environment.get("ORACLE_USER");
const oraclePassword = environment.get("ORACLE_PASSWORD");

if (!connectString) {
  throw new Error(
    "ORACLE_CONNECT_STRING is missing from .env.local."
  );
}

if (!oracleUser) {
  throw new Error(
    "ORACLE_USER is missing from .env.local."
  );
}

if (!oraclePassword) {
  throw new Error(
    "ORACLE_PASSWORD is missing from .env.local."
  );
}

/**
 * Safety check:
 * Do not accidentally activate accounts on another database.
 */
if (
  connectString.toLowerCase() !== approvedTarget.toLowerCase()
) {
  throw new Error(
    `Account activation must target ${approvedTarget}. ` +
      `Current target: ${connectString}`
  );
}

/**
 * Determine a simple local password for every course/demo account.
 */
const accountPasswords = accounts.map(([role, username]) => [
  role,
  username,
  `p${username}`,
]);

/**
 * Require reasonable local demo passwords.
 */
if (
  accountPasswords.some(
    ([, , password]) => password.length < 8
  )
) {
  throw new Error(
    "Each local application account requires a password " +
      "of at least 8 characters. " +
      "Check the local account username list."
  );
}

/**
 * Connect to Oracle.
 */
const connection = await oracledb.getConnection({
  user: oracleUser,
  password: oraclePassword,
  connectString,
});

try {
  let updated = 0;

  for (const [, username, password] of accountPasswords) {
    /**
     * Hash each password using bcrypt.
     * Plain-text passwords are never stored in USER_ACCOUNT.
     */
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await connection.execute(
      `
        UPDATE user_account
        SET
          password_hash = :passwordHash,
          account_status = 'ACTIVE',
          is_deleted = 0
        WHERE username = :username
      `,
      {
        passwordHash,
        username,
      }
    );

    updated += result.rowsAffected ?? 0;
  }

  /**
   * All expected demo accounts must exist.
   * Otherwise rollback instead of leaving a partially activated set.
   */
  if (updated !== accounts.length) {
    throw new Error(
      `Expected ${accounts.length} local accounts ` +
        `but updated ${updated}.`
    );
  }

  await connection.commit();

  /**
   * Rewrite the ignored local credentials file.
   */
  const lines = [
    "PitchSync local application credentials",
    "=======================================",
    "",
    "Sign-in URL:",
    "http://localhost:3000/sign-in",
    "",
    "Sign in with your email or username and password:",
    ...accountPasswords.map(
      ([role, username, password]) =>
        `${role}: ${username} | Password: ${password}`
    ),
    "",
    "These local credentials are ignored by Git.",
    "Do not share or commit this file.",
  ];

  await writeFile(
    credentialsPath,
    `${lines.join("\r\n")}\r\n`,
    "utf8"
  );

  console.log(
    `Activated ${updated} local PitchSync application accounts ` +
      `on ${approvedTarget}.`
  );

  console.log(
    "Updated the ignored DEMO_CREDENTIALS.txt file " +
      "without printing passwords."
  );
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.close();
}
