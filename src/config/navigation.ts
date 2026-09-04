import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bell,
  BriefcaseBusiness,
  ChartNoAxesColumn,
  FileBarChart,
  Gauge,
  Medal,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { RoleId } from "@/features/auth/types";

export type NavigationItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  disabled?: boolean;
};

const players = { label: "Players", href: "/players", icon: UserRound } as const;
const teams = { label: "Teams", href: "/teams", icon: UsersRound } as const;
const tournaments = { label: "Tournaments", href: "/tournaments", icon: Trophy } as const;
const matches = { label: "Matches", href: "/matches", icon: Medal } as const;
const performance = { label: "Performance", href: "/performance/players", icon: ChartNoAxesColumn } as const;
const complaints = { label: "Complaints", href: "/integrity/complaints", icon: ShieldAlert } as const;
const cases = { label: "Cases", href: "/integrity/cases", icon: BriefcaseBusiness } as const;
const rulebook = { label: "Rulebook", href: "/integrity/rulebook", icon: BookOpen } as const;
const reports = { label: "Reports", icon: FileBarChart, disabled: true } as const;

export const navigationByRole: Record<RoleId, readonly NavigationItem[]> = {
  "super-admin": [
    { label: "Dashboard", href: "/super-admin/dashboard", icon: Gauge },
    players,
    teams,
    tournaments,
    matches,
    performance,
    complaints,
    cases,
    rulebook,
    { label: "Integrity Officers", href: "/super-admin/integrity-officers", icon: ShieldCheck },
    reports,
  ],
  "board-admin": [
    { label: "Dashboard", href: "/board-admin/dashboard", icon: Gauge },
    players,
    teams,
    tournaments,
    matches,
    performance,
    reports,
  ],
  "performance-manager": [
    { label: "Dashboard", href: "/performance/dashboard", icon: Gauge },
    players,
    teams,
    matches,
    performance,
    reports,
  ],
  "match-official": [
    { label: "Dashboard", href: "/match-official/dashboard", icon: Gauge },
    matches,
    reports,
  ],
  "integrity-officer": [
    { label: "Dashboard", href: "/integrity/dashboard", icon: Gauge },
    complaints,
    cases,
    rulebook,
    reports,
  ],
  player: [
    { label: "Dashboard", href: "/player/dashboard", icon: Gauge },
    { label: "Player Profile", href: "/players/record", icon: UserRound },
    { label: "Career & Performance", href: "/performance/players/record", icon: ChartNoAxesColumn },
    matches,
    { label: "Notifications", icon: Bell, disabled: true },
  ],
};

export const routeLabels: Record<string, string> = {
  "super-admin": "Super Administrator",
  "board-admin": "Board Administration",
  performance: "Performance",
  "match-official": "Match Official",
  integrity: "Integrity",
  player: "Player",
  dashboard: "Dashboard",
  players: "Players",
  new: "Register Player",
  edit: "Edit Player",
  record: "Record",
  teams: "Teams",
  tournaments: "Tournaments",
  matches: "Matches",
  complaints: "Complaints",
  cases: "Cases",
  rulebook: "Rulebook",
};
