import "server-only";

import type { MatchSummary, PlayerSummary, TeamListItem, TeamRecord, TeamSummary } from "@/data/contracts";
import { queryRows, type BindParameters, type Connection } from "@/lib/db/oracle";

export type TeamListFilters = {
  page: number;
  pageSize: number;
  q?: string;
  ownership?: "franchise" | "board";
  sort?: "name" | "id" | "category";
};

type CountRow = { TOTAL_ITEMS: number };
type TeamListRow = { TEAM_ID: number; TEAM_NAME: string; CATEGORY: string; FRANCHISE_OWNER: string | null; ROSTER_COUNT: number; MATCH_COUNT: number };
type TeamBaseRow = TeamListRow;
type RosterRow = { PERSON_ID: number; FULL_NAME: string; PLAYER_ROLE: string; GENDER: "MALE" | "FEMALE" };
type MatchRow = { MATCH_ID: number; TOURNAMENT_ID: number; TOURNAMENT_NAME: string; MATCH_DATE: string; VENUE: string };
type MatchTeamRow = { MATCH_ID: number; TEAM_ID: number; TEAM_NAME: string; CATEGORY: string; FRANCHISE_OWNER: string | null };

const teamSortSql = {
  name: "t.team_name, t.team_id",
  id: "t.team_id",
  category: "t.category, t.team_name, t.team_id",
} as const;

function buildTeamWhere(filters: TeamListFilters) {
  const conditions = ["t.is_deleted = 0"];
  const binds: BindParameters = {};
  if (filters.q?.trim()) {
    conditions.push("(UPPER(t.team_name) LIKE :search OR TO_CHAR(t.team_id) LIKE :search OR UPPER(t.category) LIKE :search)");
    binds.search = `%${filters.q.trim().toUpperCase()}%`;
  }
  if (filters.ownership === "franchise") conditions.push("t.franchise_owner IS NOT NULL");
  if (filters.ownership === "board") conditions.push("t.franchise_owner IS NULL");
  return { whereSql: conditions.join(" AND "), binds };
}

export async function listTeams(connection: Connection, filters: TeamListFilters) {
  const { whereSql, binds } = buildTeamWhere(filters);
  const countRows = await queryRows<CountRow>(connection, `SELECT COUNT(*) AS total_items FROM team t WHERE ${whereSql}`, binds);
  const rows = await queryRows<TeamListRow>(connection, `
    SELECT t.team_id, t.team_name, t.category, t.franchise_owner,
      (SELECT COUNT(DISTINCT pf.person_id) FROM plays_for pf WHERE pf.team_id = t.team_id AND pf.end_date IS NULL AND pf.is_deleted = 0) AS roster_count,
      (SELECT COUNT(DISTINCT i.match_id) FROM includes i JOIN match m ON m.match_id = i.match_id AND m.is_deleted = 0 WHERE i.team_id = t.team_id AND i.is_deleted = 0) AS match_count
    FROM team t
    WHERE ${whereSql}
    ORDER BY ${teamSortSql[filters.sort ?? "name"]}
    OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY
  `, { ...binds, rowOffset: (filters.page - 1) * filters.pageSize, rowLimit: filters.pageSize });

  const data: readonly TeamListItem[] = rows.map((row) => ({
    teamId: String(row.TEAM_ID),
    teamName: row.TEAM_NAME,
    category: row.CATEGORY,
    franchiseOwner: row.FRANCHISE_OWNER ?? undefined,
    rosterCount: Number(row.ROSTER_COUNT),
    matchCount: Number(row.MATCH_COUNT),
  }));
  return { data, totalItems: Number(countRows[0]?.TOTAL_ITEMS ?? 0) };
}

export async function findTeamById(connection: Connection, teamId: number): Promise<TeamRecord | null> {
  const baseRows = await queryRows<TeamBaseRow>(connection, `
    SELECT t.team_id, t.team_name, t.category, t.franchise_owner,
      (SELECT COUNT(DISTINCT pf.person_id) FROM plays_for pf WHERE pf.team_id = t.team_id AND pf.end_date IS NULL AND pf.is_deleted = 0) AS roster_count,
      (SELECT COUNT(DISTINCT i.match_id) FROM includes i JOIN match m ON m.match_id = i.match_id AND m.is_deleted = 0 WHERE i.team_id = t.team_id AND i.is_deleted = 0) AS match_count
    FROM team t
    WHERE t.team_id = :teamId AND t.is_deleted = 0
  `, { teamId });
  const base = baseRows[0];
  if (!base) return null;

  const rosterRows = await queryRows<RosterRow>(connection, `
    SELECT p.person_id, p.first_name || ' ' || p.last_name AS full_name, pl.player_role, pl.gender
    FROM plays_for pf
    JOIN player pl ON pl.person_id = pf.person_id AND pl.is_deleted = 0
    JOIN person p ON p.person_id = pl.person_id AND p.is_deleted = 0
    WHERE pf.team_id = :teamId AND pf.end_date IS NULL AND pf.is_deleted = 0
    ORDER BY pl.player_role, p.last_name, p.first_name, p.person_id
  `, { teamId });
  const matchRows = await queryRows<MatchRow>(connection, `
    SELECT m.match_id, tr.tournament_id, tr.tournament_name,
           TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date, m.venue
    FROM includes selected_team
    JOIN match m ON m.match_id = selected_team.match_id AND m.is_deleted = 0
    JOIN tournament tr ON tr.tournament_id = m.tournament_id AND tr.is_deleted = 0
    WHERE selected_team.team_id = :teamId AND selected_team.is_deleted = 0
    ORDER BY m.match_date DESC, m.match_id DESC
  `, { teamId });
  const matchTeamRows = await queryRows<MatchTeamRow>(connection, `
    SELECT i.match_id, t.team_id, t.team_name, t.category, t.franchise_owner
    FROM includes i
    JOIN team t ON t.team_id = i.team_id AND t.is_deleted = 0
    WHERE i.is_deleted = 0
      AND EXISTS (
        SELECT 1 FROM includes selected_team
        WHERE selected_team.match_id = i.match_id
          AND selected_team.team_id = :teamId
          AND selected_team.is_deleted = 0
      )
    ORDER BY i.match_id, t.team_name, t.team_id
  `, { teamId });

  const teamsByMatch = new Map<string, TeamSummary[]>();
  for (const row of matchTeamRows) {
    const key = String(row.MATCH_ID);
    const teams = teamsByMatch.get(key) ?? [];
    teams.push({ teamId: String(row.TEAM_ID), teamName: row.TEAM_NAME, category: row.CATEGORY, franchiseOwner: row.FRANCHISE_OWNER ?? undefined });
    teamsByMatch.set(key, teams);
  }
  const roster: readonly PlayerSummary[] = rosterRows.map((row) => ({ personId: String(row.PERSON_ID), fullName: row.FULL_NAME, playerRole: row.PLAYER_ROLE, gender: row.GENDER }));
  const matches: readonly MatchSummary[] = matchRows.map((row) => ({ matchId: String(row.MATCH_ID), tournamentId: String(row.TOURNAMENT_ID), tournamentName: row.TOURNAMENT_NAME, matchDate: row.MATCH_DATE, venue: row.VENUE, teams: teamsByMatch.get(String(row.MATCH_ID)) ?? [] }));

  return { teamId: String(base.TEAM_ID), teamName: base.TEAM_NAME, category: base.CATEGORY, franchiseOwner: base.FRANCHISE_OWNER ?? undefined, roster, matches };
}
