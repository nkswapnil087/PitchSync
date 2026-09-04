export type RoleId =
  | "super-admin"
  | "board-admin"
  | "performance-manager"
  | "match-official"
  | "integrity-officer"
  | "player";

export const integrityScopes = [
  "MANAGER",
  "INVESTIGATOR",
] as const;

export type IntegrityScope =
  (typeof integrityScopes)[number];

export function isIntegrityScope(
  value: unknown,
): value is IntegrityScope {
  return (
    typeof value === "string" &&
    integrityScopes.includes(value as IntegrityScope)
  );
}

export type AuthSession = {
  accountId: string;
  personId: string;
  username: string;
  fullName: string;
  role: RoleId;
  integrityScope?: IntegrityScope;
};