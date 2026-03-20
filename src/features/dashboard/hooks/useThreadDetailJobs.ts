"use client";

import { useEffect, useRef } from "react";

import { apiFetch } from "@/lib/api";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

interface UseThreadDetailJobsOptions {
  channelId: string;
  threadTs: string;
  hasThread: boolean;
  messagesLoading: boolean;
  shouldQueueRollup: boolean;
}

export function useThreadDetailJobs({
  channelId,
  threadTs,
  hasThread,
  messagesLoading,
  shouldQueueRollup,
}: UseThreadDetailJobsOptions) {
  const queuedThreadRollupRef = useRef(false);

  useEffect(() => {
    queuedThreadRollupRef.current = false;
  }, [channelId, threadTs]);

  useEffect(() => {
    if (queuedThreadRollupRef.current || !hasThread || messagesLoading || !shouldQueueRollup) {
      return;
    }

    queuedThreadRollupRef.current = true;

    void apiFetch<void>(`/api/channels/${channelId}/rollup`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ mode: "thread", threadTs }),
    }).catch(() => {
      queuedThreadRollupRef.current = false;
    });
  }, [channelId, hasThread, messagesLoading, shouldQueueRollup, threadTs]);
}
