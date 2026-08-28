import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/loading-state";
import { MatchRegistry } from "@/features/matches/match-registry";

export default function Page() {
  return <Suspense fallback={<LoadingState />}><MatchRegistry /></Suspense>;
}
