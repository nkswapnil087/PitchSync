import { RulebookDetails } from "@/features/integrity/rulebook-details";

export default async function Page({ params }: PageProps<"/integrity/rulebook/[ruleId]">) {
  const { ruleId } = await params;
  return <RulebookDetails ruleId={ruleId} />;
}
