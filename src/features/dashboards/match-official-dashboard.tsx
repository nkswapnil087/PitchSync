import Link from "next/link";
import { BarChart3, CalendarDays, ClipboardList, Medal, Trophy } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { MetricCard } from "@/components/data-display/metric-card";
import { SectionCard } from "@/components/data-display/section-card";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";

export function MatchOfficialDashboard() {
  return (
    <>
      <PageHeader eyebrow="Match operations" title="Officialâ€™s workspace" description="Review tournament match details and recorded performance summaries." actions={<Button asChild><Link href="/matches"><Medal />Open matches</Link></Button>} />
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Match records" icon={CalendarDays} /><MetricCard label="Tournaments" icon={Trophy} /><MetricCard label="Performance entries" icon={BarChart3} /><MetricCard label="Observations" icon={ClipboardList} /></section>
      <SectionCard title="Match registry"><DataTableShell columns={["Match ID", "Tournament", "Participating teams", "Date", "Venue", "Actions"]} emptyTitle="No match records found" /></SectionCard>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2"><SectionCard title="Performance coverage"><DataTableShell minWidth={560} columns={["Match", "Batting", "Bowling", "Fielding"]} emptyTitle="No performance records found" /></SectionCard><SectionCard title="Administrative observations"><DataTableShell minWidth={560} columns={["Match", "Player", "Observation date", "Remarks"]} emptyTitle="No observations recorded" /></SectionCard></section>
    </>
  );
}
