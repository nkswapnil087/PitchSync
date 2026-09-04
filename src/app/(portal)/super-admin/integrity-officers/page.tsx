import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/loading-state";
import { IntegrityOfficerOversight } from "@/features/super-admin/integrity-officer-oversight";

export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <IntegrityOfficerOversight />
    </Suspense>
  );
}
