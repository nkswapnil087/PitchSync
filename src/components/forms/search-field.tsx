"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchField({ value, onChange, placeholder = "Search records" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="relative block min-w-0 flex-1 sm:min-w-64"><span className="sr-only">Search</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" /><Input className="pl-9" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}
