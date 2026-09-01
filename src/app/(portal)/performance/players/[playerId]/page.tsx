import { PlayerPerformanceDetails } from "@/features/performance/player-performance-details";

export default async function Page({ params }: PageProps<"/performance/players/[playerId]">) {
  const { playerId } = await params;
  return <PlayerPerformanceDetails playerId={playerId} />;
}
