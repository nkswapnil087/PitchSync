import { DataTableShell } from "@/components/data-display/data-table-shell";
import { DataStateView } from "@/components/feedback/data-state-view";
import { Pagination } from "@/components/navigation/pagination";
import type { DataTableRow } from "@/components/data-display/data-table-shell";
import type { PaginationMetadata } from "@/data/contracts";
import type { DataState } from "@/types/data-state";

export function RegistryTable<T>({
  columns,
  state,
  emptyTitle,
  emptyDescription,
  renderRow,
  pagination,
  onPageChange,
}: {
  columns: readonly string[];
  state: DataState<readonly T[]>;
  emptyTitle: string;
  emptyDescription?: string;
  renderRow?: (record: T) => DataTableRow;
  pagination?: PaginationMetadata;
  onPageChange?: (page: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      {state.status === "empty" || state.status === "ready" ? (
        <DataTableShell columns={columns} rows={state.status === "ready" && renderRow ? state.data.map(renderRow) : []} emptyTitle={emptyTitle} emptyDescription={emptyDescription} />
      ) : (
        <DataStateView state={state} emptyTitle={emptyTitle} />
      )}
      <Pagination page={pagination?.page} totalPages={pagination?.totalPages} totalItems={pagination?.totalItems} onPageChange={onPageChange} />
    </div>
  );
}
