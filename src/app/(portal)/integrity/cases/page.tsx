import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/loading-state";
import { IntegrityCaseRegistry } from "@/features/integrity/integrity-case-registry";

export default function Page() {
  return <Suspense fallback={<LoadingState />}><IntegrityCaseRegistry /></Suspense>;
}
