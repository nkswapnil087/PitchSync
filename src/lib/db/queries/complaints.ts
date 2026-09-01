import "server-only";

import type { ComplaintListItem, ComplaintRecord } from "@/data/contracts";
import { queryRows, type BindParameters, type Connection } from "@/lib/db/oracle";

export type ComplaintListFilters = { page: number; pageSize: number; q?: string; source?: string; from?: string; to?: string; sort?: "received" | "id" | "source" };
type CountRow = { TOTAL_ITEMS: number };
type ComplaintListRow = { COMPLAINT_ID: number; SOURCE_TYPE: string; DATE_RECEIVED: string; DESCRIPTION: string; MISCONDUCT_TYPE: string | null; LINKED_CASE_COUNT: number };
type ComplaintDetailRow = { COMPLAINT_ID: number; SOURCE_TYPE: string; DATE_RECEIVED: string; DESCRIPTION: string; MISCONDUCT_TYPE: string | null; CASE_ID: number | null; CASE_STATUS: string | null; DATE_OPENED: string | null; REFERRAL_STATUS: string | null };
const sortSql = { received: "c.date_received DESC, c.complaint_id DESC", id: "c.complaint_id", source: "c.source_type, c.date_received DESC, c.complaint_id" } as const;

function buildWhere(filters: ComplaintListFilters) {
  const conditions = ["c.is_deleted = 0"];
  const binds: BindParameters = {};
  if (filters.q?.trim()) {
    conditions.push("(TO_CHAR(c.complaint_id) LIKE :search OR UPPER(c.description) LIKE :search OR UPPER(NVL(c.misconduct_type, '')) LIKE :search)");
    binds.search = `%${filters.q.trim().toUpperCase()}%`;
  }
  if (filters.source?.trim()) {
    conditions.push("UPPER(c.source_type) LIKE :source");
    binds.source = `%${filters.source.trim().toUpperCase()}%`;
  }
  if (filters.from) {
    conditions.push("TRUNC(c.date_received) >= TO_DATE(:fromDate, 'YYYY-MM-DD')");
    binds.fromDate = filters.from;
  }
  if (filters.to) {
    conditions.push("TRUNC(c.date_received) <= TO_DATE(:toDate, 'YYYY-MM-DD')");
    binds.toDate = filters.to;
  }
  return { whereSql: conditions.join(" AND "), binds };
}

export async function listComplaints(connection: Connection, filters: ComplaintListFilters) {
  const { whereSql, binds } = buildWhere(filters);
  const countRows = await queryRows<CountRow>(connection, `SELECT COUNT(*) AS total_items FROM complaint c WHERE ${whereSql}`, binds);
  const rows = await queryRows<ComplaintListRow>(connection, `
    SELECT c.complaint_id, c.source_type, TO_CHAR(c.date_received, 'YYYY-MM-DD') AS date_received,
           c.description, c.misconduct_type,
           (SELECT COUNT(*) FROM source_of s JOIN case_record cr ON cr.case_id = s.case_id AND cr.is_deleted = 0 WHERE s.complaint_id = c.complaint_id AND s.is_deleted = 0) AS linked_case_count
    FROM complaint c WHERE ${whereSql}
    ORDER BY ${sortSql[filters.sort ?? "received"]}
    OFFSET :rowOffset ROWS FETCH NEXT :rowLimit ROWS ONLY
  `, { ...binds, rowOffset: (filters.page - 1) * filters.pageSize, rowLimit: filters.pageSize });
  const data: readonly ComplaintListItem[] = rows.map((row) => ({ complaintId: String(row.COMPLAINT_ID), sourceType: row.SOURCE_TYPE, dateReceived: row.DATE_RECEIVED, description: row.DESCRIPTION, misconductType: row.MISCONDUCT_TYPE ?? undefined, linkedCaseCount: Number(row.LINKED_CASE_COUNT) }));
  return { data, totalItems: Number(countRows[0]?.TOTAL_ITEMS ?? 0) };
}

export async function findComplaintById(connection: Connection, complaintId: number): Promise<ComplaintRecord | null> {
  const rows = await queryRows<ComplaintDetailRow>(connection, `
    SELECT c.complaint_id, c.source_type, TO_CHAR(c.date_received, 'YYYY-MM-DD') AS date_received,
           c.misconduct_type, c.description, cr.case_id, cr.status AS case_status,
           TO_CHAR(cr.date_opened, 'YYYY-MM-DD') AS date_opened, cr.referral_status
    FROM complaint c
    LEFT JOIN source_of s ON s.complaint_id = c.complaint_id AND s.is_deleted = 0
    LEFT JOIN case_record cr ON cr.case_id = s.case_id AND cr.is_deleted = 0
    WHERE c.complaint_id = :complaintId AND c.is_deleted = 0
    ORDER BY cr.date_opened, cr.case_id
  `, { complaintId });
  const first = rows[0];
  if (!first) return null;
  const linkedCases = rows.filter((row) => row.CASE_ID !== null).map((row) => ({ caseId: String(row.CASE_ID), status: row.CASE_STATUS ?? "", dateOpened: row.DATE_OPENED ?? "", referralStatus: row.REFERRAL_STATUS ?? undefined }));
  return { complaintId: String(first.COMPLAINT_ID), sourceType: first.SOURCE_TYPE, dateReceived: first.DATE_RECEIVED, description: first.DESCRIPTION, misconductType: first.MISCONDUCT_TYPE ?? undefined, caseIds: linkedCases.map((item) => item.caseId), linkedCases };
}
