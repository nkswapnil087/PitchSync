"use client";

import Link from "next/link";
import { BarChart3, BookOpenCheck, CircleDotDashed, Medal, UserRound, UsersRound } from "lucide-react";
import { SectionCard } from "@/components/data-display/section-card";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { DashboardMetrics, DashboardTable, useDashboardOverview } from "@/features/dashboards/dashboard-data";

const metricDefinitions = [
  { label: "Career records", helper: "Active records", icon: BookOpenCheck },
  { label: "Batting summaries", helper: "Active records", icon: BarChart3 },
  { label: "Bowling summaries", helper: "Active records", icon: CircleDotDashed },
  { label: "Fielding summaries", helper: "Active records", icon: Medal },
] as const;

export function PerformanceDashboard() {
  const state = useDashboardOverview();
  return (
    <>
      <PageHeader eyebrow="Team performance" title="Performance overview" description="Review player careers and match-level batting, bowling, and fielding records." />
      <DashboardMetrics definitions={metricDefinitions} state={state} />
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><Button asChild><Link href="/performance/players"><BarChart3 />Player performance</Link></Button><Button asChild variant="outline"><Link href="/players"><UserRound />Players</Link></Button><Button asChild variant="outline"><Link href="/teams"><UsersRound />Teams</Link></Button><Button asChild variant="outline"><Link href="/matches"><Medal />Matches</Link></Button></section>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Career coverage"><DashboardTable state={state} table="primaryRows" minWidth={720} columns={["Player", "Career records", "Matches played", "Batting", "Bowling", "Fielding"]} emptyTitle="No career records found" /></SectionCard>
        <SectionCard title="Match performances"><DashboardTable state={state} table="secondaryRows" minWidth={620} columns={["Match", "Player", "Batting", "Bowling", "Fielding"]} emptyTitle="No match performances found" /></SectionCard>
      </section>
    </>
  );
}
