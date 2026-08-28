"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseDataStatus } from "@/lib/data-state";

export function useRegistryFilters(message: string) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`);
  };

  const state = {
    status: parseDataStatus(searchParams.get("state"), "empty"),
    data: [] as readonly never[],
    message,
  } as const;

  return { searchParams, setFilter, state };
}
