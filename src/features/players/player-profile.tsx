"use client";

import Link from "next/link";
import { BookOpenCheck, GraduationCap, Medal, Pencil, UserRound, UsersRound } from "lucide-react";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { EntityHeader } from "@/components/data-display/entity-header";
import { SectionCard } from "@/components/data-display/section-card";
import { DataTableShell } from "@/components/data-display/data-table-shell";
import { EmptyState } from "@/components/feedback/empty-state";
import { TabNavigation } from "@/components/navigation/tab-navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useDemoAuth } from "@/features/demo-auth";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "teams", label: "Team Associations" },
  { value: "career", label: "Career Records" },
  { value: "achievements", label: "Achievements" },
] as const;

export function PlayerProfile({ playerId }: { playerId: string }) {
  const { role } = useDemoAuth();
  const canEdit = role === "super-admin" || role === "board-admin";

  return (
    <>
      <EntityHeader
        eyebrow="Player registry"
        title="Player record"
        referenceLabel="Player reference"
        actions={canEdit ? <Button asChild variant="outline" size="sm"><Link href={`/players/${encodeURIComponent(playerId)}/edit`}><Pencil />Edit structure</Link></Button> : undefined}
      >
        <DetailGrid columns={4}>
          <DetailField label="Full name" />
          <DetailField label="Primary role" />
          <DetailField label="Gender" />
          <DetailField label="Current team associations" />
        </DetailGrid>
      </EntityHeader>
      <Tabs defaultValue="overview">
        <TabNavigation tabs={tabs} />
        <TabsContent value="overview">
          <div className="space-y-5">
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <SectionCard title="Personal & contact information" icon={UserRound}>
                <DetailGrid columns={2}>
                  <DetailField label="First name" />
                  <DetailField label="Last name" />
                  <DetailField label="Date of birth" />
                  <DetailField label="Phone" />
                  <DetailField label="Present address" />
                  <DetailField label="Permanent address" />
                </DetailGrid>
              </SectionCard>
              <SectionCard title="Playing information" icon={Medal}>
                <DetailGrid columns={2}>
                  <DetailField label="Player role" />
                  <DetailField label="Gender" />
                  <DetailField label="Education" />
                  <DetailField label="Family background" />
                </DetailGrid>
              </SectionCard>
            </section>
            <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <SectionCard title="Batting career" icon={BookOpenCheck}><DetailGrid columns={2}><DetailField label="Total runs" /><DetailField label="Average" /><DetailField label="Strike rate" /><DetailField label="Highest score" /></DetailGrid></SectionCard>
              <SectionCard title="Bowling career" icon={BookOpenCheck}><DetailGrid columns={2}><DetailField label="Wickets" /><DetailField label="Average" /><DetailField label="Best figures" /><DetailField label="Formats" /></DetailGrid></SectionCard>
              <SectionCard title="Fielding career" icon={BookOpenCheck}><DetailGrid columns={2}><DetailField label="Catches" /><DetailField label="Stumpings" /><DetailField label="Run outs" /><DetailField label="Best match" /></DetailGrid></SectionCard>
            </section>
          </div>
        </TabsContent>
        <TabsContent value="teams">
          <SectionCard title="Team membership" description="Teams linked through player-team associations." icon={UsersRound}>
            <DataTableShell columns={["Team", "Category", "Franchise owner", "Actions"]} emptyTitle="No team associations found" />
          </SectionCard>
        </TabsContent>
        <TabsContent value="career">
          <SectionCard title="Career records" description="Career summaries by tier and location." icon={GraduationCap}>
            <DataTableShell columns={["Record ID", "Tier level", "Location type", "Matches played", "Start date", "End date", "Actions"]} emptyTitle="No career records found" />
          </SectionCard>
        </TabsContent>
        <TabsContent value="achievements">
          <EmptyState title="No achievements recorded" description="No player achievements are available for this record." />
        </TabsContent>
      </Tabs>
    </>
  );
}
