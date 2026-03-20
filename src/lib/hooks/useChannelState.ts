"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { ChannelState } from "@/lib/types";
import {
  resolveDashboardQueryConfig,
  type DashboardQueryConfig,
} from "./queryConfig";

export function useChannelState(
  channelId: string | null,
  options?: DashboardQueryConfig,
) {
  return useSWR<ChannelState>(
    channelId ? `/api/channels/${channelId}/state` : null,
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
