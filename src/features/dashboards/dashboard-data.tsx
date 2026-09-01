"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { MetricCard } from "@/components/data-display/metric-card";
import { DataStateView } from "@/components/feedback/data-state-view";
import type { DashboardOverviewData } from "@/data/contracts";
import { useApiData } from "@/features/shared/use-api-data";
import type { DataState } from "@/types/data-state";

type MetricDefinition = { label: string; helper: string; icon: LucideIcon };
type DashboardTableName = "primaryRows" | "secondaryRows" | "tertiaryRows";

export function useDashboardOverview() {
  return useApiData<DashboardOverviewData>("/api/dashboard");
}

export function DashboardMetrics({ definitions, state }: { definitions: readonly MetricDefinition[]; state: DataState<DashboardOverviewData | null> }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {definitions.map((definition, index) => (
        <MetricCard
          key={definition.label}
          label={definition.label}
          icon={definition.icon}
          value={state.status === "ready" && state.data ? state.data.metricValues[index]?.toLocaleString() ?? "0" : state.status === "loading" ? "…" : "—"}
          helper={state.status === "ready" ? definition.helper : state.status === "loading" ? "Loading live data" : "Unable to load"}
        />
      ))}
    </section>
  );
}

export function DashboardTable({ state, table, columns, emptyTitle, minWidth }: { state: DataState<DashboardOverviewData | null>; table: DashboardTableName; columns: readonly string[]; emptyTitle: string; minWidth?: number }) {
  if (state.status === "loading" || state.status === "error") return <DataStateView state={state} emptyTitle={emptyTitle} />;
  const records = state.status === "ready" && state.data ? state.data[table] : [];
  return (
    <DataTableShell
      columns={columns}
      minWidth={minWidth}
      emptyTitle={emptyTitle}
      rows={records.map((record) => ({
        key: record.key,
        cells: record.cells.map((cell, index) => index === 0 && record.href ? <Link key={`${record.key}-${index}`} className="font-semibold text-[var(--primary)] hover:underline" href={record.href}>{cell}</Link> : cell),
      }))}
    />
  );
}
