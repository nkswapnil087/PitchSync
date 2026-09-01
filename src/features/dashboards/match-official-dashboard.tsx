"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, ClipboardList, Medal, Trophy } from "lucide-react";
import { SectionCard } from "@/components/data-display/section-card";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { DashboardMetrics, DashboardTable, useDashboardOverview } from "@/features/dashboards/dashboard-data";

const metricDefinitions = [
  { label: "Match records", helper: "Active records", icon: CalendarDays },
  { label: "Tournaments", helper: "Active records", icon: Trophy },
  { label: "Performance entries", helper: "Recorded entries", icon: BarChart3 },
  { label: "Observations", helper: "Active records", icon: ClipboardList },
] as const;

export function MatchOfficialDashboard() {
  const state = useDashboardOverview();
  return (
    <>
      <PageHeader eyebrow="Match operations" title="Official’s workspace" description="Review tournament match details and recorded performance summaries." actions={<Button asChild><Link href="/matches"><Medal />Open matches</Link></Button>} />
      <DashboardMetrics definitions={metricDefinitions} state={state} />
      <SectionCard title="Match registry"><DashboardTable state={state} table="primaryRows" columns={["Match ID", "Tournament", "Participating teams", "Date", "Venue", "Actions"]} emptyTitle="No match records found" /></SectionCard>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2"><SectionCard title="Performance coverage"><DashboardTable state={state} table="secondaryRows" minWidth={560} columns={["Match", "Batting", "Bowling", "Fielding"]} emptyTitle="No performance records found" /></SectionCard><SectionCard title="Administrative observations"><DashboardTable state={state} table="tertiaryRows" minWidth={560} columns={["Match", "Player", "Observation date", "Remarks"]} emptyTitle="No observations recorded" /></SectionCard></section>
    </>
  );
}
