"use client";

import { useCallback, useEffect, useState } from "react";
import { useSWRConfig } from "swr";

import { apiFetch } from "@/lib/api";
import type { ChannelState } from "@/lib/types";

import type { ChannelDetailActionPlan } from "../types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

interface UseChannelDetailJobsOptions {
  channelId: string;
  state: ChannelState | undefined;
  actionPlan: ChannelDetailActionPlan;
}

export function useChannelDetailJobs({
  channelId,
  state,
}: UseChannelDetailJobsOptions) {
  const { mutate } = useSWRConfig();
  const [isQueueingBackfill, setIsQueueingBackfill] = useState(false);
  const [queuedBackfillRetry, setQueuedBackfillRetry] = useState(false);
  const [backfillError, setBackfillError] = useState<string | null>(null);

  useEffect(() => {
    setIsQueueingBackfill(false);
    setQueuedBackfillRetry(false);
    setBackfillError(null);
  }, [channelId]);

  useEffect(() => {
    if (state?.status !== "failed") {
      setQueuedBackfillRetry(false);
      setBackfillError(null);
    }
  }, [state?.status]);

  const retryBackfill = useCallback(async () => {
    setIsQueueingBackfill(true);
    setBackfillError(null);

    try {
      await apiFetch<void>(`/api/channels/${channelId}/backfill`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ reason: "dashboard_failed_channel_retry" }),
      });

      setQueuedBackfillRetry(true);
      await Promise.all([
        mutate("/api/channels", undefined, { revalidate: true }),
        mutate(`/api/channels/${channelId}/state`, undefined, { revalidate: true }),
      ]);
    } catch (error) {
      setBackfillError(
        error instanceof Error ? error.message : "Failed to queue channel import.",
      );
    } finally {
      setIsQueueingBackfill(false);
    }
  }, [channelId, mutate]);

  return {
    isQueueingBackfill,
    queuedBackfillRetry,
    backfillError,
    retryBackfill,
  };
}
