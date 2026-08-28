import { BarChart3, ClipboardList, MapPin, UsersRound } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { SectionCard } from "@/components/data-display/section-card";
import { TabNavigation } from "@/components/navigation/tab-navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "batting", label: "Batting" },
  { value: "bowling", label: "Bowling" },
  { value: "fielding", label: "Fielding" },
  { value: "observations", label: "Administrative Observations" },
] as const;

export function MatchDetails() {
  return (
    <>
      <EntityHeader eyebrow="Match registry" title="Match record" referenceLabel="Match reference">
        <DetailGrid columns={4}><DetailField label="Tournament" /><DetailField label="Match date" /><DetailField label="Venue" /><DetailField label="Participating teams" /></DetailGrid>
      </EntityHeader>
      <Tabs defaultValue="overview">
        <TabNavigation tabs={tabs} />
        <TabsContent value="overview">
          <div className="space-y-5">
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <SectionCard title="Match information" icon={MapPin}><DetailGrid columns={2}><DetailField label="Match ID" /><DetailField label="Tournament" /><DetailField label="Match date" /><DetailField label="Venue" /></DetailGrid></SectionCard>
              <SectionCard title="Participating teams" icon={UsersRound}><DataTableShell minWidth={480} columns={["Team", "Team ID", "Category", "Franchise owner", "Actions"]} emptyTitle="No participating teams found" /></SectionCard>
            </section>
            <SectionCard title="Operational summary" description="Optional match state and outcome presentation." icon={ClipboardList}><DetailGrid columns={2}><DetailField label="Match state" /><DetailField label="Result summary" /></DetailGrid></SectionCard>
          </div>
        </TabsContent>
        <TabsContent value="batting"><SectionCard title="Batting performance" icon={BarChart3}><DataTableShell columns={["Player", "Runs", "Balls faced", "Strike rate", "Dismissal type", "Actions"]} emptyTitle="No batting performances found" /></SectionCard></TabsContent>
        <TabsContent value="bowling"><SectionCard title="Bowling performance" icon={BarChart3}><DataTableShell columns={["Player", "Wickets", "Overs bowled", "Runs conceded", "Economy rate", "Actions"]} emptyTitle="No bowling performances found" /></SectionCard></TabsContent>
        <TabsContent value="fielding"><SectionCard title="Fielding performance" icon={BarChart3}><DataTableShell columns={["Player", "Catches", "Stumpings", "Direct run outs", "Byes conceded", "Actions"]} emptyTitle="No fielding performances found" /></SectionCard></TabsContent>
        <TabsContent value="observations"><SectionCard title="Administrative observations" description="Administrator observations of a player in this match." icon={ClipboardList}><DataTableShell columns={["Administrator", "Player", "Observation date", "Remarks"]} emptyTitle="No observations recorded" /></SectionCard></TabsContent>
      </Tabs>
    </>
  );
}
