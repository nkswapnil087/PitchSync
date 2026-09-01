import "server-only";

import type { BattingPerformance, BowlingPerformance, FieldingPerformance, MatchListItem, MatchObservation, MatchRecord, TeamSummary } from "@/data/contracts";
import { queryRows, type BindParameters, type Connection } from "@/lib/db/oracle";

export type MatchListFilters = { page: number; pageSize: number; q?: string; tournament?: string; date?: string; sort?: "date" | "id" | "tournament" };
type CountRow = { TOTAL_ITEMS: number };
type MatchListRow = { MATCH_ID: number; TOURNAMENT_ID: number; TOURNAMENT_NAME: string; PARTICIPATING_TEAMS: string | null; MATCH_DATE: string; VENUE: string; MATCH_FORMAT: string; MATCH_STATUS: string };
type MatchBaseRow = MatchListRow & { RESULT: string | null; WINNER_TEAM_ID: number | null };
type TeamRow = { TEAM_ID: number; TEAM_NAME: string; CATEGORY: string; FRANCHISE_OWNER: string | null };
type BattingRow = { PERFORMANCE_ID: number; PERSON_ID: number; FULL_NAME: string; PLAYER_ROLE: string; GENDER: "MALE" | "FEMALE"; RUNS_SCORED: number; BALLS_FACED: number; STRIKE_RATE: number; DISMISSAL_TYPE: string | null };
type BowlingRow = { PERFORMANCE_ID: number; PERSON_ID: number; FULL_NAME: string; PLAYER_ROLE: string; GENDER: "MALE" | "FEMALE"; WICKETS_TAKEN: number; BALLS_BOWLED: number; RUNS_CONCEDED: number; ECONOMY_RATE: number };
type FieldingRow = { PERFORMANCE_ID: number; PERSON_ID: number; FULL_NAME: string; PLAYER_ROLE: string; GENDER: "MALE" | "FEMALE"; CATCHES: number; STUMPINGS: number; RUNS_OUT_DIRECT: number; BYES_CONCEDED: number };
type ObservationRow = { ADMIN_ID: number; ADMIN_NAME: string; PLAYER_ID: number; PLAYER_NAME: string; OBSERVATION_DATE: string; REMARKS: string | null };

const matchSortSql = { date: "m.match_date DESC, m.match_id DESC", id: "m.match_id", tournament: "tr.tournament_name, m.match_date DESC, m.match_id" } as const;

function buildWhere(filters: MatchListFilters) {
  const conditions = ["m.is_deleted = 0", "tr.is_deleted = 0"];
  const binds: BindParameters = {};
  if (filters.q?.trim()) {
    conditions.push("(TO_CHAR(m.match_id) LIKE :search OR UPPER(m.venue) LIKE :search OR UPPER(tr.tournament_name) LIKE :search OR EXISTS (SELECT 1 FROM includes qi JOIN team qt ON qt.team_id = qi.team_id AND qt.is_deleted = 0 WHERE qi.match_id = m.match_id AND qi.is_deleted = 0 AND UPPER(qt.team_name) LIKE :search))");
    binds.search = `%${filters.q.trim().toUpperCase()}%`;
  }
  if (filters.tournament?.trim()) {
    conditions.push("(UPPER(tr.tournament_name) LIKE :tournament OR TO_CHAR(tr.tournament_id) = :tournamentExact)");
    binds.tournament = `%${filters.tournament.trim().toUpperCase()}%`;
    binds.tournamentExact = filters.tournament.trim();
  }
  if (filters.date) {
    conditions.push("TRUNC(m.match_date) = TO_DATE(:matchDate, 'YYYY-MM-DD')");
    binds.matchDate = filters.date;
  }
  return { whereSql: conditions.join(" AND "), binds };
}

export async function listMatches(connection: Connection, filters: MatchListFilters) {
  const { whereSql, binds } = buildWhere(filters);
  const countRows = await queryRows<CountRow>(connection, `SELECT COUNT(*) AS total_items FROM match m JOIN tournament tr ON tr.tournament_id = m.tournament_id WHERE ${whereSql}`, binds);
  const rows = await queryRows<MatchListRow>(connection, `
    SELECT m.match_id, tr.tournament_id, tr.tournament_name,
      (SELECT LISTAGG(t.team_name, ' vs ') WITHIN GROUP (ORDER BY t.team_id) FROM includes i JOIN team t ON t.team_id = i.team_id AND t.is_deleted = 0 WHERE i.match_id = m.match_id AND i.is_deleted = 0) AS participating_teams,
      TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date, m.venue, m.match_format, m.match_status
    FROM match m
    JOIN tournament tr ON tr.tournament_id = m.tournament_id
    WHERE ${whereSql}
    ORDER BY ${matchSortSql[filters.sort ?? "date"]}
    OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY
  `, { ...binds, rowOffset: (filters.page - 1) * filters.pageSize, rowLimit: filters.pageSize });
  const data: readonly MatchListItem[] = rows.map((row) => ({ matchId: String(row.MATCH_ID), tournamentId: String(row.TOURNAMENT_ID), tournamentName: row.TOURNAMENT_NAME, participatingTeams: row.PARTICIPATING_TEAMS ?? "", matchDate: row.MATCH_DATE, venue: row.VENUE, format: row.MATCH_FORMAT, status: row.MATCH_STATUS }));
  return { data, totalItems: Number(countRows[0]?.TOTAL_ITEMS ?? 0) };
}

function player(row: { PERSON_ID: number; FULL_NAME: string; PLAYER_ROLE: string; GENDER: "MALE" | "FEMALE" }) {
  return { personId: String(row.PERSON_ID), fullName: row.FULL_NAME, playerRole: row.PLAYER_ROLE, gender: row.GENDER };
}

export async function findMatchById(connection: Connection, matchId: number): Promise<MatchRecord | null> {
  const baseRows = await queryRows<MatchBaseRow>(connection, `
    SELECT m.match_id, tr.tournament_id, tr.tournament_name, NULL AS participating_teams,
           TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date, m.venue,
           m.match_format, m.match_status, m.result, m.winner_team_id
    FROM match m JOIN tournament tr ON tr.tournament_id = m.tournament_id AND tr.is_deleted = 0
    WHERE m.match_id = :matchId AND m.is_deleted = 0
  `, { matchId });
  const base = baseRows[0];
  if (!base) return null;
  const teamRows = await queryRows<TeamRow>(connection, `SELECT t.team_id, t.team_name, t.category, t.franchise_owner FROM includes i JOIN team t ON t.team_id = i.team_id AND t.is_deleted = 0 WHERE i.match_id = :matchId AND i.is_deleted = 0 ORDER BY t.team_id`, { matchId });
  const battingRows = await queryRows<BattingRow>(connection, `
    SELECT bp.bat_stat_id AS performance_id, p.person_id, p.first_name || ' ' || p.last_name AS full_name, pl.player_role, pl.gender, bp.runs_scored, bp.balls_faced, bp.strike_rate, bp.dismissal_type
    FROM batting_performance bp JOIN batting_summary bs ON bs.bat_summary_id = bp.bat_summary_id AND bs.is_deleted = 0 JOIN career_record cr ON cr.record_id = bs.record_id AND cr.is_deleted = 0 JOIN player pl ON pl.person_id = cr.person_id AND pl.is_deleted = 0 JOIN person p ON p.person_id = pl.person_id AND p.is_deleted = 0
    WHERE bp.match_id = :matchId AND bp.is_deleted = 0 ORDER BY bp.runs_scored DESC, p.person_id
  `, { matchId });
  const bowlingRows = await queryRows<BowlingRow>(connection, `
    SELECT bp.bowl_stat_id AS performance_id, p.person_id, p.first_name || ' ' || p.last_name AS full_name, pl.player_role, pl.gender, bp.wickets_taken, bp.balls_bowled, bp.runs_conceded, bp.economy_rate
    FROM bowling_performance bp JOIN bowling_summary bs ON bs.bowl_summary_id = bp.bowl_summary_id AND bs.is_deleted = 0 JOIN career_record cr ON cr.record_id = bs.record_id AND cr.is_deleted = 0 JOIN player pl ON pl.person_id = cr.person_id AND pl.is_deleted = 0 JOIN person p ON p.person_id = pl.person_id AND p.is_deleted = 0
    WHERE bp.match_id = :matchId AND bp.is_deleted = 0 ORDER BY bp.wickets_taken DESC, p.person_id
  `, { matchId });
  const fieldingRows = await queryRows<FieldingRow>(connection, `
    SELECT fp.field_stat_id AS performance_id, p.person_id, p.first_name || ' ' || p.last_name AS full_name, pl.player_role, pl.gender, fp.catches, fp.stumpings, fp.runs_out_direct, fp.byes_conceded
    FROM fielding_performance fp JOIN fielding_summary fs ON fs.field_summary_id = fp.field_summary_id AND fs.is_deleted = 0 JOIN career_record cr ON cr.record_id = fs.record_id AND cr.is_deleted = 0 JOIN player pl ON pl.person_id = cr.person_id AND pl.is_deleted = 0 JOIN person p ON p.person_id = pl.person_id AND p.is_deleted = 0
    WHERE fp.match_id = :matchId AND fp.is_deleted = 0 ORDER BY fp.catches DESC, p.person_id
  `, { matchId });
  const observationRows = await queryRows<ObservationRow>(connection, `
    SELECT o.admin_id, ap.first_name || ' ' || ap.last_name AS admin_name, o.player_id, pp.first_name || ' ' || pp.last_name AS player_name, TO_CHAR(o.observation_date, 'YYYY-MM-DD') AS observation_date, o.remarks
    FROM observes o JOIN person ap ON ap.person_id = o.admin_id AND ap.is_deleted = 0 JOIN person pp ON pp.person_id = o.player_id AND pp.is_deleted = 0
    WHERE o.match_id = :matchId AND o.is_deleted = 0 ORDER BY o.observation_date DESC, o.admin_id, o.player_id
  `, { matchId });
  const teams: readonly TeamSummary[] = teamRows.map((row) => ({ teamId: String(row.TEAM_ID), teamName: row.TEAM_NAME, category: row.CATEGORY, franchiseOwner: row.FRANCHISE_OWNER ?? undefined }));
  const batting: readonly BattingPerformance[] = battingRows.map((row) => ({ performanceId: String(row.PERFORMANCE_ID), player: player(row), runsScored: Number(row.RUNS_SCORED), ballsFaced: Number(row.BALLS_FACED), strikeRate: Number(row.STRIKE_RATE), dismissalType: row.DISMISSAL_TYPE ?? undefined }));
  const bowling: readonly BowlingPerformance[] = bowlingRows.map((row) => ({ performanceId: String(row.PERFORMANCE_ID), player: player(row), wicketsTaken: Number(row.WICKETS_TAKEN), oversBowled: Number(`${Math.floor(Number(row.BALLS_BOWLED) / 6)}.${Number(row.BALLS_BOWLED) % 6}`), runsConceded: Number(row.RUNS_CONCEDED), economyRate: Number(row.ECONOMY_RATE) }));
  const fielding: readonly FieldingPerformance[] = fieldingRows.map((row) => ({ performanceId: String(row.PERFORMANCE_ID), player: player(row), catches: Number(row.CATCHES), stumpings: Number(row.STUMPINGS), directRunouts: Number(row.RUNS_OUT_DIRECT), byesConceded: Number(row.BYES_CONCEDED) }));
  const observations: readonly MatchObservation[] = observationRows.map((row) => ({ administratorId: String(row.ADMIN_ID), administratorName: row.ADMIN_NAME, playerId: String(row.PLAYER_ID), playerName: row.PLAYER_NAME, observationDate: row.OBSERVATION_DATE, remarks: row.REMARKS ?? undefined }));
  return { matchId: String(base.MATCH_ID), tournamentId: String(base.TOURNAMENT_ID), tournamentName: base.TOURNAMENT_NAME, matchDate: base.MATCH_DATE, venue: base.VENUE, teams, format: base.MATCH_FORMAT, status: base.MATCH_STATUS, result: base.RESULT ?? undefined, winnerTeamId: base.WINNER_TEAM_ID === null ? undefined : String(base.WINNER_TEAM_ID), batting, bowling, fielding, observations };
}
