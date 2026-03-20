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
) {
  return useSWR<ChannelThreadsData>(
    channelId ? `/api/channels/${channelId}/threads` : null,
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
