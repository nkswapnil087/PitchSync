"use client";

import Link from "next/link";
import { BookOpen, BriefcaseBusiness, FileSearch, ShieldAlert, UserSearch } from "lucide-react";
import { SectionCard } from "@/components/data-display/section-card";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { ConfidentialityNotice } from "@/features/integrity/confidentiality-notice";
import { DashboardMetrics, DashboardTable, useDashboardOverview } from "@/features/dashboards/dashboard-data";

const metricDefinitions = [
  { label: "Complaints", helper: "Active records", icon: ShieldAlert },
  { label: "Cases", helper: "Active records", icon: BriefcaseBusiness },
  { label: "Assigned investigators", helper: "Distinct investigators", icon: UserSearch },
  { label: "Evidence items", helper: "Active records", icon: FileSearch },
] as const;

export function IntegrityDashboard() {
  const state = useDashboardOverview();
  return (
    <>
      <ConfidentialityNotice />
      <PageHeader eyebrow="Integrity & compliance" title="Integrity oversight" description="Review complaints, cases, investigators, rule violations, and case evidence." />
      <DashboardMetrics definitions={metricDefinitions} state={state} />
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3"><Button asChild><Link href="/integrity/complaints"><ShieldAlert />Complaints</Link></Button><Button asChild variant="outline"><Link href="/integrity/cases"><BriefcaseBusiness />Cases</Link></Button><Button asChild variant="outline"><Link href="/integrity/rulebook"><BookOpen />Rulebook</Link></Button></section>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2"><SectionCard title="Case progress"><DashboardTable state={state} table="primaryRows" minWidth={620} columns={["Case ID", "Status", "Date opened", "Players", "Investigators"]} emptyTitle="No cases found" /></SectionCard><SectionCard title="Complaint sources"><DashboardTable state={state} table="secondaryRows" minWidth={620} columns={["Complaint ID", "Date received", "Source type", "Linked cases"]} emptyTitle="No complaints found" /></SectionCard></section>
    </>
  );
}
