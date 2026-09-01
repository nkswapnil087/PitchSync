"use client";

import Link from "next/link";
import { BookOpenCheck, GraduationCap, Medal, Pencil, UserRound, UsersRound } from "lucide-react";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { SectionCard } from "@/components/data-display/section-card";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DataStateView } from "@/components/feedback/data-state-view";
import { EmptyState } from "@/components/feedback/empty-state";
import { TabNavigation } from "@/components/navigation/tab-navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { PlayerRecord } from "@/data/contracts";
import { useDemoAuth } from "@/features/demo-auth";
import { useApiData } from "@/features/shared/use-api-data";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "teams", label: "Team Associations" },
  { value: "career", label: "Career Records" },
  { value: "achievements", label: "Achievements" },
] as const;

function numberValue(value: number | undefined) {
  return value === undefined ? "—" : value.toLocaleString();
}

function renderPlayer(player: PlayerRecord, canEdit: boolean) {
  const batting = player.careerRecords.flatMap((record) => record.batting);
  const bowling = player.careerRecords.flatMap((record) => record.bowling);
  const fielding = player.careerRecords.flatMap((record) => record.fielding);
  const totalRuns = batting.reduce((sum, summary) => sum + summary.totalRuns, 0);
  const bestBattingAverage = batting.length > 0 ? Math.max(...batting.map((summary) => summary.battingAverage)) : undefined;
  const bestStrikeRate = batting.length > 0 ? Math.max(...batting.map((summary) => summary.strikeRate)) : undefined;
  const highestScore = batting.length > 0 ? Math.max(...batting.map((summary) => summary.highestScore)) : undefined;
  const totalWickets = bowling.reduce((sum, summary) => sum + summary.totalWickets, 0);
  const bestBowlingAverage = bowling.length > 0 ? Math.min(...bowling.map((summary) => summary.bowlingAverage)) : undefined;
  const formats = [...new Set([...batting, ...bowling, ...fielding].map((summary) => summary.format))];

  return (
    <>
      <EntityHeader
        eyebrow="Player registry"
        title={player.fullName}
        referenceLabel="Player reference"
        reference={player.personId}
        loaded
        actions={canEdit ? <Button asChild variant="outline" size="sm"><Link href={`/players/${encodeURIComponent(player.personId)}/edit`}><Pencil />Edit record</Link></Button> : undefined}
      >
        <DetailGrid columns={4}>
          <DetailField label="Full name" value={player.fullName} />
          <DetailField label="Primary role" value={player.playerRole} />
          <DetailField label="Gender" value={player.gender === "MALE" ? "Male" : "Female"} />
          <DetailField label="Team associations" value={player.teams.length} />
        </DetailGrid>
      </EntityHeader>
      <Tabs defaultValue="overview">
        <TabNavigation tabs={tabs} />
        <TabsContent value="overview">
          <div className="space-y-5">
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <SectionCard title="Personal & contact information" icon={UserRound}>
                <DetailGrid columns={2}>
                  <DetailField label="First name" value={player.person.firstName} />
                  <DetailField label="Last name" value={player.person.lastName} />
                  <DetailField label="Date of birth" value={player.person.dateOfBirth} />
                  <DetailField label="Phone" value={player.person.phones.join(", ") || "—"} />
                  <DetailField label="Present address" value={player.person.presentAddress} />
                  <DetailField label="Permanent address" value={player.person.permanentAddress} />
                </DetailGrid>
              </SectionCard>
              <SectionCard title="Playing information" icon={Medal}>
                <DetailGrid columns={2}>
                  <DetailField label="Player role" value={player.playerRole} />
                  <DetailField label="Gender" value={player.gender === "MALE" ? "Male" : "Female"} />
                  <DetailField label="Education" value={player.education} />
                  <DetailField label="Family background" value={player.familyBackground} />
                </DetailGrid>
              </SectionCard>
            </section>
            <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <SectionCard title="Batting career" icon={BookOpenCheck}><DetailGrid columns={2}><DetailField label="Total runs" value={batting.length > 0 ? numberValue(totalRuns) : undefined} /><DetailField label="Best average" value={bestBattingAverage} /><DetailField label="Best strike rate" value={bestStrikeRate} /><DetailField label="Highest score" value={highestScore} /></DetailGrid></SectionCard>
              <SectionCard title="Bowling career" icon={BookOpenCheck}><DetailGrid columns={2}><DetailField label="Wickets" value={bowling.length > 0 ? numberValue(totalWickets) : undefined} /><DetailField label="Best average" value={bestBowlingAverage} /><DetailField label="Best figures" value={bowling[0]?.bestBowlingFigures} /><DetailField label="Formats" value={formats.join(", ") || undefined} /></DetailGrid></SectionCard>
              <SectionCard title="Fielding career" icon={BookOpenCheck}><DetailGrid columns={2}><DetailField label="Catches" value={fielding.length > 0 ? numberValue(fielding.reduce((sum, summary) => sum + summary.totalCatches, 0)) : undefined} /><DetailField label="Stumpings" value={fielding.length > 0 ? numberValue(fielding.reduce((sum, summary) => sum + summary.totalStumpings, 0)) : undefined} /><DetailField label="Run outs" value={fielding.length > 0 ? numberValue(fielding.reduce((sum, summary) => sum + summary.totalRunouts, 0)) : undefined} /><DetailField label="Best match" value={fielding.length > 0 ? Math.max(...fielding.map((summary) => Number(summary.mostDismissalsInMatch))) : undefined} /></DetailGrid></SectionCard>
            </section>
          </div>
        </TabsContent>
        <TabsContent value="teams">
          <SectionCard title="Team membership" description="Teams linked through player-team associations." icon={UsersRound}>
            <DataTableShell
              columns={["Team", "Category", "Franchise owner", "Actions"]}
              rows={player.teams.map(({ team }) => ({ key: team.teamId, cells: [team.teamName, team.category, team.franchiseOwner ?? "—", <Button key="view" asChild size="sm" variant="outline"><Link href={`/teams/${team.teamId}`}>View</Link></Button>] }))}
              emptyTitle="No team associations found"
            />
          </SectionCard>
        </TabsContent>
        <TabsContent value="career">
          <SectionCard title="Career records" description="Career summaries by tier and location." icon={GraduationCap}>
            <DataTableShell
              columns={["Record ID", "Tier level", "Location type", "Matches played", "Start date", "End date"]}
              rows={player.careerRecords.map((record) => ({ key: record.recordId, cells: [record.recordId, record.tierLevel, record.locationType, record.matchesPlayed, record.startDate, record.endDate ?? "Current"] }))}
              emptyTitle="No career records found"
            />
          </SectionCard>
        </TabsContent>
        <TabsContent value="achievements">
          {player.achievements.length > 0 ? <SectionCard title="Recorded achievements" icon={Medal}><ul className="space-y-2">{player.achievements.map((achievement) => <li key={achievement} className="rounded-lg border bg-[var(--surface)] px-4 py-3 text-sm">{achievement}</li>)}</ul></SectionCard> : <EmptyState title="No achievements recorded" description="No player achievements are available for this record." />}
        </TabsContent>
      </Tabs>
    </>
  );
}

export function PlayerProfile({ playerId }: { playerId: string }) {
  const { role } = useDemoAuth();
  const canEdit = role === "super-admin" || role === "board-admin";
  const state = useApiData<PlayerRecord>(`/api/players/${encodeURIComponent(playerId)}`);

  return <DataStateView state={state} emptyTitle="Player not found">{(player) => player ? renderPlayer(player, canEdit) : null}</DataStateView>;
}
