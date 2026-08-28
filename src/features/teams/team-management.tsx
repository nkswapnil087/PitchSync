"use client";

import Link from "next/link";
import { UsersRound } from "lucide-react";
import { FilterBar } from "@/components/forms/filter-bar";
import { SearchField } from "@/components/forms/search-field";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegistryTable } from "@/features/shared/registry-table";
import { useRegistryFilters } from "@/features/shared/use-registry-filters";

const columns = ["Team", "Team ID", "Category", "Franchise owner", "Roster", "Competition matches", "Actions"] as const;

export function TeamManagement() {
  const { searchParams, setFilter, state } = useRegistryFilters("No team records found.");

  return (
    <>
      <PageHeader eyebrow="Team domain" title="Team registry" description="Search and review teams, roster associations, and competition relationships." actions={<Button asChild variant="outline"><Link href="/teams/record">Open team details</Link></Button>} />
      <FilterBar>
        <SearchField value={searchParams.get("q") ?? ""} onChange={(value) => setFilter("q", value)} placeholder="Search teams" />
        <Select value={searchParams.get("ownership") ?? "all"} onValueChange={(value) => setFilter("ownership", value)}>
          <SelectTrigger aria-label="Filter by franchise ownership"><SelectValue placeholder="All ownership types" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All ownership types</SelectItem><SelectItem value="franchise">With franchise owner</SelectItem><SelectItem value="board">Without franchise owner</SelectItem></SelectContent>
        </Select>
      </FilterBar>
      <RegistryTable columns={columns} state={state} emptyTitle="No teams found" emptyDescription="No team records match the current filters." />
      <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><UsersRound className="size-4" />Roster membership is represented through player-team associations.</p>
    </>
  );
}
