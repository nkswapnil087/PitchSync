import { IntegrityCaseDetails } from "@/features/integrity/integrity-case-details";
export default async function Page({ params }: PageProps<"/integrity/cases/[caseId]">) {
  const { caseId } = await params;
  return <IntegrityCaseDetails caseId={caseId} />;
}
