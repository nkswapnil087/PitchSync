import Link from "next/link";
import { BarChart3, BookOpenCheck, CircleDotDashed, Medal, UserRound, UsersRound } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { MetricCard } from "@/components/data-display/metric-card";
import { SectionCard } from "@/components/data-display/section-card";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";

export function PerformanceDashboard() {
  return (
    <>
      <PageHeader eyebrow="Team performance" title="Performance overview" description="Review player careers and match-level batting, bowling, and fielding records." />
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Career records" icon={BookOpenCheck} /><MetricCard label="Batting summaries" icon={BarChart3} /><MetricCard label="Bowling summaries" icon={CircleDotDashed} /><MetricCard label="Fielding summaries" icon={Medal} /></section>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><Button asChild><Link href="/performance/players"><BarChart3 />Player performance</Link></Button><Button asChild variant="outline"><Link href="/players"><UserRound />Players</Link></Button><Button asChild variant="outline"><Link href="/teams"><UsersRound />Teams</Link></Button><Button asChild variant="outline"><Link href="/matches"><Medal />Matches</Link></Button></section>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Career coverage"><DataTableShell minWidth={620} columns={["Player", "Tier level", "Location type", "Matches played", "Summary coverage"]} emptyTitle="No career records found" /></SectionCard>
        <SectionCard title="Match performances"><DataTableShell minWidth={620} columns={["Match", "Player", "Batting", "Bowling", "Fielding"]} emptyTitle="No match performances found" /></SectionCard>
      </section>
    </>
  );
}
