import Link from "next/link";
import { BookOpen, BriefcaseBusiness, FileSearch, ShieldAlert, UserSearch } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { MetricCard } from "@/components/data-display/metric-card";
import { SectionCard } from "@/components/data-display/section-card";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { ConfidentialityNotice } from "@/features/integrity/confidentiality-notice";

export function IntegrityDashboard() {
  return (
    <>
      <ConfidentialityNotice />
      <PageHeader eyebrow="Integrity & compliance" title="Integrity oversight" description="Review complaints, cases, investigators, rule violations, and case evidence." />
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Complaints" icon={ShieldAlert} /><MetricCard label="Cases" icon={BriefcaseBusiness} /><MetricCard label="Assigned investigators" icon={UserSearch} /><MetricCard label="Evidence items" icon={FileSearch} /></section>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3"><Button asChild><Link href="/integrity/complaints"><ShieldAlert />Complaints</Link></Button><Button asChild variant="outline"><Link href="/integrity/cases"><BriefcaseBusiness />Cases</Link></Button><Button asChild variant="outline"><Link href="/integrity/rulebook"><BookOpen />Rulebook</Link></Button></section>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2"><SectionCard title="Case progress"><DataTableShell minWidth={620} columns={["Case ID", "Status", "Date opened", "Players", "Investigators"]} emptyTitle="No cases found" /></SectionCard><SectionCard title="Complaint sources"><DataTableShell minWidth={620} columns={["Complaint ID", "Date received", "Source type", "Linked cases"]} emptyTitle="No complaints found" /></SectionCard></section>
    </>
  );
}
