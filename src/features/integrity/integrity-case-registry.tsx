"use client";

import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { FilterBar } from "@/components/forms/filter-bar";
import { SearchField } from "@/components/forms/search-field";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { IntegrityCaseListItem } from "@/data/contracts";
import { RegistryTable } from "@/features/shared/registry-table";
import { useRegistryFilters } from "@/features/shared/use-registry-filters";
import { ConfidentialityNotice } from "./confidentiality-notice";

const columns = ["Case ID", "Status", "Date opened", "Involved players", "Assigned investigators", "Complaint sources", "Rules", "Evidence", "Actions"] as const;

export function IntegrityCaseRegistry() {
  const { searchParams, setFilter, setPage, state, pagination } = useRegistryFilters<IntegrityCaseListItem>("No integrity case records found.", "/api/integrity/cases");
  return (
    <>
      <ConfidentialityNotice />
      <PageHeader eyebrow="Integrity domain" title="Integrity cases" description="Review case progress and its complaint, player, investigator, rule, and evidence relationships." />
      <FilterBar>
        <SearchField value={searchParams.get("q") ?? ""} onChange={(value) => setFilter("q", value)} placeholder="Search integrity cases" />
        <Input className="sm:w-48" aria-label="Filter by case status" placeholder="Filter by status" value={searchParams.get("status") ?? ""} onChange={(event) => setFilter("status", event.target.value)} />
        <Input className="sm:w-44" aria-label="Filter by opened date" type="date" value={searchParams.get("opened") ?? ""} onChange={(event) => setFilter("opened", event.target.value)} />
      </FilterBar>
      <RegistryTable columns={columns} state={state} emptyTitle="No cases found" emptyDescription="No integrity cases match the current filters." pagination={pagination} onPageChange={setPage} renderRow={(record) => ({ key: record.caseId, cells: [
        record.caseId,
        record.status,
        record.dateOpened,
        record.involvedPlayerCount,
        record.investigatorCount,
        record.complaintCount,
        record.ruleCount,
        record.evidenceCount,
        <Button key="view" asChild variant="outline" size="sm"><Link href={`/integrity/cases/${record.caseId}`}>View</Link></Button>,
      ] })} />
      <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><BriefcaseBusiness className="size-4" />Case relationships are consolidated inside each case record.</p>
    </>
  );
}
