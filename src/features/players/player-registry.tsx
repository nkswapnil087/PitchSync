"use client";

import Link from "next/link";
import { Plus, UserRoundSearch } from "lucide-react";
import { FilterBar } from "@/components/forms/filter-bar";
import { SearchField } from "@/components/forms/search-field";
import { PageActions } from "@/components/page/page-actions";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PlayerListItem, SelectOption } from "@/data/contracts";
import { RegistryTable } from "@/features/shared/registry-table";
import { useApiData } from "@/features/shared/use-api-data";
import { useRegistryFilters } from "@/features/shared/use-registry-filters";
import { playerGenders, playerRoles } from "./player-options";

const columns = ["Player", "Registry ID", "Primary role", "Gender", "Phone", "Team associations", "Actions"] as const;

export function PlayerRegistry() {
  const { searchParams, setFilter, setPage, state, pagination } = useRegistryFilters<PlayerListItem>("No player records found.", "/api/players");
  const teamOptions = useApiData<readonly SelectOption[]>("/api/players/options");

  return (
    <>
      <PageHeader
        eyebrow="People & players"
        title="Player registry"
        description="Search and review player identity, playing-role, contact, and team-association records."
        actions={<PageActions><Button asChild><Link href="/players/new"><Plus />Register player</Link></Button></PageActions>}
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
          <SelectContent><SelectItem value="all">All teams</SelectItem>{teamOptions.status === "ready" ? teamOptions.data?.map((team) => <SelectItem key={team.value} value={team.value}>{team.label}</SelectItem>) : null}</SelectContent>
        </Select>
      </FilterBar>
      <RegistryTable
        columns={columns}
        state={state}
        emptyTitle="No players found"
        emptyDescription="No player records match the current filters."
        pagination={pagination}
        onPageChange={setPage}
        renderRow={(player) => ({
          key: player.personId,
          cells: [
            <Link key="name" className="font-semibold text-[var(--primary)] hover:underline" href={`/players/${player.personId}`}>{player.fullName}</Link>,
            player.personId,
            player.playerRole,
            player.gender === "MALE" ? "Male" : "Female",
            player.phone ?? "—",
            player.teamAssociationCount,
            <Button key="action" asChild variant="outline" size="sm"><Link href={`/players/${player.personId}`}>View</Link></Button>,
          ],
        })}
      />
      <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><UserRoundSearch className="size-4" />Use search and filters to narrow the registry.</p>
    </>
  );
}
