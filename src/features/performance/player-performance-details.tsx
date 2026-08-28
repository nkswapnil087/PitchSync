import { Activity, BarChart3, BookOpenCheck, CircleDotDashed } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { MetricCard } from "@/components/data-display/metric-card";
import { SectionCard } from "@/components/data-display/section-card";
import { TabNavigation } from "@/components/navigation/tab-navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "batting", label: "Batting" },
  { value: "bowling", label: "Bowling" },
  { value: "fielding", label: "Fielding" },
  { value: "career", label: "Career Records" },
] as const;

export function PlayerPerformanceDetails() {
  return (
    <>
      <EntityHeader eyebrow="Player performance" title="Career & performance record" referenceLabel="Player reference">
        <DetailGrid columns={4}><DetailField label="Player" /><DetailField label="Primary role" /><DetailField label="Team associations" /><DetailField label="Career records" /></DetailGrid>
      </EntityHeader>
      <Tabs defaultValue="overview">
        <TabNavigation tabs={tabs} />
        <TabsContent value="overview">
          <div className="space-y-5">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Matches played" icon={Activity} /><MetricCard label="Total runs" icon={BarChart3} /><MetricCard label="Total wickets" icon={CircleDotDashed} /><MetricCard label="Fielding dismissals" icon={BookOpenCheck} /></section>
            <SectionCard title="Career scope" description="Career records grouped by tier and location type."><DataTableShell columns={["Record ID", "Tier level", "Location type", "Matches played", "Start date", "End date"]} emptyTitle="No career records found" /></SectionCard>
          </div>
        </TabsContent>
        <TabsContent value="batting"><div className="space-y-5"><SectionCard title="Batting career summaries"><DataTableShell columns={["Format", "Total runs", "Average", "Strike rate", "Highest score"]} emptyTitle="No batting summaries found" /></SectionCard><SectionCard title="Match batting performances"><DataTableShell columns={["Match", "Date", "Runs", "Balls faced", "Strike rate", "Dismissal type"]} emptyTitle="No batting performances found" /></SectionCard></div></TabsContent>
        <TabsContent value="bowling"><div className="space-y-5"><SectionCard title="Bowling career summaries"><DataTableShell columns={["Format", "Total wickets", "Average", "Best bowling figures"]} emptyTitle="No bowling summaries found" /></SectionCard><SectionCard title="Match bowling performances"><DataTableShell columns={["Match", "Date", "Wickets", "Overs", "Runs conceded", "Economy rate"]} emptyTitle="No bowling performances found" /></SectionCard></div></TabsContent>
        <TabsContent value="fielding"><div className="space-y-5"><SectionCard title="Fielding career summaries"><DataTableShell columns={["Format", "Catches", "Stumpings", "Run outs", "Most dismissals in a match"]} emptyTitle="No fielding summaries found" /></SectionCard><SectionCard title="Match fielding performances"><DataTableShell columns={["Match", "Date", "Catches", "Stumpings", "Direct run outs", "Byes conceded"]} emptyTitle="No fielding performances found" /></SectionCard></div></TabsContent>
        <TabsContent value="career"><SectionCard title="Career records"><DataTableShell columns={["Record ID", "Tier level", "Location type", "Matches played", "Start date", "End date", "Summary coverage"]} emptyTitle="No career records found" /></SectionCard></TabsContent>
      </Tabs>
    </>
  );
}
