import "server-only";

import type { DashboardMetricValues, DashboardOverviewData, DashboardTableRow, PlayerPerformanceRecord } from "@/data/contracts";
import type { RoleId } from "@/features/auth/types";
import { queryRows, type Connection } from "@/lib/db/oracle";
import { listCases } from "@/lib/db/queries/cases";
import { listComplaints } from "@/lib/db/queries/complaints";
import { listMatches } from "@/lib/db/queries/matches";
import { listPlayerPerformance, findPlayerPerformance } from "@/lib/db/queries/performance";
import { listPlayers } from "@/lib/db/queries/players";
import { listTeams } from "@/lib/db/queries/teams";
import { listTournaments } from "@/lib/db/queries/tournaments";

type PerformanceCountRow = { CAREER_COUNT: number; BATTING_COUNT: number; BOWLING_COUNT: number; FIELDING_COUNT: number };
type MatchOperationCountRow = { MATCH_COUNT: number; TOURNAMENT_COUNT: number; PERFORMANCE_COUNT: number; OBSERVATION_COUNT: number };
type IntegrityCountRow = { INVESTIGATOR_COUNT: number; EVIDENCE_COUNT: number };
type PerformanceCoverageRow = { MATCH_ID: number; MATCH_DATE: string; PERSON_ID: number; PLAYER_NAME: string; BATTING_COUNT: number; BOWLING_COUNT: number; FIELDING_COUNT: number };
type MatchCoverageRow = { MATCH_ID: number; BATTING_COUNT: number; BOWLING_COUNT: number; FIELDING_COUNT: number };
type ObservationRow = { MATCH_ID: number; PLAYER_NAME: string; OBSERVATION_DATE: string; REMARKS: string | null };

function metrics(first: number, second: number, third: number, fourth: number): DashboardMetricValues {
  return [first, second, third, fourth];
}

function row(key: string, cells: readonly (string | number)[], href?: string): DashboardTableRow {
  return { key, cells: cells.map(String), href };
}

async function administrationDashboard(connection: Connection, superAdministrator: boolean): Promise<DashboardOverviewData> {
  const players = await listPlayers(connection, { page: 1, pageSize: 5, sort: "id" });
  const teams = await listTeams(connection, { page: 1, pageSize: 1, sort: "id" });
  const tournaments = await listTournaments(connection, { page: 1, pageSize: superAdministrator ? 5 : 1, sort: "season" });

  if (!superAdministrator) {
    const matches = await listMatches(connection, { page: 1, pageSize: 5, sort: "date" });
    return {
      metricValues: metrics(players.totalItems, teams.totalItems, tournaments.totalItems, matches.totalItems),
      primaryRows: matches.data.map((match) => row(match.matchId, [match.matchId, match.tournamentName, match.participatingTeams || "—", match.matchDate, match.venue], `/matches/${match.matchId}`)),
      secondaryRows: players.data.map((player) => row(player.personId, [player.fullName, player.personId, player.playerRole, player.teamAssociationCount], `/players/${player.personId}`)),
      tertiaryRows: [],
    };
  }

  const cases = await listCases(connection, { page: 1, pageSize: 5, sort: "opened" });
  return {
    metricValues: metrics(players.totalItems, teams.totalItems, tournaments.totalItems, cases.totalItems),
    primaryRows: tournaments.data.map((tournament) => row(tournament.tournamentId, [tournament.seasonYear ? `${tournament.tournamentName} ${tournament.seasonYear}` : tournament.tournamentName, tournament.tierLevel, tournament.teamCount, tournament.matchCount], `/tournaments/${tournament.tournamentId}`)),
    secondaryRows: cases.data.map((caseRecord) => row(caseRecord.caseId, [caseRecord.caseId, caseRecord.status, caseRecord.dateOpened, caseRecord.complaintCount], `/integrity/cases/${caseRecord.caseId}`)),
    tertiaryRows: [],
  };
}

async function performanceDashboard(connection: Connection): Promise<DashboardOverviewData> {
  const counts = (await queryRows<PerformanceCountRow>(connection, `
    SELECT
      (SELECT COUNT(*) FROM career_record WHERE is_deleted = 0) AS career_count,
      (SELECT COUNT(*) FROM batting_summary WHERE is_deleted = 0) AS batting_count,
      (SELECT COUNT(*) FROM bowling_summary WHERE is_deleted = 0) AS bowling_count,
      (SELECT COUNT(*) FROM fielding_summary WHERE is_deleted = 0) AS fielding_count
    FROM dual
  `))[0];
  const players = await listPlayerPerformance(connection, { page: 1, pageSize: 5, sort: "matches" });
  const coverage = await queryRows<PerformanceCoverageRow>(connection, `
    WITH performance_entry AS (
      SELECT bp.match_id, cr.person_id, 'BATTING' AS performance_type
      FROM batting_performance bp JOIN batting_summary bs ON bs.bat_summary_id = bp.bat_summary_id AND bs.is_deleted = 0 JOIN career_record cr ON cr.record_id = bs.record_id AND cr.is_deleted = 0
      WHERE bp.is_deleted = 0
      UNION ALL
      SELECT bp.match_id, cr.person_id, 'BOWLING'
      FROM bowling_performance bp JOIN bowling_summary bs ON bs.bowl_summary_id = bp.bowl_summary_id AND bs.is_deleted = 0 JOIN career_record cr ON cr.record_id = bs.record_id AND cr.is_deleted = 0
      WHERE bp.is_deleted = 0
      UNION ALL
      SELECT fp.match_id, cr.person_id, 'FIELDING'
      FROM fielding_performance fp JOIN fielding_summary fs ON fs.field_summary_id = fp.field_summary_id AND fs.is_deleted = 0 JOIN career_record cr ON cr.record_id = fs.record_id AND cr.is_deleted = 0
      WHERE fp.is_deleted = 0
    )
    SELECT pe.match_id, TO_CHAR(m.match_date, 'YYYY-MM-DD') AS match_date, p.person_id,
           p.first_name || ' ' || p.last_name AS player_name,
           SUM(CASE WHEN pe.performance_type = 'BATTING' THEN 1 ELSE 0 END) AS batting_count,
           SUM(CASE WHEN pe.performance_type = 'BOWLING' THEN 1 ELSE 0 END) AS bowling_count,
           SUM(CASE WHEN pe.performance_type = 'FIELDING' THEN 1 ELSE 0 END) AS fielding_count
    FROM performance_entry pe JOIN match m ON m.match_id = pe.match_id AND m.is_deleted = 0 JOIN person p ON p.person_id = pe.person_id AND p.is_deleted = 0 JOIN player pl ON pl.person_id = p.person_id AND pl.is_deleted = 0
    GROUP BY pe.match_id, m.match_date, p.person_id, p.first_name, p.last_name
    ORDER BY m.match_date DESC, pe.match_id DESC, p.person_id
    FETCH FIRST 5 ROWS ONLY
  `);
  return {
    metricValues: metrics(Number(counts?.CAREER_COUNT ?? 0), Number(counts?.BATTING_COUNT ?? 0), Number(counts?.BOWLING_COUNT ?? 0), Number(counts?.FIELDING_COUNT ?? 0)),
    primaryRows: players.data.map((player) => row(player.personId, [player.fullName, player.careerRecordCount, player.matchesPlayed, player.battingSummaryCount, player.bowlingSummaryCount, player.fieldingSummaryCount], `/performance/players/${player.personId}`)),
    secondaryRows: coverage.map((entry) => row(`${entry.MATCH_ID}-${entry.PERSON_ID}`, [entry.MATCH_ID, entry.PLAYER_NAME, entry.BATTING_COUNT, entry.BOWLING_COUNT, entry.FIELDING_COUNT], `/matches/${entry.MATCH_ID}`)),
    tertiaryRows: [],
  };
}

async function matchOfficialDashboard(connection: Connection): Promise<DashboardOverviewData> {
  const counts = (await queryRows<MatchOperationCountRow>(connection, `
    SELECT
      (SELECT COUNT(*) FROM match WHERE is_deleted = 0) AS match_count,
      (SELECT COUNT(*) FROM tournament WHERE is_deleted = 0) AS tournament_count,
      ((SELECT COUNT(*) FROM batting_performance WHERE is_deleted = 0) + (SELECT COUNT(*) FROM bowling_performance WHERE is_deleted = 0) + (SELECT COUNT(*) FROM fielding_performance WHERE is_deleted = 0)) AS performance_count,
      (SELECT COUNT(*) FROM observes WHERE is_deleted = 0) AS observation_count
    FROM dual
  `))[0];
  const matches = await listMatches(connection, { page: 1, pageSize: 5, sort: "date" });
  const coverage = await queryRows<MatchCoverageRow>(connection, `
    SELECT m.match_id,
      (SELECT COUNT(*) FROM batting_performance bp WHERE bp.match_id = m.match_id AND bp.is_deleted = 0) AS batting_count,
      (SELECT COUNT(*) FROM bowling_performance bp WHERE bp.match_id = m.match_id AND bp.is_deleted = 0) AS bowling_count,
      (SELECT COUNT(*) FROM fielding_performance fp WHERE fp.match_id = m.match_id AND fp.is_deleted = 0) AS fielding_count
    FROM match m WHERE m.is_deleted = 0
    ORDER BY m.match_date DESC, m.match_id DESC FETCH FIRST 5 ROWS ONLY
  `);
  const observations = await queryRows<ObservationRow>(connection, `
    SELECT o.match_id, p.first_name || ' ' || p.last_name AS player_name,
           TO_CHAR(o.observation_date, 'YYYY-MM-DD') AS observation_date, o.remarks
    FROM observes o JOIN person p ON p.person_id = o.player_id AND p.is_deleted = 0 JOIN match m ON m.match_id = o.match_id AND m.is_deleted = 0
    WHERE o.is_deleted = 0 ORDER BY o.observation_date DESC, o.match_id DESC FETCH FIRST 5 ROWS ONLY
  `);
  return {
    metricValues: metrics(Number(counts?.MATCH_COUNT ?? 0), Number(counts?.TOURNAMENT_COUNT ?? 0), Number(counts?.PERFORMANCE_COUNT ?? 0), Number(counts?.OBSERVATION_COUNT ?? 0)),
    primaryRows: matches.data.map((match) => row(match.matchId, [match.matchId, match.tournamentName, match.participatingTeams || "—", match.matchDate, match.venue, "View"], `/matches/${match.matchId}`)),
    secondaryRows: coverage.map((entry) => row(`coverage-${entry.MATCH_ID}`, [entry.MATCH_ID, entry.BATTING_COUNT, entry.BOWLING_COUNT, entry.FIELDING_COUNT], `/matches/${entry.MATCH_ID}`)),
    tertiaryRows: observations.map((entry, index) => row(`observation-${entry.MATCH_ID}-${index}`, [entry.MATCH_ID, entry.PLAYER_NAME, entry.OBSERVATION_DATE, entry.REMARKS ?? "—"], `/matches/${entry.MATCH_ID}`)),
  };
}

async function integrityDashboard(connection: Connection): Promise<DashboardOverviewData> {
  const complaints = await listComplaints(connection, { page: 1, pageSize: 5, sort: "received" });
  const cases = await listCases(connection, { page: 1, pageSize: 5, sort: "opened" });
  const counts = (await queryRows<IntegrityCountRow>(connection, `
    SELECT
      (SELECT COUNT(DISTINCT admin_id) FROM investigates WHERE is_deleted = 0) AS investigator_count,
      (SELECT COUNT(*) FROM evidence WHERE is_deleted = 0) AS evidence_count
    FROM dual
  `))[0];
  return {
    metricValues: metrics(complaints.totalItems, cases.totalItems, Number(counts?.INVESTIGATOR_COUNT ?? 0), Number(counts?.EVIDENCE_COUNT ?? 0)),
    primaryRows: cases.data.map((caseRecord) => row(caseRecord.caseId, [caseRecord.caseId, caseRecord.status, caseRecord.dateOpened, caseRecord.involvedPlayerCount, caseRecord.investigatorCount], `/integrity/cases/${caseRecord.caseId}`)),
    secondaryRows: complaints.data.map((complaint) => row(complaint.complaintId, [complaint.complaintId, complaint.dateReceived, complaint.sourceType, complaint.linkedCaseCount], `/integrity/complaints/${complaint.complaintId}`)),
    tertiaryRows: [],
  };
}

function playerDashboardRows(record: PlayerPerformanceRecord): DashboardOverviewData {
  const performanceByMatch = new Map<string, { date: string; batting: number; bowling: number; fielding: number }>();
  for (const performance of record.battingPerformances) performanceByMatch.set(performance.matchId, { ...(performanceByMatch.get(performance.matchId) ?? { date: performance.matchDate, batting: 0, bowling: 0, fielding: 0 }), batting: 1 });
  for (const performance of record.bowlingPerformances) performanceByMatch.set(performance.matchId, { ...(performanceByMatch.get(performance.matchId) ?? { date: performance.matchDate, batting: 0, bowling: 0, fielding: 0 }), bowling: 1 });
  for (const performance of record.fieldingPerformances) performanceByMatch.set(performance.matchId, { ...(performanceByMatch.get(performance.matchId) ?? { date: performance.matchDate, batting: 0, bowling: 0, fielding: 0 }), fielding: 1 });
  const performanceCount = record.battingPerformances.length + record.bowlingPerformances.length + record.fieldingPerformances.length;
  return {
    metricValues: metrics(record.teams.length, record.careerRecords.length, performanceByMatch.size, performanceCount),
    primaryRows: record.careerRecords.slice(0, 5).map((career) => row(career.recordId, [career.tierLevel, career.locationType, career.matchesPlayed, career.batting.length, career.bowling.length, career.fielding.length], `/performance/players/${record.personId}`)),
    secondaryRows: [...performanceByMatch.entries()].sort((left, right) => right[1].date.localeCompare(left[1].date)).slice(0, 5).map(([matchId, entry]) => row(matchId, [matchId, entry.date, entry.batting ? "Recorded" : "—", entry.bowling ? "Recorded" : "—", entry.fielding ? "Recorded" : "—"], `/matches/${matchId}`)),
    tertiaryRows: [],
  };
}

export async function getDashboardOverview(connection: Connection, role: RoleId, personId: number): Promise<DashboardOverviewData> {
  if (role === "super-admin") return administrationDashboard(connection, true);
  if (role === "board-admin") return administrationDashboard(connection, false);
  if (role === "performance-manager") return performanceDashboard(connection);
  if (role === "match-official") return matchOfficialDashboard(connection);
  if (role === "integrity-officer") return integrityDashboard(connection);
  const record = await findPlayerPerformance(connection, personId);
  return record ? playerDashboardRows(record) : { metricValues: metrics(0, 0, 0, 0), primaryRows: [], secondaryRows: [], tertiaryRows: [] };
}
