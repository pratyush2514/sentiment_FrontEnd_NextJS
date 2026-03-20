"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { WorkspaceOverview } from "@/lib/types";
import {
  resolveDashboardQueryConfig,
  type DashboardQueryConfig,
} from "./queryConfig";

export function useOverview(options?: DashboardQueryConfig) {
  return useSWR<WorkspaceOverview>("/api/analytics/overview", apiFetch, {
    ...resolveDashboardQueryConfig(
      {
        refreshInterval: 0,
        revalidateOnFocus: false,
        keepPreviousData: true,
        dedupingInterval: 5_000,
      },
      options,
    ),
  });
}
