import "server-only";

import type { RulebookListItem, RulebookRecord } from "@/data/contracts";
import { queryRows, type BindParameters, type Connection } from "@/lib/db/oracle";

export type RulebookListFilters = { page: number; pageSize: number; q?: string; category?: string; sort?: "clause" | "id" | "category" };
type CountRow = { TOTAL_ITEMS: number };
type RuleListRow = { RULE_ID: number; CLAUSE_NO: string; CATEGORY: string; LINKED_CASE_COUNT: number };
type RuleDetailRow = { RULE_ID: number; CLAUSE_NO: string; CATEGORY: string; CASE_ID: number | null; STATUS: string | null; DATE_OPENED: string | null; REFERRAL_STATUS: string | null; INVOLVED_PLAYER_COUNT: number };
const sortSql = { clause: "r.category, r.clause_no, r.rule_id", id: "r.rule_id", category: "r.category, r.clause_no, r.rule_id" } as const;

function buildWhere(filters: RulebookListFilters) {
  const conditions = ["r.is_deleted = 0"];
  const binds: BindParameters = {};
  if (filters.q?.trim()) {
    conditions.push("(TO_CHAR(r.rule_id) LIKE :search OR UPPER(r.clause_no) LIKE :search OR UPPER(r.category) LIKE :search)");
    binds.search = `%${filters.q.trim().toUpperCase()}%`;
  }
  if (filters.category?.trim()) {
    conditions.push("UPPER(r.category) LIKE :category");
    binds.category = `%${filters.category.trim().toUpperCase()}%`;
  }
  return { whereSql: conditions.join(" AND "), binds };
}

export async function listRules(connection: Connection, filters: RulebookListFilters) {
  const { whereSql, binds } = buildWhere(filters);
  const countRows = await queryRows<CountRow>(connection, `SELECT COUNT(*) AS total_items FROM rulebook r WHERE ${whereSql}`, binds);
  const rows = await queryRows<RuleListRow>(connection, `
    SELECT r.rule_id, r.clause_no, r.category,
           (SELECT COUNT(*) FROM violates v JOIN case_record c ON c.case_id = v.case_id AND c.is_deleted = 0 WHERE v.rule_id = r.rule_id AND v.is_deleted = 0) AS linked_case_count
    FROM rulebook r WHERE ${whereSql}
    ORDER BY ${sortSql[filters.sort ?? "clause"]}
    OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY
  `, { ...binds, rowOffset: (filters.page - 1) * filters.pageSize, rowLimit: filters.pageSize });
  const data: readonly RulebookListItem[] = rows.map((row) => ({ ruleId: String(row.RULE_ID), clauseNumber: row.CLAUSE_NO, category: row.CATEGORY, linkedCaseCount: Number(row.LINKED_CASE_COUNT) }));
  return { data, totalItems: Number(countRows[0]?.TOTAL_ITEMS ?? 0) };
}

export async function findRuleById(connection: Connection, ruleId: number): Promise<RulebookRecord | null> {
  const rows = await queryRows<RuleDetailRow>(connection, `
    SELECT r.rule_id, r.clause_no, r.category, c.case_id, c.status,
           TO_CHAR(c.date_opened, 'YYYY-MM-DD') AS date_opened, c.referral_status,
           CASE WHEN c.case_id IS NULL THEN 0 ELSE (SELECT COUNT(*) FROM involves_in ii WHERE ii.case_id = c.case_id AND ii.is_deleted = 0) END AS involved_player_count
    FROM rulebook r LEFT JOIN violates v ON v.rule_id = r.rule_id AND v.is_deleted = 0
    LEFT JOIN case_record c ON c.case_id = v.case_id AND c.is_deleted = 0
    WHERE r.rule_id = :ruleId AND r.is_deleted = 0
    ORDER BY c.date_opened DESC, c.case_id DESC
  `, { ruleId });
  const first = rows[0];
  if (!first) return null;
  const linkedCases = rows.filter((row) => row.CASE_ID !== null).map((row) => ({ caseId: String(row.CASE_ID), status: row.STATUS ?? "", dateOpened: row.DATE_OPENED ?? "", referralStatus: row.REFERRAL_STATUS ?? undefined, involvedPlayerCount: Number(row.INVOLVED_PLAYER_COUNT) }));
  return { ruleId: String(first.RULE_ID), clauseNumber: first.CLAUSE_NO, category: first.CATEGORY, caseIds: linkedCases.map((record) => record.caseId), linkedCases };
}
