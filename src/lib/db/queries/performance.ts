import "server-only";

import type { PlayerBattingMatchPerformance, PlayerBowlingMatchPerformance, PlayerFieldingMatchPerformance, PlayerPerformanceListItem, PlayerPerformanceRecord } from "@/data/contracts";
import { queryRows, type BindParameters, type Connection } from "@/lib/db/oracle";
import { findPlayerById } from "@/lib/db/queries/players";

export type PerformanceListFilters = { page: number; pageSize: number; q?: string; tier?: string; format?: string; sort?: "name" | "matches" | "id" };
type CountRow = { TOTAL_ITEMS: number };
type PerformanceListRow = { PERSON_ID: number; FULL_NAME: string; PLAYER_ROLE: string; GENDER: "MALE" | "FEMALE"; CAREER_RECORD_COUNT: number; MATCHES_PLAYED: number; BATTING_SUMMARY_COUNT: number; BOWLING_SUMMARY_COUNT: number; FIELDING_SUMMARY_COUNT: number };
type BattingMatchRow = { PERFORMANCE_ID: number; MATCH_ID: number; MATCH_DATE: string; VENUE: string; RUNS_SCORED: number; BALLS_FACED: number; STRIKE_RATE: number; DISMISSAL_TYPE: string | null };
type BowlingMatchRow = { PERFORMANCE_ID: number; MATCH_ID: number; MATCH_DATE: string; VENUE: string; WICKETS_TAKEN: number; BALLS_BOWLED: number; RUNS_CONCEDED: number; ECONOMY_RATE: number };
type FieldingMatchRow = { PERFORMANCE_ID: number; MATCH_ID: number; MATCH_DATE: string; VENUE: string; CATCHES: number; STUMPINGS: number; RUNS_OUT_DIRECT: number; BYES_CONCEDED: number };

const sortSql = { name: "p.first_name, p.last_name, p.person_id", matches: "matches_played DESC, p.first_name, p.last_name", id: "p.person_id" } as const;

function buildWhere(filters: PerformanceListFilters) {
  const conditions = ["p.is_deleted = 0", "pl.is_deleted = 0"];
  const binds: BindParameters = {};
  if (filters.q?.trim()) {
    conditions.push("(UPPER(p.first_name || ' ' || p.last_name) LIKE :search OR TO_CHAR(p.person_id) LIKE :search)");
    binds.search = `%${filters.q.trim().toUpperCase()}%`;
  }
  if (filters.tier?.trim()) {
    conditions.push("EXISTS (SELECT 1 FROM career_record tier_cr WHERE tier_cr.person_id = p.person_id AND tier_cr.is_deleted = 0 AND UPPER(tier_cr.tier_level) LIKE :tier)");
    binds.tier = `%${filters.tier.trim().toUpperCase()}%`;
  }
  if (filters.format?.trim()) {
    conditions.push("EXISTS (SELECT 1 FROM career_record format_cr WHERE format_cr.person_id = p.person_id AND format_cr.is_deleted = 0 AND (EXISTS (SELECT 1 FROM batting_summary format_bs WHERE format_bs.record_id = format_cr.record_id AND format_bs.is_deleted = 0 AND UPPER(format_bs.format) = :matchFormat) OR EXISTS (SELECT 1 FROM bowling_summary format_bos WHERE format_bos.record_id = format_cr.record_id AND format_bos.is_deleted = 0 AND UPPER(format_bos.format) = :matchFormat) OR EXISTS (SELECT 1 FROM fielding_summary format_fs WHERE format_fs.record_id = format_cr.record_id AND format_fs.is_deleted = 0 AND UPPER(format_fs.format) = :matchFormat)))");
    binds.matchFormat = filters.format.trim().toUpperCase();
  }
  return { whereSql: conditions.join(" AND "), binds };
}

export async function listPlayerPerformance(connection: Connection, filters: PerformanceListFilters) {
  const { whereSql, binds } = buildWhere(filters);
  const countRows = await queryRows<CountRow>(connection, `SELECT COUNT(*) AS total_items FROM person p JOIN player pl ON pl.person_id = p.person_id WHERE ${whereSql}`, binds);
  const rows = await queryRows<PerformanceListRow>(connection, `
    SELECT p.person_id, p.first_name || ' ' || p.last_name AS full_name, pl.player_role, pl.gender,
      (SELECT COUNT(*) FROM career_record cr WHERE cr.person_id = p.person_id AND cr.is_deleted = 0) AS career_record_count,
      (SELECT NVL(SUM(cr.matches_played), 0) FROM career_record cr WHERE cr.person_id = p.person_id AND cr.is_deleted = 0) AS matches_played,
      (SELECT COUNT(*) FROM batting_summary bs JOIN career_record cr ON cr.record_id = bs.record_id AND cr.is_deleted = 0 WHERE cr.person_id = p.person_id AND bs.is_deleted = 0) AS batting_summary_count,
      (SELECT COUNT(*) FROM bowling_summary bs JOIN career_record cr ON cr.record_id = bs.record_id AND cr.is_deleted = 0 WHERE cr.person_id = p.person_id AND bs.is_deleted = 0) AS bowling_summary_count,
      (SELECT COUNT(*) FROM fielding_summary fs JOIN career_record cr ON cr.record_id = fs.record_id AND cr.is_deleted = 0 WHERE cr.person_id = p.person_id AND fs.is_deleted = 0) AS fielding_summary_count
    FROM person p JOIN player pl ON pl.person_id = p.person_id
    WHERE ${whereSql}
    ORDER BY ${sortSql[filters.sort ?? "name"]}
    OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY
  `, { ...binds, rowOffset: (filters.page - 1) * filters.pageSize, rowLimit: filters.pageSize });
  const data: readonly PlayerPerformanceListItem[] = rows.map((row) => ({ personId: String(row.PERSON_ID), fullName: row.FULL_NAME, playerRole: row.PLAYER_ROLE, gender: row.GENDER, careerRecordCount: Number(row.CAREER_RECORD_COUNT), matchesPlayed: Number(row.MATCHES_PLAYED), battingSummaryCount: Number(row.BATTING_SUMMARY_COUNT), bowlingSummaryCount: Number(row.BOWLING_SUMMARY_COUNT), fieldingSummaryCount: Number(row.FIELDING_SUMMARY_COUNT) }));
  return { data, totalItems: Number(countRows[0]?.TOTAL_ITEMS ?? 0) };
}

export async function findPlayerPerformance(connection: Connection, playerId: number): Promise<PlayerPerformanceRecord | null> {
  const base = await findPlayerById(connection, playerId);
  if (!base) return null;
  const battingRows = await queryRows<BattingMatchRow>(connection, `
    SELECT bp.bat_stat_id AS performance_id, m.match_id, TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date, m.venue, bp.runs_scored, bp.balls_faced, bp.strike_rate, bp.dismissal_type
    FROM career_record cr JOIN batting_summary bs ON bs.record_id = cr.record_id AND bs.is_deleted = 0 JOIN batting_performance bp ON bp.bat_summary_id = bs.bat_summary_id AND bp.is_deleted = 0 JOIN match m ON m.match_id = bp.match_id AND m.is_deleted = 0
    WHERE cr.person_id = :playerId AND cr.is_deleted = 0 ORDER BY m.match_date DESC, m.match_id DESC
  `, { playerId });
  const bowlingRows = await queryRows<BowlingMatchRow>(connection, `
    SELECT bp.bowl_stat_id AS performance_id, m.match_id, TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date, m.venue, bp.wickets_taken, bp.balls_bowled, bp.runs_conceded, bp.economy_rate
    FROM career_record cr JOIN bowling_summary bs ON bs.record_id = cr.record_id AND bs.is_deleted = 0 JOIN bowling_performance bp ON bp.bowl_summary_id = bs.bowl_summary_id AND bp.is_deleted = 0 JOIN match m ON m.match_id = bp.match_id AND m.is_deleted = 0
    WHERE cr.person_id = :playerId AND cr.is_deleted = 0 ORDER BY m.match_date DESC, m.match_id DESC
  `, { playerId });
  const fieldingRows = await queryRows<FieldingMatchRow>(connection, `
    SELECT fp.field_stat_id AS performance_id, m.match_id, TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date, m.venue, fp.catches, fp.stumpings, fp.runs_out_direct, fp.byes_conceded
    FROM career_record cr JOIN fielding_summary fs ON fs.record_id = cr.record_id AND fs.is_deleted = 0 JOIN fielding_performance fp ON fp.field_summary_id = fs.field_summary_id AND fp.is_deleted = 0 JOIN match m ON m.match_id = fp.match_id AND m.is_deleted = 0
    WHERE cr.person_id = :playerId AND cr.is_deleted = 0 ORDER BY m.match_date DESC, m.match_id DESC
  `, { playerId });
  const battingPerformances: readonly PlayerBattingMatchPerformance[] = battingRows.map((row) => ({ performanceId: String(row.PERFORMANCE_ID), matchId: String(row.MATCH_ID), matchDate: row.MATCH_DATE, venue: row.VENUE, runsScored: Number(row.RUNS_SCORED), ballsFaced: Number(row.BALLS_FACED), strikeRate: Number(row.STRIKE_RATE), dismissalType: row.DISMISSAL_TYPE ?? undefined }));
  const bowlingPerformances: readonly PlayerBowlingMatchPerformance[] = bowlingRows.map((row) => ({ performanceId: String(row.PERFORMANCE_ID), matchId: String(row.MATCH_ID), matchDate: row.MATCH_DATE, venue: row.VENUE, wicketsTaken: Number(row.WICKETS_TAKEN), oversBowled: Number(`${Math.floor(Number(row.BALLS_BOWLED) / 6)}.${Number(row.BALLS_BOWLED) % 6}`), runsConceded: Number(row.RUNS_CONCEDED), economyRate: Number(row.ECONOMY_RATE) }));
  const fieldingPerformances: readonly PlayerFieldingMatchPerformance[] = fieldingRows.map((row) => ({ performanceId: String(row.PERFORMANCE_ID), matchId: String(row.MATCH_ID), matchDate: row.MATCH_DATE, venue: row.VENUE, catches: Number(row.CATCHES), stumpings: Number(row.STUMPINGS), directRunouts: Number(row.RUNS_OUT_DIRECT), byesConceded: Number(row.BYES_CONCEDED) }));
  return { ...base, battingPerformances, bowlingPerformances, fieldingPerformances };
}
