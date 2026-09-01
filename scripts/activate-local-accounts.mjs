import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import bcrypt from "bcryptjs";
import oracledb from "oracledb";

const projectRoot = process.cwd();
const localEnvironmentPath = path.join(projectRoot, ".env.local");
const credentialsPath = path.join(projectRoot, "DEMO_CREDENTIALS.txt");
const approvedTarget = "localhost:1522/PITCHPDB";
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

function parseEnvironment(source) {
  const values = new Map();
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values.set(key, value);
  }
  return values;
}

function passwordsFromCredentials(source) {
  const passwords = new Map();
  for (const rawLine of source.split(/\r?\n/)) {
    const match = rawLine.trim().match(/^.+?:\s+(\S+)\s+\|\s+Password:\s+(.+)$/);
    if (match) passwords.set(match[1], match[2].trim());
  }
  return passwords;
}

const environment = parseEnvironment(await readFile(localEnvironmentPath, "utf8"));
const connectString = environment.get("ORACLE_CONNECT_STRING");
if (connectString?.toLowerCase() !== approvedTarget.toLowerCase()) throw new Error("Account activation must target localhost:1522/PITCHPDB.");
const savedPasswords = passwordsFromCredentials(await readFile(credentialsPath, "utf8").catch(() => ""));
const fallbackPassword = process.env.PITCHSYNC_APP_PASSWORD?.trim();
const accountPasswords = accounts.map(([role, username]) => [role, username, savedPasswords.get(username) || fallbackPassword || ""]);
if (accountPasswords.some(([, , password]) => password.length < 8)) throw new Error("Each local application account requires a password of at least 8 characters.");

const connection = await oracledb.getConnection({ user: environment.get("ORACLE_USER"), password: environment.get("ORACLE_PASSWORD"), connectString });
try {
  let updated = 0;
  for (const [, username, password] of accountPasswords) {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await connection.execute(
      `UPDATE user_account SET password_hash = :passwordHash, account_status = 'ACTIVE', is_deleted = 0 WHERE username = :username`,
      { passwordHash, username },
    );
    updated += result.rowsAffected ?? 0;
  }
  if (updated !== accounts.length) throw new Error(`Expected ${accounts.length} local accounts but updated ${updated}.`);
  await connection.commit();
  const lines = [
    "PitchSync local application credentials",
    "=======================================",
    "",
    "Sign-in URL:",
    "http://localhost:3000/sign-in",
    "",
    "Select the matching role when signing in:",
    ...accountPasswords.map(([role, username, password]) => `${role}: ${username} | Password: ${password}`),
    "",
    "These local credentials are ignored by Git. Do not share or commit this file.",
  ];
  await writeFile(credentialsPath, `${lines.join("\r\n")}\r\n`, "utf8");
  console.log(`Activated ${updated} local PitchSync application accounts on ${approvedTarget}.`);
  console.log("Updated the ignored DEMO_CREDENTIALS.txt file without printing passwords.");
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.close();
}
