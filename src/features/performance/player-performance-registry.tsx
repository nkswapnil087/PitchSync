"use client";

import Link from "next/link";
import { ChartNoAxesColumn } from "lucide-react";
import { FilterBar } from "@/components/forms/filter-bar";
import { SearchField } from "@/components/forms/search-field";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegistryTable } from "@/features/shared/registry-table";
import { useRegistryFilters } from "@/features/shared/use-registry-filters";

const columns = ["Player", "Player ID", "Career records", "Matches played", "Batting summaries", "Bowling summaries", "Fielding summaries", "Actions"] as const;

export function PlayerPerformanceRegistry() {
  const { searchParams, setFilter, state } = useRegistryFilters("No player performance records found.");

  return (
    <>
      <PageHeader eyebrow="Performance domain" title="Player performance" description="Review career records and batting, bowling, and fielding summaries." actions={<Button asChild variant="outline"><Link href="/performance/players/record">Open performance details</Link></Button>} />
      <FilterBar>
        <SearchField value={searchParams.get("q") ?? ""} onChange={(value) => setFilter("q", value)} placeholder="Search player performance" />
        <Input className="sm:w-48" aria-label="Filter by tier level" placeholder="Filter by tier level" value={searchParams.get("tier") ?? ""} onChange={(event) => setFilter("tier", event.target.value)} />
        <Input className="sm:w-48" aria-label="Filter by format" placeholder="Filter by format" value={searchParams.get("format") ?? ""} onChange={(event) => setFilter("format", event.target.value)} />
      </FilterBar>
      <RegistryTable columns={columns} state={state} emptyTitle="No performance records found" emptyDescription="No career or performance records match the current filters." />
      <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><ChartNoAxesColumn className="size-4" />Career summaries and match-level performances are shown together for each player.</p>
    </>
  );
}
