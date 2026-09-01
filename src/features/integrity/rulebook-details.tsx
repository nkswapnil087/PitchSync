"use client";

import Link from "next/link";
import { BookOpen, Link2 } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { SectionCard } from "@/components/data-display/section-card";
import { DataStateView } from "@/components/feedback/data-state-view";
import { Button } from "@/components/ui/button";
import type { RulebookRecord } from "@/data/contracts";
import { useApiData } from "@/features/shared/use-api-data";

function renderRule(rule: RulebookRecord) {
  return (
    <>
      <EntityHeader eyebrow="Rulebook" title={`${rule.category} · ${rule.clauseNumber}`} referenceLabel="Rule reference" reference={rule.ruleId} loaded>
        <DetailGrid columns={3}><DetailField label="Rule ID" value={rule.ruleId} /><DetailField label="Clause number" value={rule.clauseNumber} /><DetailField label="Category" value={rule.category} /></DetailGrid>
      </EntityHeader>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Rule information" icon={BookOpen}><DetailGrid columns={2}><DetailField label="Rule ID" value={rule.ruleId} /><DetailField label="Clause number" value={rule.clauseNumber} /><DetailField label="Category" value={rule.category} /><DetailField label="Linked cases" value={rule.caseIds.length} /></DetailGrid></SectionCard>
        <SectionCard title="Linked case violations" description="Cases associated with this rule through the violation relationship." icon={Link2}><DataTableShell minWidth={560} columns={["Case ID", "Status", "Date opened", "Involved players", "Actions"]} rows={(rule.linkedCases ?? []).map((record) => ({ key: record.caseId, cells: [record.caseId, record.status, record.dateOpened, record.involvedPlayerCount, <Button key="view" asChild variant="outline" size="sm"><Link href={`/integrity/cases/${record.caseId}`}>View</Link></Button>] }))} emptyTitle="No linked case violations found" /></SectionCard>
      </section>
    </>
  );
}

export function RulebookDetails({ ruleId }: { ruleId: string }) {
  const state = useApiData<RulebookRecord>(`/api/integrity/rulebook/${encodeURIComponent(ruleId)}`);
  return <DataStateView state={state} emptyTitle="Rule not found">{(rule) => rule ? renderRule(rule) : null}</DataStateView>;
}
