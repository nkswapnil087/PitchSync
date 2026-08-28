"use client";

import Link from "next/link";
import { CalendarRange, ShieldAlert } from "lucide-react";
import { FilterBar } from "@/components/forms/filter-bar";
import { SearchField } from "@/components/forms/search-field";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegistryTable } from "@/features/shared/registry-table";
import { useRegistryFilters } from "@/features/shared/use-registry-filters";
import { ConfidentialityNotice } from "./confidentiality-notice";

const columns = ["Complaint ID", "Date received", "Source type", "Description", "Linked cases", "Actions"] as const;

export function ComplaintRegistry() {
  const { searchParams, setFilter, state } = useRegistryFilters("No complaint records found.");

  return (
    <>
      <ConfidentialityNotice />
      <PageHeader eyebrow="Integrity domain" title="Complaint registry" description="Search and review complaint sources and their linked integrity cases." actions={<Button asChild variant="outline"><Link href="/integrity/complaints/record">Open complaint details</Link></Button>} />
      <FilterBar>
        <SearchField value={searchParams.get("q") ?? ""} onChange={(value) => setFilter("q", value)} placeholder="Search complaint registry" />
        <Input className="sm:w-48" aria-label="Filter by source type" placeholder="Filter by source type" value={searchParams.get("source") ?? ""} onChange={(event) => setFilter("source", event.target.value)} />
        <div className="flex items-center gap-2 rounded-[10px] border px-3">
          <CalendarRange className="size-4 text-[var(--text-muted)]" aria-hidden="true" />
          <Input className="w-32 border-0 p-0 shadow-none focus:ring-0" type="date" value={searchParams.get("from") ?? ""} onChange={(event) => setFilter("from", event.target.value)} aria-label="Received from date" />
          <span className="text-xs text-[var(--text-muted)]">to</span>
          <Input className="w-32 border-0 p-0 shadow-none focus:ring-0" type="date" value={searchParams.get("to") ?? ""} onChange={(event) => setFilter("to", event.target.value)} aria-label="Received to date" />
        </div>
      </FilterBar>
      <RegistryTable columns={columns} state={state} emptyTitle="No complaints found" emptyDescription="No complaint records match the current filters." />
      <p className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><ShieldAlert className="size-4" />A complaint may be linked to one or more integrity cases.</p>
    </>
  );
}
