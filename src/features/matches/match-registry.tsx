"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { FilterBar } from "@/components/forms/filter-bar";
import { SearchField } from "@/components/forms/search-field";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegistryTable } from "@/features/shared/registry-table";
import { useRegistryFilters } from "@/features/shared/use-registry-filters";

const columns = ["Match ID", "Tournament", "Participating teams", "Match date", "Venue", "Actions"] as const;

export function MatchRegistry() {
  const { searchParams, setFilter, state } = useRegistryFilters("No match records found.");

  return (
    <>
      <PageHeader eyebrow="Match domain" title="Match registry" description="Review tournament matches, participating teams, dates, and venues." actions={<Button asChild variant="outline"><Link href="/matches/record">Open match details</Link></Button>} />
      <FilterBar>
        <SearchField value={searchParams.get("q") ?? ""} onChange={(value) => setFilter("q", value)} placeholder="Search matches or venues" />
        <Input className="sm:w-48" aria-label="Filter by tournament" placeholder="Filter by tournament" value={searchParams.get("tournament") ?? ""} onChange={(event) => setFilter("tournament", event.target.value)} />
        <Input className="sm:w-44" aria-label="Filter by match date" type="date" value={searchParams.get("date") ?? ""} onChange={(event) => setFilter("date", event.target.value)} />
      </FilterBar>
      <RegistryTable columns={columns} state={state} emptyTitle="No matches found" emptyDescription="No match records match the current filters." />
      <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><CalendarDays className="size-4" />Each match is linked to one tournament and its participating teams.</p>
    </>
  );
}
