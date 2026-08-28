import { PlayerProfile } from "@/features/players/player-profile";
export default async function Page({ params }: PageProps<"/players/[playerId]">) {
  const { playerId } = await params;
  return <PlayerProfile playerId={playerId} />;
}
