import Link from "next/link";
import { BarChart3, BookOpenCheck, Medal, Trophy, UserRound, UsersRound } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { MetricCard } from "@/components/data-display/metric-card";
import { SectionCard } from "@/components/data-display/section-card";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";

export function PlayerDashboard() {
  return (
    <>
      <PageHeader eyebrow="Player workspace" title="Player overview" description="Review your player profile, team associations, career records, and match performances." />
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Team associations" icon={UsersRound} /><MetricCard label="Career records" icon={BookOpenCheck} /><MetricCard label="Match records" icon={Trophy} /><MetricCard label="Performance summaries" icon={BarChart3} /></section>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3"><Button asChild><Link href="/players/record"><UserRound />Player profile</Link></Button><Button asChild variant="outline"><Link href="/performance/players/record"><BarChart3 />Career & performance</Link></Button><Button asChild variant="outline"><Link href="/matches"><Medal />Matches</Link></Button></section>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2"><SectionCard title="Career summary"><DataTableShell minWidth={620} columns={["Tier level", "Location type", "Matches played", "Batting", "Bowling", "Fielding"]} emptyTitle="No career records found" /></SectionCard><SectionCard title="Match performance"><DataTableShell minWidth={620} columns={["Match", "Date", "Batting", "Bowling", "Fielding"]} emptyTitle="No match performances found" /></SectionCard></section>
    </>
  );
}
