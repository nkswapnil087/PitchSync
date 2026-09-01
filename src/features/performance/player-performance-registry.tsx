"use client";

import Link from "next/link";
import { ChartNoAxesColumn } from "lucide-react";
import { FilterBar } from "@/components/forms/filter-bar";
import { SearchField } from "@/components/forms/search-field";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PlayerPerformanceListItem } from "@/data/contracts";
import { RegistryTable } from "@/features/shared/registry-table";
import { useRegistryFilters } from "@/features/shared/use-registry-filters";

const columns = ["Player", "Player ID", "Career records", "Matches played", "Batting summaries", "Bowling summaries", "Fielding summaries", "Actions"] as const;

export function PlayerPerformanceRegistry() {
  const { searchParams, setFilter, setPage, state, pagination } = useRegistryFilters<PlayerPerformanceListItem>("No player performance records found.", "/api/performance/players");
  return (
    <>
      <PageHeader eyebrow="Performance domain" title="Player performance" description="Review career records and batting, bowling, and fielding summaries." />
      <FilterBar>
        <SearchField value={searchParams.get("q") ?? ""} onChange={(value) => setFilter("q", value)} placeholder="Search player performance" />
        <Input className="sm:w-48" aria-label="Filter by tier level" placeholder="Filter by tier level" value={searchParams.get("tier") ?? ""} onChange={(event) => setFilter("tier", event.target.value)} />
        <Input className="sm:w-48" aria-label="Filter by format" placeholder="Filter by format" value={searchParams.get("format") ?? ""} onChange={(event) => setFilter("format", event.target.value)} />
      </FilterBar>
      <RegistryTable columns={columns} state={state} emptyTitle="No performance records found" emptyDescription="No career or performance records match the current filters." pagination={pagination} onPageChange={setPage} renderRow={(player) => ({ key: player.personId, cells: [
        <Link key="name" className="font-semibold text-[var(--primary)] hover:underline" href={`/performance/players/${player.personId}`}>{player.fullName}</Link>,
        player.personId,
        player.careerRecordCount,
        player.matchesPlayed,
        player.battingSummaryCount,
        player.bowlingSummaryCount,
        player.fieldingSummaryCount,
        <Button key="view" asChild variant="outline" size="sm"><Link href={`/performance/players/${player.personId}`}>View</Link></Button>,
      ] })} />
      <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><ChartNoAxesColumn className="size-4" />Career summaries and match-level performances are shown together for each player.</p>
    </>
  );
}
