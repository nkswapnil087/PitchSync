"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PaginationMetadata } from "@/data/contracts";
import type { DataState } from "@/types/data-state";

type RegistryResponse<T> = {
  data: readonly T[];
  pagination: PaginationMetadata;
};

const initialPagination: PaginationMetadata = { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 };

export function useRegistryFilters<T = never>(message: string, endpoint?: string) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<DataState<readonly T[]>>(endpoint ? { status: "loading", data: [] } : { status: "empty", data: [], message });
  const [pagination, setPagination] = useState(initialPagination);

  useEffect(() => {
    if (!endpoint) {
      return;
    }
    const controller = new AbortController();

    fetch(`${endpoint}${searchParams.size ? `?${searchParams}` : ""}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json() as Partial<RegistryResponse<T>> & { error?: string };
        if (!response.ok) throw new Error(body.error ?? "Unable to load records.");
        const records = body.data ?? [];
        setPagination(body.pagination ?? initialPagination);
        setState(records.length > 0 ? { status: "ready", data: records } : { status: "empty", data: [], message });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ status: "error", data: [], message: error instanceof Error ? error.message : "Unable to load records." });
      });

    return () => controller.abort();
  }, [endpoint, message, searchParams]);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`);
  };

  return { searchParams, setFilter, setPage: (page: number) => setFilter("page", String(page)), state, pagination };
}
