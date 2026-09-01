import { ComplaintDetails } from "@/features/integrity/complaint-details";

export default async function Page({ params }: PageProps<"/integrity/complaints/[complaintId]">) {
  const { complaintId } = await params;
  return <ComplaintDetails complaintId={complaintId} />;
}
