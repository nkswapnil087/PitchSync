"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { FilterBar } from "@/components/forms/filter-bar";
import { SearchField } from "@/components/forms/search-field";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegistryTable } from "@/features/shared/registry-table";
import { useRegistryFilters } from "@/features/shared/use-registry-filters";

const columns = ["Tournament", "Tournament ID", "Tier level", "Sponsors", "Participating teams", "Matches", "Actions"] as const;

export function TournamentManagement() {
  const { searchParams, setFilter, state } = useRegistryFilters("No tournament records found.");

  return (
    <>
      <PageHeader eyebrow="Competition domain" title="Tournament registry" description="Search and review tournaments, sponsors, participating teams, and matches." actions={<Button asChild variant="outline"><Link href="/tournaments/record">Open tournament details</Link></Button>} />
      <FilterBar>
        <SearchField value={searchParams.get("q") ?? ""} onChange={(value) => setFilter("q", value)} placeholder="Search tournaments" />
        <Input className="sm:w-52" aria-label="Filter by tier level" placeholder="Filter by tier level" value={searchParams.get("tier") ?? ""} onChange={(event) => setFilter("tier", event.target.value)} />
      </FilterBar>
      <RegistryTable columns={columns} state={state} emptyTitle="No tournaments found" emptyDescription="No tournament records match the current filters." />
      <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><Trophy className="size-4" />Teams are represented through their participation in tournament matches.</p>
    </>
  );
}
