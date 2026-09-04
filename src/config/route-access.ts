import type { RoleId } from "@/features/auth/types";

const allRoles: readonly RoleId[] = [
  "super-admin",
  "board-admin",
  "performance-manager",
  "match-official",
  "integrity-officer",
  "player",
];
const managementRoles: readonly RoleId[] = ["super-admin", "board-admin", "performance-manager"];
const registryEditors: readonly RoleId[] = ["super-admin", "board-admin"];
const competitionRoles: readonly RoleId[] = ["super-admin", "board-admin", "performance-manager", "match-official", "player"];
const performanceRoles: readonly RoleId[] = ["super-admin", "board-admin", "performance-manager", "player"];
const integrityRoles: readonly RoleId[] = ["super-admin", "integrity-officer"];

export const routeAccess: Readonly<Record<string, readonly RoleId[]>> = {
  "/super-admin/dashboard": ["super-admin"],
  "/board-admin/dashboard": ["board-admin"],
  "/performance/dashboard": ["performance-manager"],
  "/match-official/dashboard": ["match-official"],
  "/integrity/dashboard": ["integrity-officer"],
  "/player/dashboard": ["player"],
  "/players": [...managementRoles],
  "/players/new": [...registryEditors],
  "/players/[playerId]": [...managementRoles, "player"],
  "/players/[playerId]/edit": [...registryEditors],
  "/teams": [...managementRoles],
  "/teams/[teamId]": [...managementRoles],
  "/tournaments": ["super-admin", "board-admin"],
  "/tournaments/[tournamentId]": ["super-admin", "board-admin"],
  "/matches": [...competitionRoles],
  "/matches/[matchId]": [...competitionRoles],
  "/performance/players": ["super-admin", "board-admin", "performance-manager"],
  "/performance/players/[playerId]": [...performanceRoles],
  "/integrity/complaints": [...integrityRoles],
  "/integrity/complaints/[complaintId]": [...integrityRoles],
  "/integrity/cases": [...integrityRoles],
  "/integrity/cases/[caseId]": [...integrityRoles],
  "/integrity/rulebook": [...integrityRoles],
  "/integrity/rulebook/[ruleId]": [...integrityRoles],
  "/super-admin/integrity-officers": [
  "super-admin",
],
};

const dynamicRoutePatterns: readonly [RegExp, string][] = [
  [/^\/players\/[^/]+\/edit$/, "/players/[playerId]/edit"],
  [/^\/players\/[^/]+$/, "/players/[playerId]"],
  [/^\/teams\/[^/]+$/, "/teams/[teamId]"],
  [/^\/tournaments\/[^/]+$/, "/tournaments/[tournamentId]"],
  [/^\/matches\/[^/]+$/, "/matches/[matchId]"],
  [/^\/performance\/players\/[^/]+$/, "/performance/players/[playerId]"],
  [/^\/integrity\/complaints\/[^/]+$/, "/integrity/complaints/[complaintId]"],
  [/^\/integrity\/cases\/[^/]+$/, "/integrity/cases/[caseId]"],
  [/^\/integrity\/rulebook\/[^/]+$/, "/integrity/rulebook/[ruleId]"],
];

export function normalizeRoute(pathname: string) {
  if (routeAccess[pathname]) return pathname;
  return dynamicRoutePatterns.find(([pattern]) => pattern.test(pathname))?.[1] ?? pathname;
}

export function canAccessRoute(role: RoleId, pathname: string) {
  return routeAccess[normalizeRoute(pathname)]?.includes(role) ?? false;
}

export function canAnyRoleAccess(pathname: string) {
  const permitted = routeAccess[normalizeRoute(pathname)];
  return permitted ? allRoles.some((role) => permitted.includes(role)) : false;
}
