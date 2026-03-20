"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { ChannelCardData } from "@/lib/types";
import {
  resolveDashboardQueryConfig,
  type DashboardQueryConfig,
} from "./queryConfig";

type UseChannelsOptions = DashboardQueryConfig;

export function useChannels(options?: UseChannelsOptions) {
  return useSWR<ChannelCardData[]>("/api/channels", apiFetch, {
    ...resolveDashboardQueryConfig(
      {
        refreshInterval: 30_000,
        revalidateOnFocus: false,
        keepPreviousData: true,
        dedupingInterval: 2_000,
      },
      options,
    ),
  });
}
