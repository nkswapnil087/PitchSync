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
  ["Super Administrator", "super.admin"],
  ["Cricket Board Administrator", "board.admin"],
  ["Team Performance Manager", "performance.manager"],
  ["Match Official", "match.official"],
  ["Integrity & Compliance Officer", "integrity.nusrat"],
  ["Integrity & Compliance Officer", "integrity.rezaul"],
  ["Player", "player.arif"],
  ["Player", "player.farzana"],
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

function passwordFromCredentials(source) {
  const lines = source.split(/\r?\n/);
  const labelIndex = lines.findIndex((line) => line.trim() === "Password:");
  if (labelIndex < 0) return "";
  return lines.slice(labelIndex + 1).find((line) => line.trim())?.trim() ?? "";
}

const environment = parseEnvironment(await readFile(localEnvironmentPath, "utf8"));
const connectString = environment.get("ORACLE_CONNECT_STRING");
if (connectString?.toLowerCase() !== approvedTarget.toLowerCase()) throw new Error("Account activation must target localhost:1522/PITCHPDB.");
const password = process.env.PITCHSYNC_APP_PASSWORD?.trim() || passwordFromCredentials(await readFile(credentialsPath, "utf8"));
if (password.length < 12) throw new Error("A local application password of at least 12 characters is required.");

const connection = await oracledb.getConnection({ user: environment.get("ORACLE_USER"), password: environment.get("ORACLE_PASSWORD"), connectString });
try {
  const passwordHash = await bcrypt.hash(password, 12);
  let updated = 0;
  for (const [, username] of accounts) {
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
    "Password:",
    password,
    "",
    "Select the matching role when signing in:",
    ...accounts.map(([role, username]) => `${role}: ${username}`),
    "",
    "These local credentials are ignored by Git. Do not share or commit this file.",
  ];
  await writeFile(credentialsPath, `${lines.join("\r\n")}\r\n`, "utf8");
  console.log(`Activated ${updated} local PitchSync application accounts on ${approvedTarget}.`);
  console.log("Updated the ignored DEMO_CREDENTIALS.txt file without printing the password.");
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.close();
}
