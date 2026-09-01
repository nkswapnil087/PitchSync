import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({ page = 1, totalPages = 0, totalItems = 0, onPageChange }: { page?: number; totalPages?: number; totalItems?: number; onPageChange?: (page: number) => void }) {
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;
  const label = totalItems === 0 ? "No records to paginate" : `Page ${page} of ${totalPages} · ${totalItems} record${totalItems === 1 ? "" : "s"}`;

  return <div className="flex items-center justify-between border-t bg-white px-4 py-3"><p className="text-xs text-[var(--text-muted)]">{label}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={!canGoPrevious} onClick={() => onPageChange?.(page - 1)} aria-label="Previous page"><ChevronLeft />Previous</Button><Button variant="outline" size="sm" disabled={!canGoNext} onClick={() => onPageChange?.(page + 1)} aria-label="Next page">Next<ChevronRight /></Button></div></div>;
}
