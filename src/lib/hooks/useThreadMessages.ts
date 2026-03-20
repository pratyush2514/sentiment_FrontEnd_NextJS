"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { ThreadConversationData } from "@/lib/types";
import {
  resolveDashboardQueryConfig,
  type DashboardQueryConfig,
} from "./queryConfig";

export function useThreadMessages(
  channelId: string | null,
  threadTs: string | null,
  options?: DashboardQueryConfig,
) {
  return useSWR<ThreadConversationData>(
    threadTs && channelId ? `/api/threads/${threadTs}?channelId=${channelId}` : null,
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
