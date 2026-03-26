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
  scope: string | null = null,
) {
  const params = new URLSearchParams();
  if (channelId) {
    params.set("channelId", channelId);
  }
  if (scope) {
    params.set("scope", scope);
  }

  return useSWR<ThreadConversationData>(
    threadTs && channelId
      ? `/api/threads/${threadTs}?${params.toString()}`
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
