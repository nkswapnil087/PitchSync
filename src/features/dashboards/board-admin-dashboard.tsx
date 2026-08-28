import Link from "next/link";
import { ChartNoAxesColumn, Medal, Trophy, UserRound, UsersRound } from "lucide-react";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { MetricCard } from "@/components/data-display/metric-card";
import { SectionCard } from "@/components/data-display/section-card";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";

export function BoardAdminDashboard() {
  return (
    <>
      <PageHeader eyebrow="Board operations" title="Cricket administration" description="Coordinate player, team, tournament, match, and career records." />
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Players" icon={UserRound} /><MetricCard label="Teams" icon={UsersRound} /><MetricCard label="Tournaments" icon={Trophy} /><MetricCard label="Matches" icon={Medal} /></section>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Button asChild><Link href="/players"><UserRound />Player registry</Link></Button>
        <Button asChild variant="outline"><Link href="/teams"><UsersRound />Team registry</Link></Button>
        <Button asChild variant="outline"><Link href="/tournaments"><Trophy />Tournaments</Link></Button>
        <Button asChild variant="outline"><Link href="/matches"><Medal />Matches</Link></Button>
        <Button asChild variant="outline"><Link href="/performance/players"><ChartNoAxesColumn />Performance</Link></Button>
      </section>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Tournament matches"><DataTableShell minWidth={620} columns={["Match ID", "Tournament", "Teams", "Date", "Venue"]} emptyTitle="No match records found" /></SectionCard>
        <SectionCard title="Recent player records"><DataTableShell minWidth={620} columns={["Player", "Player ID", "Playing role", "Team associations"]} emptyTitle="No player records found" /></SectionCard>
      </section>
    </>
  );
}
