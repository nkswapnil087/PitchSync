import type { DataState, DataStatus } from "@/types/data-state";

const supportedStatuses: readonly DataStatus[] = ["loading", "empty", "error", "unavailable", "ready"];

export function unavailableState<T>(data: T, message?: string): DataState<T> {
  return { status: "unavailable", data, message };
}

export function emptyState<T>(data: T, message?: string): DataState<T> {
  return { status: "empty", data, message };
}

export function parseDataStatus(value: string | null, fallback: DataStatus = "unavailable"): DataStatus {
  return supportedStatuses.includes(value as DataStatus) ? value as DataStatus : fallback;
}
