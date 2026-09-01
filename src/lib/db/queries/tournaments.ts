import "server-only";

import type { MatchSummary, TeamSummary, TournamentListItem, TournamentRecord } from "@/data/contracts";
import { queryRows, type BindParameters, type Connection } from "@/lib/db/oracle";

export type TournamentListFilters = { page: number; pageSize: number; q?: string; tier?: string; sort?: "name" | "id" | "season" };
type CountRow = { TOTAL_ITEMS: number };
type TournamentListRow = { TOURNAMENT_ID: number; TOURNAMENT_NAME: string; TOURNAMENT_TIER_LEVEL: string; SEASON_YEAR: number | null; SPONSOR_COUNT: number; TEAM_COUNT: number; MATCH_COUNT: number };
type ValueRow = { VALUE: string };
type TeamRow = { TEAM_ID: number; TEAM_NAME: string; CATEGORY: string; FRANCHISE_OWNER: string | null };
type MatchRow = { MATCH_ID: number; MATCH_DATE: string; VENUE: string; MATCH_FORMAT: string; MATCH_STATUS: string; RESULT: string | null; WINNER_TEAM_ID: number | null };
type MatchTeamRow = TeamRow & { MATCH_ID: number };

const tournamentSortSql = {
  name: "tr.tournament_name, tr.season_year DESC NULLS LAST, tr.tournament_id",
  id: "tr.tournament_id",
  season: "tr.season_year DESC NULLS LAST, tr.tournament_name, tr.tournament_id",
} as const;

function buildWhere(filters: TournamentListFilters) {
  const conditions = ["tr.is_deleted = 0"];
  const binds: BindParameters = {};
  if (filters.q?.trim()) {
    conditions.push("(UPPER(tr.tournament_name) LIKE :search OR TO_CHAR(tr.tournament_id) LIKE :search OR TO_CHAR(tr.season_year) LIKE :search)");
    binds.search = `%${filters.q.trim().toUpperCase()}%`;
  }
  if (filters.tier?.trim()) {
    conditions.push("UPPER(tr.tournament_tier_level) LIKE :tier");
    binds.tier = `%${filters.tier.trim().toUpperCase()}%`;
  }
  return { whereSql: conditions.join(" AND "), binds };
}

export async function listTournaments(connection: Connection, filters: TournamentListFilters) {
  const { whereSql, binds } = buildWhere(filters);
  const countRows = await queryRows<CountRow>(connection, `SELECT COUNT(*) AS total_items FROM tournament tr WHERE ${whereSql}`, binds);
  const rows = await queryRows<TournamentListRow>(connection, `
    SELECT tr.tournament_id, tr.tournament_name, tr.tournament_tier_level, tr.season_year,
      (SELECT COUNT(*) FROM tournament_sponsor ts WHERE ts.tournament_id = tr.tournament_id AND ts.is_deleted = 0) AS sponsor_count,
      (SELECT COUNT(DISTINCT i.team_id) FROM match m JOIN includes i ON i.match_id = m.match_id AND i.is_deleted = 0 WHERE m.tournament_id = tr.tournament_id AND m.is_deleted = 0) AS team_count,
      (SELECT COUNT(*) FROM match m WHERE m.tournament_id = tr.tournament_id AND m.is_deleted = 0) AS match_count
    FROM tournament tr
    WHERE ${whereSql}
    ORDER BY ${tournamentSortSql[filters.sort ?? "season"]}
    OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY
  `, { ...binds, rowOffset: (filters.page - 1) * filters.pageSize, rowLimit: filters.pageSize });
  const data: readonly TournamentListItem[] = rows.map((row) => ({ tournamentId: String(row.TOURNAMENT_ID), tournamentName: row.TOURNAMENT_NAME, tierLevel: row.TOURNAMENT_TIER_LEVEL, seasonYear: row.SEASON_YEAR ?? undefined, sponsorCount: Number(row.SPONSOR_COUNT), teamCount: Number(row.TEAM_COUNT), matchCount: Number(row.MATCH_COUNT) }));
  return { data, totalItems: Number(countRows[0]?.TOTAL_ITEMS ?? 0) };
}

export async function findTournamentById(connection: Connection, tournamentId: number): Promise<TournamentRecord | null> {
  const baseRows = await queryRows<TournamentListRow>(connection, `
    SELECT tr.tournament_id, tr.tournament_name, tr.tournament_tier_level, tr.season_year,
      (SELECT COUNT(*) FROM tournament_sponsor ts WHERE ts.tournament_id = tr.tournament_id AND ts.is_deleted = 0) AS sponsor_count,
      (SELECT COUNT(DISTINCT i.team_id) FROM match m JOIN includes i ON i.match_id = m.match_id AND i.is_deleted = 0 WHERE m.tournament_id = tr.tournament_id AND m.is_deleted = 0) AS team_count,
      (SELECT COUNT(*) FROM match m WHERE m.tournament_id = tr.tournament_id AND m.is_deleted = 0) AS match_count
    FROM tournament tr
    WHERE tr.tournament_id = :tournamentId AND tr.is_deleted = 0
  `, { tournamentId });
  const base = baseRows[0];
  if (!base) return null;

  const sponsorRows = await queryRows<ValueRow>(connection, `SELECT sponsor AS value FROM tournament_sponsor WHERE tournament_id = :tournamentId AND is_deleted = 0 ORDER BY sponsor`, { tournamentId });
  const teamRows = await queryRows<TeamRow>(connection, `
    SELECT DISTINCT t.team_id, t.team_name, t.category, t.franchise_owner
    FROM match m
    JOIN includes i ON i.match_id = m.match_id AND i.is_deleted = 0
    JOIN team t ON t.team_id = i.team_id AND t.is_deleted = 0
    WHERE m.tournament_id = :tournamentId AND m.is_deleted = 0
    ORDER BY t.team_name, t.team_id
  `, { tournamentId });
  const matchRows = await queryRows<MatchRow>(connection, `
    SELECT m.match_id, TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date, m.venue,
           m.match_format, m.match_status, m.result, m.winner_team_id
    FROM match m
    WHERE m.tournament_id = :tournamentId AND m.is_deleted = 0
    ORDER BY m.match_date, m.match_id
  `, { tournamentId });
  const matchTeamRows = await queryRows<MatchTeamRow>(connection, `
    SELECT i.match_id, t.team_id, t.team_name, t.category, t.franchise_owner
    FROM match m
    JOIN includes i ON i.match_id = m.match_id AND i.is_deleted = 0
    JOIN team t ON t.team_id = i.team_id AND t.is_deleted = 0
    WHERE m.tournament_id = :tournamentId AND m.is_deleted = 0
    ORDER BY i.match_id, t.team_id
  `, { tournamentId });
  const teamsByMatch = new Map<string, TeamSummary[]>();
  for (const row of matchTeamRows) {
    const key = String(row.MATCH_ID);
    const teams = teamsByMatch.get(key) ?? [];
    teams.push({ teamId: String(row.TEAM_ID), teamName: row.TEAM_NAME, category: row.CATEGORY, franchiseOwner: row.FRANCHISE_OWNER ?? undefined });
    teamsByMatch.set(key, teams);
  }
  const teams: readonly TeamSummary[] = teamRows.map((row) => ({ teamId: String(row.TEAM_ID), teamName: row.TEAM_NAME, category: row.CATEGORY, franchiseOwner: row.FRANCHISE_OWNER ?? undefined }));
  const matches: readonly MatchSummary[] = matchRows.map((row) => ({ matchId: String(row.MATCH_ID), tournamentId: String(base.TOURNAMENT_ID), tournamentName: base.TOURNAMENT_NAME, matchDate: row.MATCH_DATE, venue: row.VENUE, teams: teamsByMatch.get(String(row.MATCH_ID)) ?? [], format: row.MATCH_FORMAT, status: row.MATCH_STATUS, result: row.RESULT ?? undefined, winnerTeamId: row.WINNER_TEAM_ID === null ? undefined : String(row.WINNER_TEAM_ID) }));
  return { tournamentId: String(base.TOURNAMENT_ID), tournamentName: base.TOURNAMENT_NAME, tierLevel: base.TOURNAMENT_TIER_LEVEL, seasonYear: base.SEASON_YEAR ?? undefined, sponsors: sponsorRows.map((row) => row.VALUE), teams, matches };
}
