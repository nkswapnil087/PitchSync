import { BookOpen, FileSearch, Link2, ShieldCheck, UserSearch, UsersRound } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { SectionCard } from "@/components/data-display/section-card";
import { TabNavigation } from "@/components/navigation/tab-navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ConfidentialityNotice } from "./confidentiality-notice";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "players", label: "Involved Players" },
  { value: "investigators", label: "Investigation Team" },
  { value: "complaints", label: "Complaint Sources" },
  { value: "rules", label: "Rules & Violations" },
  { value: "evidence", label: "Evidence" },
] as const;

export function IntegrityCaseDetails() {
  return (
    <>
      <ConfidentialityNotice />
      <EntityHeader eyebrow="Integrity cases" title="Integrity case record" referenceLabel="Case reference">
        <DetailGrid columns={3}><DetailField label="Case ID" /><DetailField label="Status" /><DetailField label="Date opened" /></DetailGrid>
      </EntityHeader>
      <Tabs defaultValue="overview">
        <TabNavigation tabs={tabs} />
        <TabsContent value="overview">
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <SectionCard title="Case source" icon={FileSearch}><DetailGrid columns={2}><DetailField label="Linked complaints" /><DetailField label="Source records" /></DetailGrid></SectionCard>
            <SectionCard title="Investigation coverage" icon={UserSearch}><DetailGrid columns={2}><DetailField label="Involved players" /><DetailField label="Assigned investigators" /></DetailGrid></SectionCard>
            <SectionCard title="Evidence & rules" icon={ShieldCheck}><DetailGrid columns={2}><DetailField label="Evidence items" /><DetailField label="Linked rules" /></DetailGrid></SectionCard>
          </section>
        </TabsContent>
        <TabsContent value="players"><SectionCard title="Involved players" description="The involvement type belongs to each player-case relationship." icon={UsersRound}><DataTableShell columns={["Player ID", "Player", "Playing role", "Involvement / investigation type", "Assigned investigators", "Actions"]} emptyTitle="No involved players found" /></SectionCard></TabsContent>
        <TabsContent value="investigators"><SectionCard title="Assigned investigators" description="Investigators assigned to the case and the players they cover." icon={UserSearch}><DataTableShell columns={["Investigator ID", "Investigator", "Designation", "Department", "Assigned players"]} emptyTitle="No investigators assigned" /></SectionCard></TabsContent>
        <TabsContent value="complaints"><SectionCard title="Complaint sources" icon={Link2}><DataTableShell columns={["Complaint ID", "Date received", "Source type", "Description", "Actions"]} emptyTitle="No complaint sources linked" /></SectionCard></TabsContent>
        <TabsContent value="rules"><SectionCard title="Rules linked as violations" icon={BookOpen}><DataTableShell columns={["Rule ID", "Clause number", "Category", "Actions"]} emptyTitle="No rule violations linked" /></SectionCard></TabsContent>
        <TabsContent value="evidence"><SectionCard title="Case evidence" description="Evidence is identified within this case by its evidence number." icon={FileSearch}><DataTableShell columns={["Evidence number", "Description", "Collected date"]} emptyTitle="No evidence available" /></SectionCard></TabsContent>
      </Tabs>
    </>
  );
}
