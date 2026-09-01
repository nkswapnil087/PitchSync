"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { FilterBar } from "@/components/forms/filter-bar";
import { SearchField } from "@/components/forms/search-field";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RulebookListItem } from "@/data/contracts";
import { RegistryTable } from "@/features/shared/registry-table";
import { useRegistryFilters } from "@/features/shared/use-registry-filters";

const columns = ["Rule ID", "Clause number", "Category", "Linked cases", "Actions"] as const;

export function RulebookRegistry() {
  const { searchParams, setFilter, setPage, state, pagination } = useRegistryFilters<RulebookListItem>("No rulebook records found.", "/api/integrity/rulebook");
  return (
    <>
      <PageHeader eyebrow="Integrity domain" title="Rulebook" description="Search rule clauses and review their linked integrity cases." />
      <FilterBar>
        <SearchField value={searchParams.get("q") ?? ""} onChange={(value) => setFilter("q", value)} placeholder="Search rulebook" />
        <Input className="sm:w-48" aria-label="Filter by rule category" placeholder="Filter by category" value={searchParams.get("category") ?? ""} onChange={(event) => setFilter("category", event.target.value)} />
      </FilterBar>
      <RegistryTable columns={columns} state={state} emptyTitle="No rules found" emptyDescription="No rulebook records match the current filters." pagination={pagination} onPageChange={setPage} renderRow={(rule) => ({ key: rule.ruleId, cells: [rule.ruleId, rule.clauseNumber, rule.category, rule.linkedCaseCount, <Button key="view" asChild variant="outline" size="sm"><Link href={`/integrity/rulebook/${rule.ruleId}`}>View</Link></Button>] })} />
      <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><BookOpen className="size-4" />Rules are linked to cases through recorded violations.</p>
    </>
  );
}
