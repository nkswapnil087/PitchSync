import "server-only";

import type {
  BattingSummary,
  BowlingSummary,
  CareerRecord,
  FieldingSummary,
  PlayerListItem,
  PlayerRecord,
  SelectOption,
  TeamAssociation,
} from "@/data/contracts";
import { queryRows, type BindParameters, type Connection } from "@/lib/db/oracle";

export type PlayerListFilters = {
  page: number;
  pageSize: number;
  q?: string;
  role?: string;
  gender?: string;
  team?: string;
  sort?: "name" | "id" | "role";
};

type CountRow = { TOTAL_ITEMS: number };
type PlayerListRow = {
  PERSON_ID: number;
  FULL_NAME: string;
  PLAYER_ROLE: string;
  GENDER: "MALE" | "FEMALE";
  PHONE: string | null;
  TEAM_ASSOCIATION_COUNT: number;
};
type PlayerBaseRow = {
  PERSON_ID: number;
  FIRST_NAME: string;
  LAST_NAME: string;
  DOB: string;
  PRESENT_ADDRESS_LINE: string | null;
  PRESENT_UPAZILA: string | null;
  PRESENT_DISTRICT: string | null;
  PRESENT_DIVISION: string | null;
  PERMANENT_ADDRESS_LINE: string | null;
  PERMANENT_UPAZILA: string | null;
  PERMANENT_DISTRICT: string | null;
  PERMANENT_DIVISION: string | null;
  PLAYER_ROLE: string;
  GENDER: "MALE" | "FEMALE";
  FAMILY_BACKGROUND: string | null;
};
type ValueRow = { VALUE: string };
type EducationRow = { DEGREE_CLASS: string; INSTITUTE_OR_BOARD: string; RESULT: string | null; SUBJECT: string | null };
type TeamRow = { TEAM_ID: number; TEAM_NAME: string; CATEGORY: string; FRANCHISE_OWNER: string | null };
type CareerRow = { RECORD_ID: number; TIER_LEVEL: string; LOCATION_TYPE: string; MATCHES_PLAYED: number; START_DATE: string; END_DATE: string | null };
type BattingRow = { SUMMARY_ID: number; RECORD_ID: number; FORMAT: string; TOTAL_RUNS: number; BATTING_AVERAGE: number; STRIKE_RATE: number; HIGHEST_SCORE: number };
type BowlingRow = { SUMMARY_ID: number; RECORD_ID: number; FORMAT: string; TOTAL_WICKETS: number; BOWLING_AVERAGE: number; BEST_BOWLING_FIGURES: string };
type FieldingRow = { SUMMARY_ID: number; RECORD_ID: number; FORMAT: string; TOTAL_CATCHES: number; TOTAL_STUMPINGS: number; TOTAL_RUNOUTS: number; MOST_DISMISSALS_IN_MATCH: number };

const playerSortSql = {
  name: "p.first_name, p.last_name, p.person_id",
  id: "p.person_id",
  role: "pl.player_role, p.first_name, p.last_name",
} as const;

function buildPlayerWhere(filters: PlayerListFilters) {
  const conditions = ["p.is_deleted = 0", "pl.is_deleted = 0"];
  const binds: BindParameters = {};

  if (filters.q?.trim()) {
    conditions.push("(UPPER(p.first_name || ' ' || p.last_name) LIKE :search OR TO_CHAR(p.person_id) LIKE :search)");
    binds.search = `%${filters.q.trim().toUpperCase()}%`;
  }
  if (filters.role) {
    conditions.push("pl.player_role = :role");
    binds.role = filters.role;
  }
  if (filters.gender) {
    conditions.push("pl.gender = :gender");
    binds.gender = filters.gender;
  }
  if (filters.team) {
    conditions.push("EXISTS (SELECT 1 FROM plays_for pf_filter WHERE pf_filter.person_id = p.person_id AND pf_filter.team_id = :teamId AND pf_filter.is_deleted = 0)");
    binds.teamId = Number(filters.team);
  }

  return { whereSql: conditions.join(" AND "), binds };
}

export async function listPlayers(connection: Connection, filters: PlayerListFilters) {
  const { whereSql, binds } = buildPlayerWhere(filters);
  const countRows = await queryRows<CountRow>(connection, `
    SELECT COUNT(*) AS total_items
    FROM person p
    JOIN player pl ON pl.person_id = p.person_id
    WHERE ${whereSql}
  `, binds);
  const totalItems = Number(countRows[0]?.TOTAL_ITEMS ?? 0);
  const offset = (filters.page - 1) * filters.pageSize;
  const sortSql = playerSortSql[filters.sort ?? "name"];
  const rows = await queryRows<PlayerListRow>(connection, `
    SELECT
      p.person_id,
      p.first_name || ' ' || p.last_name AS full_name,
      pl.player_role,
      pl.gender,
      (SELECT MIN(pp.phone) FROM person_phone pp WHERE pp.person_id = p.person_id AND pp.is_deleted = 0) AS phone,
      (SELECT COUNT(DISTINCT pf.team_id) FROM plays_for pf WHERE pf.person_id = p.person_id AND pf.is_deleted = 0) AS team_association_count
    FROM person p
    JOIN player pl ON pl.person_id = p.person_id
    WHERE ${whereSql}
    ORDER BY ${sortSql}
    OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY
  `, { ...binds, rowOffset: offset, rowLimit: filters.pageSize });

  const data: readonly PlayerListItem[] = rows.map((row) => ({
    personId: String(row.PERSON_ID),
    fullName: row.FULL_NAME,
    playerRole: row.PLAYER_ROLE,
    gender: row.GENDER,
    phone: row.PHONE ?? undefined,
    teamAssociationCount: Number(row.TEAM_ASSOCIATION_COUNT),
  }));

  return { data, totalItems };
}

export async function listPlayerTeamOptions(connection: Connection): Promise<readonly SelectOption[]> {
  const rows = await queryRows<TeamRow>(connection, `
    SELECT team_id, team_name, category, franchise_owner
    FROM team
    WHERE is_deleted = 0
    ORDER BY team_name, team_id
  `);
  return rows.map((row) => ({ value: String(row.TEAM_ID), label: row.TEAM_NAME }));
}

function formatAddress(parts: readonly (string | null)[]) {
  const address = parts.filter((part): part is string => Boolean(part?.trim())).join(", ");
  return address || undefined;
}

function formatEducation(row: EducationRow) {
  return [row.DEGREE_CLASS, row.SUBJECT, row.INSTITUTE_OR_BOARD, row.RESULT].filter(Boolean).join(" · ");
}

export async function findPlayerById(connection: Connection, playerId: number): Promise<PlayerRecord | null> {
  const baseRows = await queryRows<PlayerBaseRow>(connection, `
    SELECT
      p.person_id,
      p.first_name,
      p.last_name,
      TO_CHAR(p.dob, 'YYYY-MM-DD') AS dob,
      p.present_address.address_line AS present_address_line,
      p.present_address.upazila_or_thana AS present_upazila,
      p.present_address.district AS present_district,
      p.present_address.division AS present_division,
      p.permanent_address.address_line AS permanent_address_line,
      p.permanent_address.upazila_or_thana AS permanent_upazila,
      p.permanent_address.district AS permanent_district,
      p.permanent_address.division AS permanent_division,
      pl.player_role,
      pl.gender,
      pl.family_background
    FROM person p
    JOIN player pl ON pl.person_id = p.person_id
    WHERE p.person_id = :playerId
      AND p.is_deleted = 0
      AND pl.is_deleted = 0
  `, { playerId });
  const base = baseRows[0];
  if (!base) return null;

  const phoneRows = await queryRows<ValueRow>(connection, `SELECT phone AS value FROM person_phone WHERE person_id = :playerId AND is_deleted = 0 ORDER BY phone`, { playerId });
  const achievementRows = await queryRows<ValueRow>(connection, `SELECT achievement AS value FROM player_achievement WHERE person_id = :playerId AND is_deleted = 0 ORDER BY achievement`, { playerId });
  const educationRows = await queryRows<EducationRow>(connection, `
    SELECT
      pe.education_info.degree_class AS degree_class,
      pe.education_info.institute_or_board AS institute_or_board,
      pe.education_info.result AS result,
      pe.education_info.subject AS subject
    FROM player_education pe
    WHERE pe.person_id = :playerId AND pe.is_deleted = 0
    ORDER BY pe.education_no
  `, { playerId });
  const teamRows = await queryRows<TeamRow>(connection, `
    SELECT DISTINCT t.team_id, t.team_name, t.category, t.franchise_owner
    FROM plays_for pf
    JOIN team t ON t.team_id = pf.team_id AND t.is_deleted = 0
    WHERE pf.person_id = :playerId AND pf.is_deleted = 0
    ORDER BY t.team_name, t.team_id
  `, { playerId });
  const careerRows = await queryRows<CareerRow>(connection, `
    SELECT record_id, tier_level, location_type, matches_played,
           TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
           TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date
    FROM career_record
    WHERE person_id = :playerId AND is_deleted = 0
    ORDER BY start_date DESC, record_id DESC
  `, { playerId });
  const battingRows = await queryRows<BattingRow>(connection, `
    SELECT bs.bat_summary_id AS summary_id, bs.record_id, bs.format, bs.total_runs,
           bs.batting_avg AS batting_average, bs.strike_rate, bs.highest_score
    FROM batting_summary bs
    JOIN career_record cr ON cr.record_id = bs.record_id AND cr.is_deleted = 0
    WHERE cr.person_id = :playerId AND bs.is_deleted = 0
    ORDER BY bs.record_id, bs.format
  `, { playerId });
  const bowlingRows = await queryRows<BowlingRow>(connection, `
    SELECT bs.bowl_summary_id AS summary_id, bs.record_id, bs.format, bs.total_wickets,
           bs.bowling_avg AS bowling_average, bs.best_bowling_figures
    FROM bowling_summary bs
    JOIN career_record cr ON cr.record_id = bs.record_id AND cr.is_deleted = 0
    WHERE cr.person_id = :playerId AND bs.is_deleted = 0
    ORDER BY bs.record_id, bs.format
  `, { playerId });
  const fieldingRows = await queryRows<FieldingRow>(connection, `
    SELECT fs.field_summary_id AS summary_id, fs.record_id, fs.format, fs.total_catches,
           fs.total_stumpings, fs.total_runouts, fs.most_dismissals_in_match
    FROM fielding_summary fs
    JOIN career_record cr ON cr.record_id = fs.record_id AND cr.is_deleted = 0
    WHERE cr.person_id = :playerId AND fs.is_deleted = 0
    ORDER BY fs.record_id, fs.format
  `, { playerId });

  const battingByRecord = new Map<string, BattingSummary[]>();
  for (const row of battingRows) {
    const key = String(row.RECORD_ID);
    const summaries = battingByRecord.get(key) ?? [];
    summaries.push({ summaryId: String(row.SUMMARY_ID), format: row.FORMAT, totalRuns: Number(row.TOTAL_RUNS), battingAverage: Number(row.BATTING_AVERAGE), strikeRate: Number(row.STRIKE_RATE), highestScore: Number(row.HIGHEST_SCORE) });
    battingByRecord.set(key, summaries);
  }
  const bowlingByRecord = new Map<string, BowlingSummary[]>();
  for (const row of bowlingRows) {
    const key = String(row.RECORD_ID);
    const summaries = bowlingByRecord.get(key) ?? [];
    summaries.push({ summaryId: String(row.SUMMARY_ID), format: row.FORMAT, totalWickets: Number(row.TOTAL_WICKETS), bowlingAverage: Number(row.BOWLING_AVERAGE), bestBowlingFigures: row.BEST_BOWLING_FIGURES });
    bowlingByRecord.set(key, summaries);
  }
  const fieldingByRecord = new Map<string, FieldingSummary[]>();
  for (const row of fieldingRows) {
    const key = String(row.RECORD_ID);
    const summaries = fieldingByRecord.get(key) ?? [];
    summaries.push({ summaryId: String(row.SUMMARY_ID), format: row.FORMAT, totalCatches: Number(row.TOTAL_CATCHES), totalStumpings: Number(row.TOTAL_STUMPINGS), totalRunouts: Number(row.TOTAL_RUNOUTS), mostDismissalsInMatch: String(row.MOST_DISMISSALS_IN_MATCH) });
    fieldingByRecord.set(key, summaries);
  }

  const teams: readonly TeamAssociation[] = teamRows.map((row) => ({ team: { teamId: String(row.TEAM_ID), teamName: row.TEAM_NAME, category: row.CATEGORY, franchiseOwner: row.FRANCHISE_OWNER ?? undefined } }));
  const careerRecords: readonly CareerRecord[] = careerRows.map((row) => ({
    recordId: String(row.RECORD_ID),
    tierLevel: row.TIER_LEVEL,
    locationType: row.LOCATION_TYPE,
    matchesPlayed: Number(row.MATCHES_PLAYED),
    startDate: row.START_DATE,
    endDate: row.END_DATE ?? undefined,
    batting: battingByRecord.get(String(row.RECORD_ID)) ?? [],
    bowling: bowlingByRecord.get(String(row.RECORD_ID)) ?? [],
    fielding: fieldingByRecord.get(String(row.RECORD_ID)) ?? [],
  }));

  return {
    personId: String(base.PERSON_ID),
    fullName: `${base.FIRST_NAME} ${base.LAST_NAME}`,
    playerRole: base.PLAYER_ROLE,
    gender: base.GENDER,
    person: {
      personId: String(base.PERSON_ID),
      firstName: base.FIRST_NAME,
      lastName: base.LAST_NAME,
      dateOfBirth: base.DOB,
      presentAddress: formatAddress([base.PRESENT_ADDRESS_LINE, base.PRESENT_UPAZILA, base.PRESENT_DISTRICT, base.PRESENT_DIVISION]),
      permanentAddress: formatAddress([base.PERMANENT_ADDRESS_LINE, base.PERMANENT_UPAZILA, base.PERMANENT_DISTRICT, base.PERMANENT_DIVISION]),
      presentAddressDetails: { addressLine: base.PRESENT_ADDRESS_LINE ?? undefined, upazilaOrThana: base.PRESENT_UPAZILA ?? undefined, district: base.PRESENT_DISTRICT ?? undefined, division: base.PRESENT_DIVISION ?? undefined },
      permanentAddressDetails: { addressLine: base.PERMANENT_ADDRESS_LINE ?? undefined, upazilaOrThana: base.PERMANENT_UPAZILA ?? undefined, district: base.PERMANENT_DISTRICT ?? undefined, division: base.PERMANENT_DIVISION ?? undefined },
      phones: phoneRows.map((row) => row.VALUE),
    },
    education: educationRows.length > 0 ? educationRows.map(formatEducation).join("; ") : undefined,
    familyBackground: base.FAMILY_BACKGROUND ?? undefined,
    achievements: achievementRows.map((row) => row.VALUE),
    teams,
    careerRecords,
  };
}
