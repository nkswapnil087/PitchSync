"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { FilterBar } from "@/components/forms/filter-bar";
import { SearchField } from "@/components/forms/search-field";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegistryTable } from "@/features/shared/registry-table";
import { useRegistryFilters } from "@/features/shared/use-registry-filters";

const columns = ["Rule ID", "Clause number", "Category", "Linked cases", "Actions"] as const;

export function RulebookRegistry() {
  const { searchParams, setFilter, state } = useRegistryFilters("No rulebook records found.");

  return (
    <>
      <PageHeader eyebrow="Integrity domain" title="Rulebook" description="Search rule clauses and review their linked integrity cases." actions={<Button asChild variant="outline"><Link href="/integrity/rulebook/record">Open rule details</Link></Button>} />
      <FilterBar>
        <SearchField value={searchParams.get("q") ?? ""} onChange={(value) => setFilter("q", value)} placeholder="Search rulebook" />
        <Input className="sm:w-48" aria-label="Filter by rule category" placeholder="Filter by category" value={searchParams.get("category") ?? ""} onChange={(event) => setFilter("category", event.target.value)} />
      </FilterBar>
      <RegistryTable columns={columns} state={state} emptyTitle="No rules found" emptyDescription="No rulebook records match the current filters." />
      <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><BookOpen className="size-4" />Rules are linked to cases through recorded violations.</p>
    </>
  );
}
