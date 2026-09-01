"use client";

import { useEffect, useState } from "react";
import type { DataState } from "@/types/data-state";

export function useApiData<T>(endpoint: string): DataState<T | null> {
  const [state, setState] = useState<DataState<T | null>>({ status: "loading", data: null });

  useEffect(() => {
    const controller = new AbortController();

    fetch(endpoint, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json() as { data?: T; error?: string };
        if (response.status === 404) {
          setState({ status: "empty", data: null, message: body.error ?? "Record not found." });
          return;
        }
        if (!response.ok) throw new Error(body.error ?? "Unable to load this record.");
        setState(body.data ? { status: "ready", data: body.data } : { status: "empty", data: null, message: "Record not found." });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ status: "error", data: null, message: error instanceof Error ? error.message : "Unable to load this record." });
      });

    return () => controller.abort();
  }, [endpoint]);

  return state;
}
