"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { ThreadMessage } from "@/lib/types";

export function useLiveMessages(
  channelId: string | null,
  options?: {
    limit?: number;
    participantId?: string | null;
    group?: "threaded" | "flat";
    enabled?: boolean;
  },
) {
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? 40));
  params.set("group", options?.group ?? "threaded");
  if (options?.participantId) {
    params.set("participantId", options.participantId);
  }

  const key = channelId && options?.enabled !== false
    ? `/api/channels/${channelId}/live-messages?${params.toString()}`
    : null;

  return useSWR<ThreadMessage[]>(key, apiFetch, {
    revalidateOnFocus: false,
    keepPreviousData: true,
    dedupingInterval: 1_500,
  });
}
