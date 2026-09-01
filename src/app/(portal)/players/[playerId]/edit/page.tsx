import { EditPlayerForm } from "@/features/players/register-player-form";

export default async function Page({ params }: PageProps<"/players/[playerId]/edit">) {
  const { playerId } = await params;
  return <EditPlayerForm playerId={playerId} />;
}
