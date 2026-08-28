import { FileText, Link2 } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { SectionCard } from "@/components/data-display/section-card";
import { ConfidentialityNotice } from "./confidentiality-notice";

export function ComplaintDetails() {
  return (
    <>
      <ConfidentialityNotice>Complaint descriptions and linked cases should be handled according to authorized case-access procedures.</ConfidentialityNotice>
      <EntityHeader eyebrow="Complaint registry" title="Complaint record" referenceLabel="Complaint reference">
        <DetailGrid columns={3}><DetailField label="Complaint ID" /><DetailField label="Source type" /><DetailField label="Date received" /></DetailGrid>
      </EntityHeader>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Complaint description" icon={FileText}><div className="min-h-40 rounded-[10px] border bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--text-muted)]">No description available.</div></SectionCard>
        <SectionCard title="Linked cases" description="Cases for which this complaint is a recorded source." icon={Link2}><DataTableShell minWidth={520} columns={["Case ID", "Status", "Date opened", "Actions"]} emptyTitle="No linked cases found" /></SectionCard>
      </section>
    </>
  );
}
