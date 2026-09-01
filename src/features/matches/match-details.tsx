"use client";

import Link from "next/link";
import { BarChart3, ClipboardList, MapPin, UsersRound } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { SectionCard } from "@/components/data-display/section-card";
import { DataStateView } from "@/components/feedback/data-state-view";
import { TabNavigation } from "@/components/navigation/tab-navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { MatchRecord } from "@/data/contracts";
import { useApiData } from "@/features/shared/use-api-data";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "batting", label: "Batting" },
  { value: "bowling", label: "Bowling" },
  { value: "fielding", label: "Fielding" },
  { value: "observations", label: "Administrative Observations" },
] as const;

function renderMatch(match: MatchRecord) {
  const winner = match.teams.find((team) => team.teamId === match.winnerTeamId);
  return (
    <>
      <EntityHeader eyebrow="Match registry" title={match.teams.map((team) => team.teamName).join(" vs ") || `Match ${match.matchId}`} referenceLabel="Match reference" reference={match.matchId} loaded>
        <DetailGrid columns={4}><DetailField label="Tournament" value={match.tournamentName} /><DetailField label="Match date" value={match.matchDate} /><DetailField label="Venue" value={match.venue} /><DetailField label="Participating teams" value={match.teams.length} /></DetailGrid>
      </EntityHeader>
      <Tabs defaultValue="overview">
        <TabNavigation tabs={tabs} />
        <TabsContent value="overview">
          <div className="space-y-5">
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <SectionCard title="Match information" icon={MapPin}><DetailGrid columns={2}><DetailField label="Match ID" value={match.matchId} /><DetailField label="Tournament" value={match.tournamentName} /><DetailField label="Match date" value={match.matchDate} /><DetailField label="Venue" value={match.venue} /><DetailField label="Format" value={match.format} /></DetailGrid></SectionCard>
              <SectionCard title="Participating teams" icon={UsersRound}><DataTableShell minWidth={480} columns={["Team", "Team ID", "Category", "Franchise owner", "Actions"]} rows={match.teams.map((team) => ({ key: team.teamId, cells: [team.teamName, team.teamId, team.category, team.franchiseOwner ?? "Board administered", <Button key="view" asChild size="sm" variant="outline"><Link href={`/teams/${team.teamId}`}>View</Link></Button>] }))} emptyTitle="No participating teams found" /></SectionCard>
            </section>
            <SectionCard title="Operational summary" description="Current match state and any recorded outcome." icon={ClipboardList}><DetailGrid columns={3}><DetailField label="Match state" value={match.status} /><DetailField label="Result summary" value={match.result} /><DetailField label="Winner" value={winner?.teamName} /></DetailGrid></SectionCard>
          </div>
        </TabsContent>
        <TabsContent value="batting"><SectionCard title="Batting performance" icon={BarChart3}><DataTableShell columns={["Player", "Runs", "Balls faced", "Strike rate", "Dismissal type", "Actions"]} rows={match.batting.map((performance) => ({ key: performance.performanceId, cells: [performance.player.fullName, performance.runsScored, performance.ballsFaced, performance.strikeRate, performance.dismissalType ?? "—", <Button key="view" asChild size="sm" variant="outline"><Link href={`/performance/players/${performance.player.personId}`}>View</Link></Button>] }))} emptyTitle="No batting performances found" /></SectionCard></TabsContent>
        <TabsContent value="bowling"><SectionCard title="Bowling performance" icon={BarChart3}><DataTableShell columns={["Player", "Wickets", "Overs bowled", "Runs conceded", "Economy rate", "Actions"]} rows={match.bowling.map((performance) => ({ key: performance.performanceId, cells: [performance.player.fullName, performance.wicketsTaken, performance.oversBowled, performance.runsConceded, performance.economyRate, <Button key="view" asChild size="sm" variant="outline"><Link href={`/performance/players/${performance.player.personId}`}>View</Link></Button>] }))} emptyTitle="No bowling performances found" /></SectionCard></TabsContent>
        <TabsContent value="fielding"><SectionCard title="Fielding performance" icon={BarChart3}><DataTableShell columns={["Player", "Catches", "Stumpings", "Direct run outs", "Byes conceded", "Actions"]} rows={match.fielding.map((performance) => ({ key: performance.performanceId, cells: [performance.player.fullName, performance.catches, performance.stumpings, performance.directRunouts, performance.byesConceded, <Button key="view" asChild size="sm" variant="outline"><Link href={`/performance/players/${performance.player.personId}`}>View</Link></Button>] }))} emptyTitle="No fielding performances found" /></SectionCard></TabsContent>
        <TabsContent value="observations"><SectionCard title="Administrative observations" description="Administrator observations of a player in this match." icon={ClipboardList}><DataTableShell columns={["Administrator", "Player", "Observation date", "Remarks"]} rows={match.observations.map((observation) => ({ key: `${observation.administratorId}-${observation.playerId}-${observation.observationDate}`, cells: [observation.administratorName ?? observation.administratorId, observation.playerName ?? observation.playerId, observation.observationDate, observation.remarks ?? "—"] }))} emptyTitle="No observations recorded" /></SectionCard></TabsContent>
      </Tabs>
    </>
  );
}

export function MatchDetails({ matchId }: { matchId: string }) {
  const state = useApiData<MatchRecord>(`/api/matches/${encodeURIComponent(matchId)}`);
  return <DataStateView state={state} emptyTitle="Match not found">{(match) => match ? renderMatch(match) : null}</DataStateView>;
}
