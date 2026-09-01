import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/feedback/empty-state";

export type DataTableRow = {
  key: React.Key;
  cells: readonly React.ReactNode[];
};

export function DataTableShell({ columns, rows = [], emptyTitle = "No records found", emptyDescription = "No information is available for this view.", minWidth = 760 }: { columns: readonly string[]; rows?: readonly DataTableRow[]; emptyTitle?: string; emptyDescription?: string; minWidth?: number }) {
  return <div className="overflow-hidden rounded-xl border bg-white"><Table style={{ minWidth }}><TableHeader><TableRow>{columns.map((column) => <TableHead key={column}>{column}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.length > 0 ? rows.map((row) => <TableRow key={row.key}>{row.cells.map((cell, index) => <TableCell key={`${String(row.key)}-${index}`}>{cell}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length} className="p-0"><EmptyState compact title={emptyTitle} description={emptyDescription} /></TableCell></TableRow>}</TableBody></Table></div>;
}
