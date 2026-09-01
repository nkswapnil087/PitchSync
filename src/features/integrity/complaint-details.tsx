"use client";

import Link from "next/link";
import { FileText, Link2 } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { SectionCard } from "@/components/data-display/section-card";
import { DataStateView } from "@/components/feedback/data-state-view";
import { Button } from "@/components/ui/button";
import type { ComplaintRecord } from "@/data/contracts";
import { useApiData } from "@/features/shared/use-api-data";
import { ConfidentialityNotice } from "./confidentiality-notice";

function renderComplaint(complaint: ComplaintRecord) {
  return (
    <>
      <ConfidentialityNotice>Complaint descriptions and linked cases should be handled according to authorized case-access procedures.</ConfidentialityNotice>
      <EntityHeader eyebrow="Complaint registry" title={`Complaint ${complaint.complaintId}`} referenceLabel="Complaint reference" reference={complaint.complaintId} loaded>
        <DetailGrid columns={4}><DetailField label="Complaint ID" value={complaint.complaintId} /><DetailField label="Source type" value={complaint.sourceType} /><DetailField label="Misconduct type" value={complaint.misconductType} /><DetailField label="Date received" value={complaint.dateReceived} /></DetailGrid>
      </EntityHeader>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Complaint description" icon={FileText}><div className="min-h-40 rounded-[10px] border bg-[var(--surface)] p-4 text-sm leading-6">{complaint.description}</div></SectionCard>
        <SectionCard title="Linked cases" description="Cases for which this complaint is a recorded source." icon={Link2}><DataTableShell minWidth={520} columns={["Case ID", "Status", "Date opened", "Referral", "Actions"]} rows={(complaint.linkedCases ?? []).map((caseRecord) => ({ key: caseRecord.caseId, cells: [caseRecord.caseId, caseRecord.status, caseRecord.dateOpened, caseRecord.referralStatus ?? "—", <Button key="view" asChild size="sm" variant="outline"><Link href={`/integrity/cases/${caseRecord.caseId}`}>View</Link></Button>] }))} emptyTitle="No linked cases found" /></SectionCard>
      </section>
    </>
  );
}

export function ComplaintDetails({ complaintId }: { complaintId: string }) {
  const state = useApiData<ComplaintRecord>(`/api/integrity/complaints/${encodeURIComponent(complaintId)}`);
  return <DataStateView state={state} emptyTitle="Complaint not found">{(complaint) => complaint ? renderComplaint(complaint) : null}</DataStateView>;
}
