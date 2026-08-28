"use client";

import { useSearchParams } from "next/navigation";
import { parseDataStatus } from "@/lib/data-state";
import type { DataState, DataStatus } from "@/types/data-state";

export function useDemoDataState<T>(data: T, fallback: DataStatus = "unavailable", message?: string): DataState<T> {
  const searchParams = useSearchParams();
  return { status: parseDataStatus(searchParams.get("state"), fallback), data, message };
}
