"use client";

import Link from "next/link";
import { BriefcaseBusiness, Medal, ShieldAlert, Trophy, UserRound, UsersRound } from "lucide-react";
import { SectionCard } from "@/components/data-display/section-card";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { DashboardMetrics, DashboardTable, useDashboardOverview } from "@/features/dashboards/dashboard-data";

const metricDefinitions = [
  { label: "Players", helper: "Active records", icon: UserRound },
  { label: "Teams", helper: "Active records", icon: UsersRound },
  { label: "Tournaments", helper: "Active records", icon: Trophy },
  { label: "Integrity cases", helper: "Active records", icon: BriefcaseBusiness },
] as const;

export function SuperAdminDashboard() {
  const state = useDashboardOverview();
  return (
    <>
      <PageHeader eyebrow="System administration" title="Administrative overview" description="Oversee the core player, competition, and integrity record areas." />
      <DashboardMetrics definitions={metricDefinitions} state={state} />
      <SectionCard title="Core registries" description="Open an authorized record-management area.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Button asChild><Link href="/players"><UserRound />Players</Link></Button>
          <Button asChild variant="outline"><Link href="/teams"><UsersRound />Teams</Link></Button>
          <Button asChild variant="outline"><Link href="/tournaments"><Trophy />Tournaments</Link></Button>
          <Button asChild variant="outline"><Link href="/matches"><Medal />Matches</Link></Button>
          <Button asChild variant="outline"><Link href="/integrity/complaints"><ShieldAlert />Complaints</Link></Button>
          <Button asChild variant="outline"><Link href="/integrity/cases"><BriefcaseBusiness />Cases</Link></Button>
        </div>
      </SectionCard>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Competition records"><DashboardTable state={state} table="primaryRows" minWidth={600} columns={["Tournament", "Tier level", "Teams", "Matches"]} emptyTitle="No tournament records found" /></SectionCard>
        <SectionCard title="Integrity records"><DashboardTable state={state} table="secondaryRows" minWidth={600} columns={["Case ID", "Status", "Date opened", "Complaint sources"]} emptyTitle="No integrity cases found" /></SectionCard>
      </section>
    </>
  );
}
