"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { TimelineDataPoint } from "@/lib/types";
import {
  resolveDashboardQueryConfig,
  type DashboardQueryConfig,
} from "./queryConfig";

export function useTimeline(
  channelId: string | null,
  hours = 168,
  options?: DashboardQueryConfig,
  scope?: string | null,
) {
  const params = new URLSearchParams({
    hours: String(hours),
  });
  if (scope) {
    params.set("scope", scope);
  }

  return useSWR<TimelineDataPoint[]>(
    channelId ? `/api/channels/${channelId}/timeline?${params.toString()}` : null,
    apiFetch,
    {
      ...resolveDashboardQueryConfig(
        {
          refreshInterval: 0,
          revalidateOnFocus: false,
          keepPreviousData: true,
          dedupingInterval: 5_000,
        },
        options,
      ),
    },
  );
}
