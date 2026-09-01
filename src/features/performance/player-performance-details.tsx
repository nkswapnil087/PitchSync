"use client";

import Link from "next/link";
import { Activity, BarChart3, BookOpenCheck, CircleDotDashed } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { MetricCard } from "@/components/data-display/metric-card";
import { SectionCard } from "@/components/data-display/section-card";
import { DataStateView } from "@/components/feedback/data-state-view";
import { TabNavigation } from "@/components/navigation/tab-navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { PlayerPerformanceRecord } from "@/data/contracts";
import { useApiData } from "@/features/shared/use-api-data";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "batting", label: "Batting" },
  { value: "bowling", label: "Bowling" },
  { value: "fielding", label: "Fielding" },
  { value: "career", label: "Career Records" },
] as const;

function renderPerformance(player: PlayerPerformanceRecord) {
  const batting = player.careerRecords.flatMap((record) => record.batting);
  const bowling = player.careerRecords.flatMap((record) => record.bowling);
  const fielding = player.careerRecords.flatMap((record) => record.fielding);
  const matchesPlayed = player.careerRecords.reduce((sum, record) => sum + record.matchesPlayed, 0);
  const totalRuns = batting.reduce((sum, summary) => sum + summary.totalRuns, 0);
  const totalWickets = bowling.reduce((sum, summary) => sum + summary.totalWickets, 0);
  const dismissals = fielding.reduce((sum, summary) => sum + summary.totalCatches + summary.totalStumpings + summary.totalRunouts, 0);
  return (
    <>
      <EntityHeader eyebrow="Player performance" title={`${player.fullName} · Career & performance`} referenceLabel="Player reference" reference={player.personId} loaded>
        <DetailGrid columns={4}><DetailField label="Player" value={player.fullName} /><DetailField label="Primary role" value={player.playerRole} /><DetailField label="Team associations" value={player.teams.length} /><DetailField label="Career records" value={player.careerRecords.length} /></DetailGrid>
      </EntityHeader>
      <Tabs defaultValue="overview">
        <TabNavigation tabs={tabs} />
        <TabsContent value="overview">
          <div className="space-y-5">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Matches played" value={String(matchesPlayed)} helper="Across career records" icon={Activity} /><MetricCard label="Total runs" value={String(totalRuns)} helper="Across format summaries" icon={BarChart3} /><MetricCard label="Total wickets" value={String(totalWickets)} helper="Across format summaries" icon={CircleDotDashed} /><MetricCard label="Fielding dismissals" value={String(dismissals)} helper="Catches, stumpings and run outs" icon={BookOpenCheck} /></section>
            <SectionCard title="Career scope" description="Career records grouped by tier and location type."><DataTableShell columns={["Record ID", "Tier level", "Location type", "Matches played", "Start date", "End date"]} rows={player.careerRecords.map((record) => ({ key: record.recordId, cells: [record.recordId, record.tierLevel, record.locationType, record.matchesPlayed, record.startDate, record.endDate ?? "Current"] }))} emptyTitle="No career records found" /></SectionCard>
          </div>
        </TabsContent>
        <TabsContent value="batting"><div className="space-y-5"><SectionCard title="Batting career summaries"><DataTableShell columns={["Format", "Total runs", "Average", "Strike rate", "Highest score"]} rows={batting.map((summary) => ({ key: summary.summaryId, cells: [summary.format, summary.totalRuns, summary.battingAverage, summary.strikeRate, summary.highestScore] }))} emptyTitle="No batting summaries found" /></SectionCard><SectionCard title="Match batting performances"><DataTableShell columns={["Match", "Date", "Venue", "Runs", "Balls faced", "Strike rate", "Dismissal type"]} rows={player.battingPerformances.map((performance) => ({ key: performance.performanceId, cells: [<Button key="match" asChild variant="outline" size="sm"><Link href={`/matches/${performance.matchId}`}>Match {performance.matchId}</Link></Button>, performance.matchDate, performance.venue, performance.runsScored, performance.ballsFaced, performance.strikeRate, performance.dismissalType ?? "—"] }))} emptyTitle="No batting performances found" /></SectionCard></div></TabsContent>
        <TabsContent value="bowling"><div className="space-y-5"><SectionCard title="Bowling career summaries"><DataTableShell columns={["Format", "Total wickets", "Average", "Best bowling figures"]} rows={bowling.map((summary) => ({ key: summary.summaryId, cells: [summary.format, summary.totalWickets, summary.bowlingAverage, summary.bestBowlingFigures] }))} emptyTitle="No bowling summaries found" /></SectionCard><SectionCard title="Match bowling performances"><DataTableShell columns={["Match", "Date", "Venue", "Wickets", "Overs", "Runs conceded", "Economy rate"]} rows={player.bowlingPerformances.map((performance) => ({ key: performance.performanceId, cells: [<Button key="match" asChild variant="outline" size="sm"><Link href={`/matches/${performance.matchId}`}>Match {performance.matchId}</Link></Button>, performance.matchDate, performance.venue, performance.wicketsTaken, performance.oversBowled, performance.runsConceded, performance.economyRate] }))} emptyTitle="No bowling performances found" /></SectionCard></div></TabsContent>
        <TabsContent value="fielding"><div className="space-y-5"><SectionCard title="Fielding career summaries"><DataTableShell columns={["Format", "Catches", "Stumpings", "Run outs", "Most dismissals in a match"]} rows={fielding.map((summary) => ({ key: summary.summaryId, cells: [summary.format, summary.totalCatches, summary.totalStumpings, summary.totalRunouts, summary.mostDismissalsInMatch] }))} emptyTitle="No fielding summaries found" /></SectionCard><SectionCard title="Match fielding performances"><DataTableShell columns={["Match", "Date", "Venue", "Catches", "Stumpings", "Direct run outs", "Byes conceded"]} rows={player.fieldingPerformances.map((performance) => ({ key: performance.performanceId, cells: [<Button key="match" asChild variant="outline" size="sm"><Link href={`/matches/${performance.matchId}`}>Match {performance.matchId}</Link></Button>, performance.matchDate, performance.venue, performance.catches, performance.stumpings, performance.directRunouts, performance.byesConceded] }))} emptyTitle="No fielding performances found" /></SectionCard></div></TabsContent>
        <TabsContent value="career"><SectionCard title="Career records"><DataTableShell columns={["Record ID", "Tier level", "Location type", "Matches played", "Start date", "End date", "Summary coverage"]} rows={player.careerRecords.map((record) => ({ key: record.recordId, cells: [record.recordId, record.tierLevel, record.locationType, record.matchesPlayed, record.startDate, record.endDate ?? "Current", `${record.batting.length} batting · ${record.bowling.length} bowling · ${record.fielding.length} fielding`] }))} emptyTitle="No career records found" /></SectionCard></TabsContent>
      </Tabs>
    </>
  );
}

export function PlayerPerformanceDetails({ playerId }: { playerId: string }) {
  const state = useApiData<PlayerPerformanceRecord>(`/api/performance/players/${encodeURIComponent(playerId)}`);
  return <DataStateView state={state} emptyTitle="Performance record not found">{(player) => player ? renderPerformance(player) : null}</DataStateView>;
}
