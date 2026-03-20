"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { AppSession } from "@/lib/types";

interface UseSessionOptions {
  refreshInterval?: number;
}

export function useSession(options?: UseSessionOptions) {
  return useSWR<AppSession>("/api/session", apiFetch, {
    refreshInterval: options?.refreshInterval ?? 5 * 60 * 1000, // Re-check every 5 minutes
    revalidateOnFocus: true, // Re-check when user tabs back
    dedupingInterval: 2000,
  });
}
