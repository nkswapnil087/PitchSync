import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/loading-state";
import { RulebookRegistry } from "@/features/integrity/rulebook-registry";

export default function Page() {
  return <Suspense fallback={<LoadingState />}><RulebookRegistry /></Suspense>;
}
