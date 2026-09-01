import { TeamDetails } from "@/features/teams/team-details";

export default async function Page({ params }: PageProps<"/teams/[teamId]">) {
  const { teamId } = await params;
  return <TeamDetails teamId={teamId} />;
}
