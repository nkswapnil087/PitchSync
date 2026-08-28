import type { DataState } from "@/types/data-state";
import { InformationUnavailable } from "./information-unavailable";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { LoadingState } from "./loading-state";

export function DataStateView<T>({ state, children, emptyTitle, compact = false }: { state: DataState<T>; children?: (data: T) => React.ReactNode; emptyTitle?: string; compact?: boolean }) {
  if (state.status === "loading") return <LoadingState compact={compact} />;
  if (state.status === "error") return <ErrorState compact={compact} message={state.message} />;
  if (state.status === "unavailable") return <InformationUnavailable compact={compact} description={state.message} />;
  if (state.status === "empty") return <EmptyState compact={compact} title={emptyTitle} description={state.message} />;
  return children ? children(state.data) : null;
}
