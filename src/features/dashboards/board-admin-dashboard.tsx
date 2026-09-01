"use client";

import Link from "next/link";
import { ChartNoAxesColumn, Medal, Trophy, UserRound, UsersRound } from "lucide-react";
import { SectionCard } from "@/components/data-display/section-card";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { DashboardMetrics, DashboardTable, useDashboardOverview } from "@/features/dashboards/dashboard-data";

const metricDefinitions = [
  { label: "Players", helper: "Active records", icon: UserRound },
  { label: "Teams", helper: "Active records", icon: UsersRound },
  { label: "Tournaments", helper: "Active records", icon: Trophy },
  { label: "Matches", helper: "Active records", icon: Medal },
] as const;

export function BoardAdminDashboard() {
  const state = useDashboardOverview();
  return (
    <>
      <PageHeader eyebrow="Board operations" title="Cricket administration" description="Coordinate player, team, tournament, match, and career records." />
      <DashboardMetrics definitions={metricDefinitions} state={state} />
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Button asChild><Link href="/players"><UserRound />Player registry</Link></Button>
        <Button asChild variant="outline"><Link href="/teams"><UsersRound />Team registry</Link></Button>
        <Button asChild variant="outline"><Link href="/tournaments"><Trophy />Tournaments</Link></Button>
        <Button asChild variant="outline"><Link href="/matches"><Medal />Matches</Link></Button>
        <Button asChild variant="outline"><Link href="/performance/players"><ChartNoAxesColumn />Performance</Link></Button>
      </section>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Tournament matches"><DashboardTable state={state} table="primaryRows" minWidth={620} columns={["Match ID", "Tournament", "Teams", "Date", "Venue"]} emptyTitle="No match records found" /></SectionCard>
        <SectionCard title="Recent player records"><DashboardTable state={state} table="secondaryRows" minWidth={620} columns={["Player", "Player ID", "Playing role", "Team associations"]} emptyTitle="No player records found" /></SectionCard>
      </section>
    </>
  );
}
