import { BookOpen, Link2 } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { SectionCard } from "@/components/data-display/section-card";

export function RulebookDetails() {
  return (
    <>
      <EntityHeader eyebrow="Rulebook" title="Rule record" referenceLabel="Rule reference">
        <DetailGrid columns={3}><DetailField label="Rule ID" /><DetailField label="Clause number" /><DetailField label="Category" /></DetailGrid>
      </EntityHeader>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Rule information" icon={BookOpen}><DetailGrid columns={2}><DetailField label="Rule ID" /><DetailField label="Clause number" /><DetailField label="Category" /><DetailField label="Linked cases" /></DetailGrid></SectionCard>
        <SectionCard title="Linked case violations" description="Cases associated with this rule through the violation relationship." icon={Link2}><DataTableShell minWidth={560} columns={["Case ID", "Status", "Date opened", "Involved players", "Actions"]} emptyTitle="No linked case violations found" /></SectionCard>
      </section>
    </>
  );
}
