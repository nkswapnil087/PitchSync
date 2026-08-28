import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/loading-state";
import { PlayerPerformanceRegistry } from "@/features/performance/player-performance-registry";

export default function Page() {
  return <Suspense fallback={<LoadingState />}><PlayerPerformanceRegistry /></Suspense>;
}
