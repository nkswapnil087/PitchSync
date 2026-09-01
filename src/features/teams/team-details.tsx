"use client";

import Link from "next/link";
import { CalendarDays, Trophy, UsersRound } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { SectionCard } from "@/components/data-display/section-card";
import { DataStateView } from "@/components/feedback/data-state-view";
import { TabNavigation } from "@/components/navigation/tab-navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { TeamRecord } from "@/data/contracts";
import { useApiData } from "@/features/shared/use-api-data";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "roster", label: "Roster" },
  { value: "matches", label: "Competition Matches" },
] as const;

function renderTeam(team: TeamRecord) {
  const tournaments = new Set(team.matches.map((match) => match.tournamentId));
  return (
    <>
      <EntityHeader eyebrow="Team registry" title={team.teamName} referenceLabel="Team reference" reference={team.teamId} loaded>
        <DetailGrid columns={4}><DetailField label="Team name" value={team.teamName} /><DetailField label="Category" value={team.category} /><DetailField label="Franchise owner" value={team.franchiseOwner ?? "Board administered"} /><DetailField label="Roster size" value={team.roster.length} /></DetailGrid>
      </EntityHeader>
      <Tabs defaultValue="overview">
        <TabNavigation tabs={tabs} />
        <TabsContent value="overview">
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <SectionCard title="Team information" icon={UsersRound}><DetailGrid columns={2}><DetailField label="Team ID" value={team.teamId} /><DetailField label="Team name" value={team.teamName} /><DetailField label="Category" value={team.category} /><DetailField label="Franchise owner" value={team.franchiseOwner ?? "Board administered"} /></DetailGrid></SectionCard>
            <SectionCard title="Competition relationship" icon={Trophy}><DetailGrid columns={2}><DetailField label="Tournaments through matches" value={tournaments.size} /><DetailField label="Recorded matches" value={team.matches.length} /><DetailField label="Players associated" value={team.roster.length} /><DetailField label="Record status" value="Active" /></DetailGrid></SectionCard>
          </section>
        </TabsContent>
        <TabsContent value="roster">
          <SectionCard title="Player roster" description="Current players linked to this team through team membership." icon={UsersRound}>
            <DataTableShell columns={["Player", "Player ID", "Playing role", "Gender", "Actions"]} rows={team.roster.map((player) => ({ key: player.personId, cells: [player.fullName, player.personId, player.playerRole, player.gender === "MALE" ? "Male" : "Female", <Button key="view" asChild size="sm" variant="outline"><Link href={`/players/${player.personId}`}>View</Link></Button>] }))} emptyTitle="No roster associations found" />
          </SectionCard>
        </TabsContent>
        <TabsContent value="matches">
          <SectionCard title="Tournament matches" description="Matches in which this team participates." icon={CalendarDays}>
            <DataTableShell columns={["Match ID", "Tournament", "Opponent", "Date", "Venue", "Actions"]} rows={team.matches.map((match) => ({ key: match.matchId, cells: [match.matchId, match.tournamentName, match.teams.filter((entry) => entry.teamId !== team.teamId).map((entry) => entry.teamName).join(", ") || "—", match.matchDate, match.venue, <Button key="view" asChild size="sm" variant="outline"><Link href={`/matches/${match.matchId}`}>View</Link></Button>] }))} emptyTitle="No team matches found" />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
}

export function TeamDetails({ teamId }: { teamId: string }) {
  const state = useApiData<TeamRecord>(`/api/teams/${encodeURIComponent(teamId)}`);
  return <DataStateView state={state} emptyTitle="Team not found">{(team) => team ? renderTeam(team) : null}</DataStateView>;
}
