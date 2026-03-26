"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { ChannelThreadsData } from "@/lib/types";
import {
  resolveDashboardQueryConfig,
  type DashboardQueryConfig,
} from "./queryConfig";

export function useThreads(
  channelId: string | null,
  options?: DashboardQueryConfig,
  scope?: string | null,
) {
  const params = new URLSearchParams();
  if (scope) {
    params.set("scope", scope);
  }

  return useSWR<ChannelThreadsData>(
    channelId
      ? `/api/channels/${channelId}/threads${params.toString() ? `?${params.toString()}` : ""}`
      : null,
    apiFetch,
    {
      ...resolveDashboardQueryConfig(
        {
          revalidateOnFocus: false,
          keepPreviousData: true,
          dedupingInterval: 2_000,
        },
        options,
      ),
    },
  );
}
