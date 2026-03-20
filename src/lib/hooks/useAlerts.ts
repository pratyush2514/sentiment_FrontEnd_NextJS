"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { DashboardAlert } from "@/lib/types";
import {
  resolveDashboardQueryConfig,
  type DashboardQueryConfig,
} from "./queryConfig";

interface UseAlertsOptions {
  limit?: number;
  channelId?: string | null;
  swr?: DashboardQueryConfig;
}

export function useAlerts(limitOrOptions: number | UseAlertsOptions = 50) {
  const options = typeof limitOrOptions === "number"
    ? { limit: limitOrOptions }
    : limitOrOptions;
  const { limit = 50, channelId, swr } = options;

  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (channelId) params.set("channel_id", channelId);

  return useSWR<DashboardAlert[]>(
    `/api/alerts?${params.toString()}`,
    apiFetch,
    {
      ...resolveDashboardQueryConfig(
        {
          revalidateOnFocus: false,
          keepPreviousData: true,
          dedupingInterval: 5_000,
        },
        swr,
      ),
    },
  );
}
