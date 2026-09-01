"use client";

import Link from "next/link";
import { BookOpen, FileSearch, Link2, ShieldCheck, UserSearch, UsersRound } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { SectionCard } from "@/components/data-display/section-card";
import { DataStateView } from "@/components/feedback/data-state-view";
import { TabNavigation } from "@/components/navigation/tab-navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { IntegrityCaseRecord } from "@/data/contracts";
import { useApiData } from "@/features/shared/use-api-data";
import { ConfidentialityNotice } from "./confidentiality-notice";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "players", label: "Involved Players" },
  { value: "investigators", label: "Investigation Team" },
  { value: "complaints", label: "Complaint Sources" },
  { value: "rules", label: "Rules & Violations" },
  { value: "evidence", label: "Evidence" },
] as const;

function renderCase(record: IntegrityCaseRecord) {
  const investigators = record.investigators ?? [];
  return (
    <>
      <ConfidentialityNotice />
      <EntityHeader eyebrow="Integrity cases" title={`Integrity case ${record.caseId}`} referenceLabel="Case reference" reference={record.caseId} loaded>
        <DetailGrid columns={4}><DetailField label="Case ID" value={record.caseId} /><DetailField label="Status" value={record.status} /><DetailField label="Date opened" value={record.dateOpened} /><DetailField label="Referral" value={record.referralStatus} /></DetailGrid>
      </EntityHeader>
      <Tabs defaultValue="overview">
        <TabNavigation tabs={tabs} />
        <TabsContent value="overview">
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <SectionCard title="Case source" icon={FileSearch}><DetailGrid columns={2}><DetailField label="Linked complaints" value={record.complaints.length} /><DetailField label="Source records" value={record.complaints.length} /></DetailGrid></SectionCard>
            <SectionCard title="Investigation coverage" icon={UserSearch}><DetailGrid columns={2}><DetailField label="Involved players" value={record.involvedPlayers.length} /><DetailField label="Assigned investigators" value={investigators.length} /></DetailGrid></SectionCard>
            <SectionCard title="Evidence & rules" icon={ShieldCheck}><DetailGrid columns={2}><DetailField label="Evidence items" value={record.evidence.length} /><DetailField label="Linked rules" value={record.rules.length} /></DetailGrid></SectionCard>
          </section>
          {record.referredToAuthority ? <SectionCard title="Referral authority" icon={ShieldCheck}><p className="text-sm">{record.referredToAuthority}</p></SectionCard> : null}
        </TabsContent>
        <TabsContent value="players"><SectionCard title="Involved players" description="The involvement type is presented on each player-case relationship." icon={UsersRound}><DataTableShell columns={["Player ID", "Player", "Playing role", "Involvement / investigation type", "Assigned investigators", "Actions"]} rows={record.involvedPlayers.map((assignment) => ({ key: assignment.player.personId, cells: [assignment.player.personId, assignment.player.fullName, assignment.player.playerRole, assignment.involvementType, assignment.investigatorIds.map((id) => investigators.find((investigator) => investigator.administratorId === id)?.fullName ?? id).join(", ") || "Unassigned", <Button key="view" asChild variant="outline" size="sm"><Link href={`/players/${assignment.player.personId}`}>View</Link></Button>] }))} emptyTitle="No involved players found" /></SectionCard></TabsContent>
        <TabsContent value="investigators"><SectionCard title="Assigned investigators" description="Investigators assigned to the case and the players they cover." icon={UserSearch}><DataTableShell columns={["Investigator ID", "Investigator", "Designation", "Department", "Assigned players"]} rows={investigators.map((investigator) => ({ key: investigator.administratorId, cells: [investigator.administratorId, investigator.fullName, investigator.designation, investigator.department, investigator.assignedPlayerIds.map((id) => record.involvedPlayers.find((assignment) => assignment.player.personId === id)?.player.fullName ?? id).join(", ")] }))} emptyTitle="No investigators assigned" /></SectionCard></TabsContent>
        <TabsContent value="complaints"><SectionCard title="Complaint sources" icon={Link2}><DataTableShell columns={["Complaint ID", "Date received", "Source type", "Description", "Actions"]} rows={record.complaints.map((complaint) => ({ key: complaint.complaintId, cells: [complaint.complaintId, complaint.dateReceived, complaint.sourceType, complaint.description, <Button key="view" asChild variant="outline" size="sm"><Link href={`/integrity/complaints/${complaint.complaintId}`}>View</Link></Button>] }))} emptyTitle="No complaint sources linked" /></SectionCard></TabsContent>
        <TabsContent value="rules"><SectionCard title="Rules linked as violations" icon={BookOpen}><DataTableShell columns={["Rule ID", "Clause number", "Category", "Actions"]} rows={record.rules.map((rule) => ({ key: rule.ruleId, cells: [rule.ruleId, rule.clauseNumber, rule.category, <Button key="view" asChild variant="outline" size="sm"><Link href={`/integrity/rulebook/${rule.ruleId}`}>View</Link></Button>] }))} emptyTitle="No rule violations linked" /></SectionCard></TabsContent>
        <TabsContent value="evidence"><SectionCard title="Case evidence" description="Evidence is identified within this case by its evidence number." icon={FileSearch}><DataTableShell columns={["Evidence number", "Description", "Collected date"]} rows={record.evidence.map((item) => ({ key: item.evidenceNumber, cells: [item.evidenceNumber, item.description, item.collectedDate] }))} emptyTitle="No evidence available" /></SectionCard></TabsContent>
      </Tabs>
    </>
  );
}

export function IntegrityCaseDetails({ caseId }: { caseId: string }) {
  const state = useApiData<IntegrityCaseRecord>(`/api/integrity/cases/${encodeURIComponent(caseId)}`);
  return <DataStateView state={state} emptyTitle="Integrity case not found">{(record) => record ? renderCase(record) : null}</DataStateView>;
}
