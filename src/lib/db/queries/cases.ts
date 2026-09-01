import "server-only";

import type { ComplaintRecord, IntegrityCaseListItem, IntegrityCaseRecord, IntegrityInvestigator, InvestigationAssignment, RulebookRecord } from "@/data/contracts";
import { queryRows, type BindParameters, type Connection } from "@/lib/db/oracle";

export type CaseListFilters = { page: number; pageSize: number; q?: string; status?: string; opened?: string; sort?: "opened" | "id" | "status" };
type CountRow = { TOTAL_ITEMS: number };
type CaseListRow = { CASE_ID: number; STATUS: string; DATE_OPENED: string; REFERRAL_STATUS: string; INVOLVED_PLAYER_COUNT: number; INVESTIGATOR_COUNT: number; COMPLAINT_COUNT: number; RULE_COUNT: number; EVIDENCE_COUNT: number };
type CaseBaseRow = CaseListRow & { INVOLVEMENT_TYPE: string | null; REFERRED_TO_AUTHORITY: string | null };
type InvolvementRow = { PLAYER_ID: number; FULL_NAME: string; PLAYER_ROLE: string; GENDER: "MALE" | "FEMALE"; INVOLVEMENT_TYPE: string | null; INVESTIGATOR_ID: number | null; INVESTIGATOR_NAME: string | null; DESIGNATION: string | null; DEPARTMENT: string | null };
type ComplaintRow = { COMPLAINT_ID: number; SOURCE_TYPE: string; DATE_RECEIVED: string; DESCRIPTION: string; MISCONDUCT_TYPE: string | null };
type RuleRow = { RULE_ID: number; CATEGORY: string; CLAUSE_NO: string };
type EvidenceRow = { EVIDENCE_NO: number; DESCRIPTION: string; COLLECTED_DATE: string };
const sortSql = { opened: "c.date_opened DESC, c.case_id DESC", id: "c.case_id", status: "c.status, c.date_opened DESC, c.case_id" } as const;

function buildWhere(filters: CaseListFilters) {
  const conditions = ["c.is_deleted = 0"];
  const binds: BindParameters = {};
  if (filters.q?.trim()) {
    conditions.push("(TO_CHAR(c.case_id) LIKE :search OR UPPER(NVL(c.referred_to_authority, '')) LIKE :search OR UPPER(NVL(c.involvement_type, '')) LIKE :search)");
    binds.search = `%${filters.q.trim().toUpperCase()}%`;
  }
  if (filters.status?.trim()) {
    conditions.push("UPPER(c.status) LIKE :caseStatus");
    binds.caseStatus = `%${filters.status.trim().toUpperCase()}%`;
  }
  if (filters.opened) {
    conditions.push("TRUNC(c.date_opened) = TO_DATE(:openedDate, 'YYYY-MM-DD')");
    binds.openedDate = filters.opened;
  }
  return { whereSql: conditions.join(" AND "), binds };
}

const countsSql = `
  (SELECT COUNT(*) FROM source_of s WHERE s.case_id = c.case_id AND s.is_deleted = 0) AS complaint_count,
  (SELECT COUNT(*) FROM involves_in ii WHERE ii.case_id = c.case_id AND ii.is_deleted = 0) AS involved_player_count,
  (SELECT COUNT(DISTINCT i.admin_id) FROM investigates i WHERE i.case_id = c.case_id AND i.is_deleted = 0) AS investigator_count,
  (SELECT COUNT(*) FROM violates v WHERE v.case_id = c.case_id AND v.is_deleted = 0) AS rule_count,
  (SELECT COUNT(*) FROM evidence e WHERE e.case_id = c.case_id AND e.is_deleted = 0) AS evidence_count`;

export async function listCases(connection: Connection, filters: CaseListFilters) {
  const { whereSql, binds } = buildWhere(filters);
  const countRows = await queryRows<CountRow>(connection, `SELECT COUNT(*) AS total_items FROM case_record c WHERE ${whereSql}`, binds);
  const rows = await queryRows<CaseListRow>(connection, `
    SELECT c.case_id, c.status, TO_CHAR(c.date_opened, 'YYYY-MM-DD') AS date_opened, c.referral_status, ${countsSql}
    FROM case_record c WHERE ${whereSql}
    ORDER BY ${sortSql[filters.sort ?? "opened"]}
    OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY
  `, { ...binds, rowOffset: (filters.page - 1) * filters.pageSize, rowLimit: filters.pageSize });
  const data: readonly IntegrityCaseListItem[] = rows.map((row) => ({ caseId: String(row.CASE_ID), status: row.STATUS, dateOpened: row.DATE_OPENED, referralStatus: row.REFERRAL_STATUS, involvedPlayerCount: Number(row.INVOLVED_PLAYER_COUNT), investigatorCount: Number(row.INVESTIGATOR_COUNT), complaintCount: Number(row.COMPLAINT_COUNT), ruleCount: Number(row.RULE_COUNT), evidenceCount: Number(row.EVIDENCE_COUNT) }));
  return { data, totalItems: Number(countRows[0]?.TOTAL_ITEMS ?? 0) };
}

export async function findCaseById(connection: Connection, caseId: number): Promise<IntegrityCaseRecord | null> {
  const baseRows = await queryRows<CaseBaseRow>(connection, `
    SELECT c.case_id, c.status, c.involvement_type, TO_CHAR(c.date_opened, 'YYYY-MM-DD') AS date_opened, c.referral_status, c.referred_to_authority, ${countsSql}
    FROM case_record c WHERE c.case_id = :caseId AND c.is_deleted = 0
  `, { caseId });
  const base = baseRows[0];
  if (!base) return null;
  const involvementRows = await queryRows<InvolvementRow>(connection, `
    SELECT p.person_id AS player_id, p.first_name || ' ' || p.last_name AS full_name, pl.player_role, pl.gender,
           c.involvement_type, inv.admin_id AS investigator_id,
           ap.first_name || ' ' || ap.last_name AS investigator_name, a.designation, a.department
    FROM involves_in ii JOIN case_record c ON c.case_id = ii.case_id AND c.is_deleted = 0 JOIN player pl ON pl.person_id = ii.person_id AND pl.is_deleted = 0 JOIN person p ON p.person_id = pl.person_id AND p.is_deleted = 0
    LEFT JOIN investigates inv ON inv.person_id = ii.person_id AND inv.case_id = ii.case_id AND inv.is_deleted = 0
    LEFT JOIN admin a ON a.person_id = inv.admin_id AND a.is_deleted = 0 LEFT JOIN person ap ON ap.person_id = a.person_id AND ap.is_deleted = 0
    WHERE ii.case_id = :caseId AND ii.is_deleted = 0 ORDER BY p.last_name, p.first_name, p.person_id
  `, { caseId });
  const complaintRows = await queryRows<ComplaintRow>(connection, `
    SELECT c.complaint_id, c.source_type, TO_CHAR(c.date_received, 'YYYY-MM-DD') AS date_received, c.description, c.misconduct_type
    FROM source_of s JOIN complaint c ON c.complaint_id = s.complaint_id AND c.is_deleted = 0
    WHERE s.case_id = :caseId AND s.is_deleted = 0 ORDER BY c.date_received, c.complaint_id
  `, { caseId });
  const ruleRows = await queryRows<RuleRow>(connection, `SELECT r.rule_id, r.category, r.clause_no FROM violates v JOIN rulebook r ON r.rule_id = v.rule_id WHERE v.case_id = :caseId AND v.is_deleted = 0 AND r.is_deleted = 0 ORDER BY r.category, r.clause_no`, { caseId });
  const evidenceRows = await queryRows<EvidenceRow>(connection, `SELECT evidence_no, description, TO_CHAR(collected_date, 'YYYY-MM-DD') AS collected_date FROM evidence WHERE case_id = :caseId AND is_deleted = 0 ORDER BY evidence_no`, { caseId });

  const assignmentsByPlayer = new Map<string, InvestigationAssignment>();
  const investigatorsById = new Map<string, { administratorId: string; fullName: string; designation: string; department: string; assignedPlayerIds: string[] }>();
  for (const row of involvementRows) {
    const playerId = String(row.PLAYER_ID);
    const existing = assignmentsByPlayer.get(playerId) ?? { player: { personId: playerId, fullName: row.FULL_NAME, playerRole: row.PLAYER_ROLE, gender: row.GENDER }, involvementType: row.INVOLVEMENT_TYPE ?? "Not recorded", investigatorIds: [] };
    if (row.INVESTIGATOR_ID !== null) {
      const investigatorId = String(row.INVESTIGATOR_ID);
      assignmentsByPlayer.set(playerId, { ...existing, investigatorIds: [...new Set([...existing.investigatorIds, investigatorId])] });
      const investigator = investigatorsById.get(investigatorId) ?? { administratorId: investigatorId, fullName: row.INVESTIGATOR_NAME ?? investigatorId, designation: row.DESIGNATION ?? "", department: row.DEPARTMENT ?? "", assignedPlayerIds: [] };
      investigator.assignedPlayerIds = [...new Set([...investigator.assignedPlayerIds, playerId])];
      investigatorsById.set(investigatorId, investigator);
    } else assignmentsByPlayer.set(playerId, existing);
  }
  const complaints: readonly ComplaintRecord[] = complaintRows.map((row) => ({ complaintId: String(row.COMPLAINT_ID), sourceType: row.SOURCE_TYPE, dateReceived: row.DATE_RECEIVED, description: row.DESCRIPTION, misconductType: row.MISCONDUCT_TYPE ?? undefined, caseIds: [String(base.CASE_ID)] }));
  const rules: readonly RulebookRecord[] = ruleRows.map((row) => ({ ruleId: String(row.RULE_ID), clauseNumber: row.CLAUSE_NO, category: row.CATEGORY, caseIds: [String(base.CASE_ID)] }));
  const investigators: readonly IntegrityInvestigator[] = [...investigatorsById.values()];
  return { caseId: String(base.CASE_ID), status: base.STATUS, dateOpened: base.DATE_OPENED, referralStatus: base.REFERRAL_STATUS, referredToAuthority: base.REFERRED_TO_AUTHORITY ?? undefined, complaints, involvedPlayers: [...assignmentsByPlayer.values()], rules, evidence: evidenceRows.map((row) => ({ evidenceNumber: String(row.EVIDENCE_NO), description: row.DESCRIPTION, collectedDate: row.COLLECTED_DATE })), investigators };
}
