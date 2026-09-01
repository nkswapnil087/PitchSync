import { TournamentDetails } from "@/features/tournaments/tournament-details";

export default async function Page({ params }: PageProps<"/tournaments/[tournamentId]">) {
  const { tournamentId } = await params;
  return <TournamentDetails tournamentId={tournamentId} />;
}
