import type { LucideIcon } from "lucide-react";
import { BadgeCheck, ClipboardCheck, ShieldCheck, Swords, UserRound, UsersRound } from "lucide-react";
import type { RoleId } from "@/features/demo-auth/types";

export type RoleDefinition = {
  id: RoleId;
  label: string;
  shortLabel: string;
  description: string;
  dashboardRoute: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  icon: LucideIcon;
};

export const roles: readonly RoleDefinition[] = [
  { id: "super-admin", label: "Super Administrator", shortLabel: "System Administration", description: "Oversee core cricket, competition, and integrity records.", dashboardRoute: "/super-admin/dashboard", accent: "#006A4E", accentHover: "#005840", accentSoft: "#E4F0EA", icon: ShieldCheck },
  { id: "board-admin", label: "Cricket Board Administrator", shortLabel: "Board Operations", description: "Coordinate player, team, tournament, and competition administration.", dashboardRoute: "/board-admin/dashboard", accent: "#006A4E", accentHover: "#005840", accentSoft: "#E4F0EA", icon: BadgeCheck },
  { id: "performance-manager", label: "Team Performance Manager", shortLabel: "Team Performance", description: "Review player careers and match-level performance records.", dashboardRoute: "/performance/dashboard", accent: "#006A4E", accentHover: "#005840", accentSoft: "#E4F0EA", icon: UsersRound },
  { id: "match-official", label: "Match Official", shortLabel: "Match Operations", description: "Access assignments and structured match administration screens.", dashboardRoute: "/match-official/dashboard", accent: "#006A4E", accentHover: "#005840", accentSoft: "#E4F0EA", icon: Swords },
  { id: "integrity-officer", label: "Integrity & Compliance Officer", shortLabel: "Integrity & Compliance", description: "Manage complaint intake and integrity case workflows.", dashboardRoute: "/integrity/dashboard", accent: "#006A4E", accentHover: "#005840", accentSoft: "#E4F0EA", icon: ClipboardCheck },
  { id: "player", label: "Player", shortLabel: "Player Workspace", description: "View personal profile, career, team, and match performance records.", dashboardRoute: "/player/dashboard", accent: "#006A4E", accentHover: "#005840", accentSoft: "#E4F0EA", icon: UserRound },
] as const;

export const roleIds = roles.map((role) => role.id);

export function getRole(roleId: RoleId | null | undefined) {
  return roles.find((role) => role.id === roleId);
}

export function isRoleId(value: unknown): value is RoleId {
  return typeof value === "string" && roleIds.includes(value as RoleId);
}
