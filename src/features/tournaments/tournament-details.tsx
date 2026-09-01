"use client";

import Link from "next/link";
import { CalendarDays, Handshake, Trophy, UsersRound } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { SectionCard } from "@/components/data-display/section-card";
import { DataStateView } from "@/components/feedback/data-state-view";
import { EmptyState } from "@/components/feedback/empty-state";
import { TabNavigation } from "@/components/navigation/tab-navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { TournamentRecord } from "@/data/contracts";
import { useApiData } from "@/features/shared/use-api-data";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "sponsors", label: "Sponsors" },
  { value: "teams", label: "Participating Teams" },
  { value: "matches", label: "Matches" },
] as const;

function renderTournament(tournament: TournamentRecord) {
  const venues = new Set(tournament.matches.map((match) => match.venue));
  return (
    <>
      <EntityHeader eyebrow="Tournament registry" title={tournament.tournamentName} referenceLabel="Tournament reference" reference={tournament.tournamentId} loaded>
        <DetailGrid columns={4}><DetailField label="Tournament name" value={tournament.tournamentName} /><DetailField label="Season" value={tournament.seasonYear} /><DetailField label="Tier level" value={tournament.tierLevel} /><DetailField label="Participating teams" value={tournament.teams.length} /></DetailGrid>
      </EntityHeader>
      <Tabs defaultValue="overview">
        <TabNavigation tabs={tabs} />
        <TabsContent value="overview">
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <SectionCard title="Tournament information" icon={Trophy}><DetailGrid columns={2}><DetailField label="Tournament ID" value={tournament.tournamentId} /><DetailField label="Tournament name" value={tournament.tournamentName} /><DetailField label="Tier level" value={tournament.tierLevel} /><DetailField label="Recorded matches" value={tournament.matches.length} /></DetailGrid></SectionCard>
            <SectionCard title="Relationship summary" icon={UsersRound}><DetailGrid columns={2}><DetailField label="Sponsors" value={tournament.sponsors.length} /><DetailField label="Participating teams" value={tournament.teams.length} /><DetailField label="Match records" value={tournament.matches.length} /><DetailField label="Venues represented" value={venues.size} /></DetailGrid></SectionCard>
          </section>
        </TabsContent>
        <TabsContent value="sponsors"><SectionCard title="Tournament sponsors" icon={Handshake}>{tournament.sponsors.length > 0 ? <ul className="space-y-2">{tournament.sponsors.map((sponsor) => <li key={sponsor} className="rounded-lg border bg-[var(--surface)] px-4 py-3 text-sm font-medium">{sponsor}</li>)}</ul> : <EmptyState compact title="No sponsors recorded" description="No sponsor information is available for this tournament." />}</SectionCard></TabsContent>
        <TabsContent value="teams"><SectionCard title="Participating teams" icon={UsersRound}><DataTableShell columns={["Team", "Team ID", "Category", "Franchise owner", "Actions"]} rows={tournament.teams.map((team) => ({ key: team.teamId, cells: [team.teamName, team.teamId, team.category, team.franchiseOwner ?? "Board administered", <Button key="view" asChild variant="outline" size="sm"><Link href={`/teams/${team.teamId}`}>View</Link></Button>] }))} emptyTitle="No participating teams found" /></SectionCard></TabsContent>
        <TabsContent value="matches"><SectionCard title="Tournament matches" icon={CalendarDays}><DataTableShell columns={["Match ID", "Teams", "Date", "Venue", "Format", "Status", "Actions"]} rows={tournament.matches.map((match) => ({ key: match.matchId, cells: [match.matchId, match.teams.map((team) => team.teamName).join(" vs ") || "—", match.matchDate, match.venue, match.format ?? "—", match.status ?? "—", <Button key="view" asChild variant="outline" size="sm"><Link href={`/matches/${match.matchId}`}>View</Link></Button>] }))} emptyTitle="No tournament matches found" /></SectionCard></TabsContent>
      </Tabs>
    </>
  );
}

export function TournamentDetails({ tournamentId }: { tournamentId: string }) {
  const state = useApiData<TournamentRecord>(`/api/tournaments/${encodeURIComponent(tournamentId)}`);
  return <DataStateView state={state} emptyTitle="Tournament not found">{(tournament) => tournament ? renderTournament(tournament) : null}</DataStateView>;
}
