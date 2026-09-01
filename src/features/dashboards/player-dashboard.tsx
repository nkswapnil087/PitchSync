"use client";

import Link from "next/link";
import { BarChart3, BookOpenCheck, Medal, Trophy, UserRound, UsersRound } from "lucide-react";
import { SectionCard } from "@/components/data-display/section-card";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { DashboardMetrics, DashboardTable, useDashboardOverview } from "@/features/dashboards/dashboard-data";

const metricDefinitions = [
  { label: "Team associations", helper: "Active associations", icon: UsersRound },
  { label: "Career records", helper: "Active records", icon: BookOpenCheck },
  { label: "Match records", helper: "Matches with performance", icon: Trophy },
  { label: "Performance summaries", helper: "Recorded entries", icon: BarChart3 },
] as const;

export function PlayerDashboard() {
  const state = useDashboardOverview();
  return (
    <>
      <PageHeader eyebrow="Player workspace" title="Player overview" description="Review your player profile, team associations, career records, and match performances." />
      <DashboardMetrics definitions={metricDefinitions} state={state} />
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3"><Button asChild><Link href="/players/record"><UserRound />Player profile</Link></Button><Button asChild variant="outline"><Link href="/performance/players/record"><BarChart3 />Career & performance</Link></Button><Button asChild variant="outline"><Link href="/matches"><Medal />Matches</Link></Button></section>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2"><SectionCard title="Career summary"><DashboardTable state={state} table="primaryRows" minWidth={620} columns={["Tier level", "Location type", "Matches played", "Batting", "Bowling", "Fielding"]} emptyTitle="No career records found" /></SectionCard><SectionCard title="Match performance"><DashboardTable state={state} table="secondaryRows" minWidth={620} columns={["Match", "Date", "Batting", "Bowling", "Fielding"]} emptyTitle="No match performances found" /></SectionCard></section>
    </>
  );
}
