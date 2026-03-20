"use client";

import { useMemo } from "react";

import { useSSEConnectionState } from "@/lib/hooks/useSSE";

import type {
  RealtimeRefreshPolicy,
  RealtimeRefreshScope,
  UseRealtimeRefreshPolicyOptions,
} from "../types";

const DEFAULT_POLLING_INTERVALS: Record<RealtimeRefreshScope, number> = {
  overview: 30_000,
  channel: 15_000,
  thread: 15_000,
  inbox: 20_000,
  settings: 60_000,
};

export function useRealtimeRefreshPolicy(
  scope: RealtimeRefreshScope,
  options: UseRealtimeRefreshPolicyOptions = {},
): RealtimeRefreshPolicy {
  const connectionState = useSSEConnectionState();
  const {
    enabled = true,
    liveRefreshInterval = 0,
    pollingRefreshInterval = DEFAULT_POLLING_INTERVALS[scope],
    dedupingInterval = 2_000,
    revalidateOnFocus = false,
    refreshWhenHidden = false,
  } = options;

  return useMemo(() => {
    const live = enabled && connectionState === "connected";
    const liveFallbackInterval =
      liveRefreshInterval > 0
        ? liveRefreshInterval
        : Math.max(60_000, pollingRefreshInterval * 4);

    return {
      scope,
      connectionState,
      live,
      refreshInterval: live
        ? liveFallbackInterval
        : enabled
          ? pollingRefreshInterval
          : 0,
      revalidateOnFocus,
      keepPreviousData: true,
      dedupingInterval,
      refreshWhenHidden,
    };
  }, [
    connectionState,
    dedupingInterval,
    enabled,
    liveRefreshInterval,
    pollingRefreshInterval,
    revalidateOnFocus,
    refreshWhenHidden,
    scope,
  ]);
}
