import { CalendarDays, Handshake, Trophy, UsersRound } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { SectionCard } from "@/components/data-display/section-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { TabNavigation } from "@/components/navigation/tab-navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "sponsors", label: "Sponsors" },
  { value: "teams", label: "Participating Teams" },
  { value: "matches", label: "Matches" },
] as const;

export function TournamentDetails() {
  return (
    <>
      <EntityHeader eyebrow="Tournament registry" title="Tournament record" referenceLabel="Tournament reference">
        <DetailGrid columns={3}><DetailField label="Tournament name" /><DetailField label="Tier level" /><DetailField label="Participating teams" /></DetailGrid>
      </EntityHeader>
      <Tabs defaultValue="overview">
        <TabNavigation tabs={tabs} />
        <TabsContent value="overview">
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <SectionCard title="Tournament information" icon={Trophy}><DetailGrid columns={2}><DetailField label="Tournament ID" /><DetailField label="Tournament name" /><DetailField label="Tier level" /><DetailField label="Recorded matches" /></DetailGrid></SectionCard>
            <SectionCard title="Relationship summary" icon={UsersRound}><DetailGrid columns={2}><DetailField label="Sponsors" /><DetailField label="Participating teams" /><DetailField label="Match records" /><DetailField label="Venues represented" /></DetailGrid></SectionCard>
          </section>
        </TabsContent>
        <TabsContent value="sponsors"><SectionCard title="Tournament sponsors" icon={Handshake}><EmptyState compact title="No sponsors recorded" description="No sponsor information is available for this tournament." /></SectionCard></TabsContent>
        <TabsContent value="teams"><SectionCard title="Participating teams" icon={UsersRound}><DataTableShell columns={["Team", "Team ID", "Category", "Franchise owner", "Actions"]} emptyTitle="No participating teams found" /></SectionCard></TabsContent>
        <TabsContent value="matches"><SectionCard title="Tournament matches" icon={CalendarDays}><DataTableShell columns={["Match ID", "Teams", "Date", "Venue", "Actions"]} emptyTitle="No tournament matches found" /></SectionCard></TabsContent>
      </Tabs>
    </>
  );
}
