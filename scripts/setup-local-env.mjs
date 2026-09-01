import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const oracleEnvPath = resolve(root, ".env.oracle-local");
const nextEnvPath = resolve(root, ".env.local");

function parseEnv(text) {
  const values = new Map();

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator < 1) continue;

    values.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }

  return values;
}

if (!existsSync(oracleEnvPath)) {
  throw new Error(".env.oracle-local is required before creating .env.local.");
}

const oracleValues = parseEnv(readFileSync(oracleEnvPath, "utf8"));
const oraclePassword = oracleValues.get("DB_PASSWORD");

if (!oraclePassword) {
  throw new Error("DB_PASSWORD is missing from .env.oracle-local.");
}

if (existsSync(nextEnvPath)) {
  const existingValues = parseEnv(readFileSync(nextEnvPath, "utf8"));
  const isComplete = ["ORACLE_USER", "ORACLE_PASSWORD", "ORACLE_CONNECT_STRING", "AUTH_SECRET"]
    .every((name) => Boolean(existingValues.get(name)));

  if (isComplete) {
    console.log(".env.local already contains the required server-only variables.");
    process.exit(0);
  }

  throw new Error(".env.local already exists but is incomplete; update it using .env.example without committing secrets.");
}

const authSecret = randomBytes(48).toString("hex");
const contents = [
  "# Generated local server configuration. This file is Git-ignored.",
  "ORACLE_USER=PITCHSYNC_OWNER",
  `ORACLE_PASSWORD=${oraclePassword}`,
  "ORACLE_CONNECT_STRING=localhost:1522/PITCHPDB",
  `AUTH_SECRET=${authSecret}`,
  "",
].join("\n");

writeFileSync(nextEnvPath, contents, { encoding: "utf8", mode: 0o600 });
console.log("Created .env.local with server-only Oracle and session configuration.");
