import { MatchDetails } from "@/features/matches/match-details";
export default async function Page({ params }: PageProps<"/matches/[matchId]">) {
  const { matchId } = await params;
  return <MatchDetails matchId={matchId} />;
}
