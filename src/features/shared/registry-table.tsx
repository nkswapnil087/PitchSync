import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DataStateView } from "@/components/feedback/data-state-view";
import { Pagination } from "@/components/navigation/pagination";
import type { DataState } from "@/types/data-state";

export function RegistryTable({
  columns,
  state,
  emptyTitle,
  emptyDescription,
}: {
  columns: readonly string[];
  state: DataState<readonly never[]>;
  emptyTitle: string;
  emptyDescription?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      {state.status === "empty" || state.status === "ready" ? (
        <DataTableShell columns={columns} emptyTitle={emptyTitle} emptyDescription={emptyDescription} />
      ) : (
        <DataStateView state={state} emptyTitle={emptyTitle} />
      )}
      <Pagination />
    </div>
  );
}
