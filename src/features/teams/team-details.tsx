import { CalendarDays, Trophy, UsersRound } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { SectionCard } from "@/components/data-display/section-card";
import { TabNavigation } from "@/components/navigation/tab-navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "roster", label: "Roster" },
  { value: "matches", label: "Competition Matches" },
] as const;

export function TeamDetails() {
  return (
    <>
      <EntityHeader eyebrow="Team registry" title="Team record" referenceLabel="Team reference">
        <DetailGrid columns={4}><DetailField label="Team name" /><DetailField label="Category" /><DetailField label="Franchise owner" /><DetailField label="Roster size" /></DetailGrid>
      </EntityHeader>
      <Tabs defaultValue="overview">
        <TabNavigation tabs={tabs} />
        <TabsContent value="overview">
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <SectionCard title="Team information" icon={UsersRound}><DetailGrid columns={2}><DetailField label="Team ID" /><DetailField label="Team name" /><DetailField label="Category" /><DetailField label="Franchise owner" /></DetailGrid></SectionCard>
            <SectionCard title="Competition relationship" icon={Trophy}><DetailGrid columns={2}><DetailField label="Tournaments through matches" /><DetailField label="Recorded matches" /><DetailField label="Players associated" /><DetailField label="Current information" /></DetailGrid></SectionCard>
          </section>
        </TabsContent>
        <TabsContent value="roster">
          <SectionCard title="Player roster" description="Players linked to this team through team membership." icon={UsersRound}><DataTableShell columns={["Player", "Player ID", "Playing role", "Gender", "Actions"]} emptyTitle="No roster associations found" /></SectionCard>
        </TabsContent>
        <TabsContent value="matches">
          <SectionCard title="Tournament matches" description="Matches in which this team participates." icon={CalendarDays}><DataTableShell columns={["Match ID", "Tournament", "Opponent", "Date", "Venue", "Actions"]} emptyTitle="No team matches found" /></SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
}
