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

const CONNECTED_BACKSTOP_INTERVALS: Record<RealtimeRefreshScope, number> = {
  overview: 45_000,
  channel: 30_000,
  thread: 30_000,
  inbox: 30_000,
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
  const connectedRefreshInterval = Math.max(
    liveRefreshInterval,
    CONNECTED_BACKSTOP_INTERVALS[scope],
  );

  return useMemo(() => {
    const live = enabled && connectionState === "connected";

    return {
      scope,
      connectionState,
      live,
      refreshInterval: live
        ? connectedRefreshInterval
        : enabled
          ? pollingRefreshInterval
          : 0,
      revalidateOnFocus,
      keepPreviousData: true,
      dedupingInterval,
      refreshWhenHidden,
    };
  }, [
    connectedRefreshInterval,
    connectionState,
    dedupingInterval,
    enabled,
    pollingRefreshInterval,
    revalidateOnFocus,
    refreshWhenHidden,
    scope,
  ]);
}
