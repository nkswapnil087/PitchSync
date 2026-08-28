"use client";

import Link from "next/link";
import { Plus, UserRoundSearch } from "lucide-react";
import { FilterBar } from "@/components/forms/filter-bar";
import { SearchField } from "@/components/forms/search-field";
import { PageActions } from "@/components/page/page-actions";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegistryTable } from "@/features/shared/registry-table";
import { useRegistryFilters } from "@/features/shared/use-registry-filters";
import { playerGenders, playerRoles } from "./player-options";

const columns = ["Player", "Registry ID", "Primary role", "Gender", "Phone", "Team associations", "Actions"] as const;

export function PlayerRegistry() {
  const { searchParams, setFilter, state } = useRegistryFilters("No player records found.");

  return (
    <>
      <PageHeader
        eyebrow="People & players"
        title="Player registry"
        description="Search and review player identity, playing-role, contact, and team-association records."
        actions={<PageActions><Button asChild variant="outline"><Link href="/players/record">Open player details</Link></Button><Button asChild><Link href="/players/new"><Plus />Register player</Link></Button></PageActions>}
      />
      <FilterBar>
        <SearchField value={searchParams.get("q") ?? ""} onChange={(value) => setFilter("q", value)} placeholder="Search players" />
        <Select value={searchParams.get("role") ?? "all"} onValueChange={(value) => setFilter("role", value)}>
          <SelectTrigger aria-label="Filter by playing role"><SelectValue placeholder="All playing roles" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All playing roles</SelectItem>{playerRoles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={searchParams.get("gender") ?? "all"} onValueChange={(value) => setFilter("gender", value)}>
          <SelectTrigger aria-label="Filter by gender"><SelectValue placeholder="All gender categories" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All gender categories</SelectItem>{playerGenders.map((gender) => <SelectItem key={gender.value} value={gender.value}>{gender.label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={searchParams.get("team") ?? "all"} onValueChange={(value) => setFilter("team", value)}>
          <SelectTrigger aria-label="Filter by team"><SelectValue placeholder="All teams" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All teams</SelectItem></SelectContent>
        </Select>
      </FilterBar>
      <RegistryTable columns={columns} state={state} emptyTitle="No players found" emptyDescription="No player records match the current filters." />
      <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><UserRoundSearch className="size-4" />Use search and filters to narrow the registry.</p>
    </>
  );
}
