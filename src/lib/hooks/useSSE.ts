"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import { useSWRConfig } from "swr";

// ─── Shared connection state (module-level, singleton) ──────────────────────

export type SSEConnectionState = "connected" | "reconnecting" | "disconnected";

type ConnectionListener = () => void;

let _connectionState: SSEConnectionState = "disconnected";
const _listeners = new Set<ConnectionListener>();

function setConnectionState(state: SSEConnectionState) {
  if (_connectionState === state) return;
  _connectionState = state;
  for (const listener of _listeners) listener();
}

function subscribeConnection(listener: ConnectionListener) {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
}

function getConnectionSnapshot(): SSEConnectionState {
  return _connectionState;
}

function getServerSnapshot(): SSEConnectionState {
  return "disconnected";
}

export function useSSEConnectionState(): SSEConnectionState {
  return useSyncExternalStore(
    subscribeConnection,
    getConnectionSnapshot,
    getServerSnapshot,
  );
}

// ─── Types ──────────────────────────────────────────────────────────────────

type SSEEventType =
  | "analysis_completed"
  | "rollup_updated"
  | "alert_triggered"
  | "channel_status_changed"
  | "message_ingested";

export type AlertChangeType =
  | "created"
  | "updated"
  | "severity_changed"
  | "due"
  | "resolved"
  | "dismissed"
  | "snoozed";

export type SSEEvent = {
  type: SSEEventType;
  workspaceId: string;
  channelId: string;
  data: Record<string, unknown>;
  timestamp: string;
};

type SSEHandler = (event: SSEEvent) => void;

type ActiveRoute =
  | { type: "dashboard" | "alerts" | "settings" | "other"; channelId: null }
  | { type: "channel" | "thread"; channelId: string };

type DirtyBucket =
  | "inbox"
  | "alerts"
  | "overview"
  | "roles"
  | "channels"
  | `channel:${string}:state`
  | `channel:${string}:messages`
  | `channel:${string}:timeline`
  | `channel:${string}:threads`;

const SSE_EVENT_TYPES: SSEEventType[] = [
  "analysis_completed",
  "rollup_updated",
  "alert_triggered",
  "channel_status_changed",
  "message_ingested",
];

const BUFFERED_REVALIDATE_MS = 5_000;

function isThreadDetailKey(key: unknown, channelId: string): boolean {
  return (
    typeof key === "string" &&
    key.startsWith("/api/threads/") &&
    key.includes(`channelId=${channelId}`)
  );
}

function matchesCollectionKey(key: unknown, baseKey: string): boolean {
  return (
    typeof key === "string" &&
    (key === baseKey || key.startsWith(`${baseKey}?`))
  );
}

function parseActiveRoute(pathname: string): ActiveRoute {
  const threadMatch = pathname.match(
    /^\/dashboard\/channels\/([^/]+)\/threads\/[^/]+/,
  );
  if (threadMatch) {
    return { type: "thread", channelId: threadMatch[1] };
  }

  const channelMatch = pathname.match(/^\/dashboard\/channels\/([^/]+)/);
  if (channelMatch) {
    return { type: "channel", channelId: channelMatch[1] };
  }

  if (pathname === "/dashboard") {
    return { type: "dashboard", channelId: null };
  }

  if (pathname === "/dashboard/alerts") {
    return { type: "alerts", channelId: null };
  }

  if (pathname === "/dashboard/settings") {
    return { type: "settings", channelId: null };
  }

  return { type: "other", channelId: null };
}

function channelBucket(
  channelId: string,
  kind: "state" | "messages" | "timeline" | "threads",
): DirtyBucket {
  return `channel:${channelId}:${kind}`;
}

export function useSSE(url: string, onEvent?: SSEHandler) {
  const pathname = usePathname();
  const activeRoute = useMemo(() => parseActiveRoute(pathname), [pathname]);
  const { mutate } = useSWRConfig();
  const onEventRef = useRef(onEvent);
  const dirtyBucketsRef = useRef<Set<DirtyBucket>>(new Set());
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFlushRef = useRef(0);
  const flushDirtyRef = useRef<() => void>(() => {});
  const scheduleFlushRef = useRef<() => void>(() => {});
  const handleEventRef = useRef<(event: SSEEvent) => void>(() => {});

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const revalidate = useCallback(
    (matcher: Parameters<typeof mutate>[0]) => {
      void mutate(matcher, undefined, { revalidate: true });
    },
    [mutate],
  );

  const flushDirty = useCallback(() => {
    if (
      typeof document !== "undefined" &&
      document.visibilityState === "hidden"
    ) {
      return;
    }

    if (dirtyBucketsRef.current.size === 0) {
      return;
    }

    const remaining = new Set<DirtyBucket>();
    const dirtyBuckets = [...dirtyBucketsRef.current];
    let flushed = false;

    for (const bucket of dirtyBuckets) {
      switch (bucket) {
        case "inbox":
          if (
            activeRoute.type === "dashboard" ||
            activeRoute.type === "alerts"
          ) {
            revalidate(
              (key: unknown) =>
                typeof key === "string" && key.startsWith("/api/inbox"),
            );
            flushed = true;
          } else {
            remaining.add(bucket);
          }
          break;
        case "alerts":
          if (
            activeRoute.type === "alerts" ||
            activeRoute.type === "channel" ||
            activeRoute.type === "thread"
          ) {
            revalidate((key: unknown) =>
              matchesCollectionKey(key, "/api/alerts"),
            );
            flushed = true;
          } else {
            remaining.add(bucket);
          }
          break;
        case "overview":
          if (activeRoute.type === "dashboard") {
            revalidate("/api/analytics/overview");
            flushed = true;
          } else {
            remaining.add(bucket);
          }
          break;
        case "roles":
          if (activeRoute.type === "settings") {
            revalidate("/api/roles");
            flushed = true;
          } else {
            remaining.add(bucket);
          }
          break;
        case "channels":
          if (activeRoute.type !== "other") {
            revalidate("/api/channels");
            flushed = true;
          } else {
            remaining.add(bucket);
          }
          break;
        default: {
          const match = bucket.match(
            /^channel:([^:]+):(state|messages|timeline|threads)$/,
          );
          if (!match) {
            break;
          }

          const [, channelId, kind] = match;
          if (
            (activeRoute.type === "channel" || activeRoute.type === "thread") &&
            activeRoute.channelId === channelId
          ) {
            const baseKey = `/api/channels/${channelId}/${kind}`;
            revalidate((key: unknown) => matchesCollectionKey(key, baseKey));
            flushed = true;
          } else {
            remaining.add(bucket);
          }
          break;
        }
      }
    }

    dirtyBucketsRef.current = remaining;
    if (flushed) {
      lastFlushRef.current = Date.now();
    }
  }, [activeRoute, revalidate]);

  const clearFlushTimer = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) {
      return;
    }

    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null;
      flushDirty();
      if (
        dirtyBucketsRef.current.size > 0 &&
        document.visibilityState === "visible"
      ) {
        scheduleFlushRef.current();
      }
    }, BUFFERED_REVALIDATE_MS);
  }, [flushDirty]);

  useEffect(() => {
    flushDirtyRef.current = flushDirty;
  }, [flushDirty]);

  useEffect(() => {
    scheduleFlushRef.current = scheduleFlush;
  }, [scheduleFlush]);

  const markDirty = useCallback(
    (...buckets: DirtyBucket[]) => {
      for (const bucket of buckets) {
        dirtyBucketsRef.current.add(bucket);
      }
      scheduleFlush();
    },
    [scheduleFlush],
  );

  const revalidateImmediateChannelViews = useCallback(
    (channelId: string) => {
      if (
        (activeRoute.type === "channel" || activeRoute.type === "thread") &&
        activeRoute.channelId === channelId
      ) {
        revalidate(
          (key: unknown) =>
            typeof key === "string" &&
            key.startsWith(`/api/channels/${channelId}/live-messages`),
        );
        revalidate((key: unknown) => isThreadDetailKey(key, channelId));
      }
    },
    [activeRoute, revalidate],
  );

  const revalidateVisibleBuckets = useCallback(
    (...buckets: DirtyBucket[]) => {
      for (const bucket of buckets) {
        switch (bucket) {
          case "inbox":
            if (activeRoute.type === "dashboard" || activeRoute.type === "alerts") {
              revalidate(
                (key: unknown) =>
                  typeof key === "string" && key.startsWith("/api/inbox"),
              );
            }
            break;
          case "alerts":
            if (
              activeRoute.type === "dashboard" ||
              activeRoute.type === "alerts" ||
              activeRoute.type === "channel" ||
              activeRoute.type === "thread"
            ) {
              revalidate((key: unknown) => matchesCollectionKey(key, "/api/alerts"));
            }
            break;
          case "overview":
            if (activeRoute.type === "dashboard") {
              revalidate("/api/analytics/overview");
            }
            break;
          case "roles":
            if (activeRoute.type === "settings") {
              revalidate("/api/roles");
            }
            break;
          case "channels":
            if (activeRoute.type !== "other") {
              revalidate("/api/channels");
            }
            break;
          default: {
            const match = bucket.match(
              /^channel:([^:]+):(state|messages|timeline|threads)$/,
            );

            if (!match) {
              break;
            }

            const [, channelId, kind] = match;
            if (
              (activeRoute.type === "channel" || activeRoute.type === "thread") &&
              activeRoute.channelId === channelId
            ) {
              const baseKey = `/api/channels/${channelId}/${kind}`;
              revalidate((key: unknown) => matchesCollectionKey(key, baseKey));
            }
            break;
          }
        }
      }
    },
    [activeRoute, revalidate],
  );

  const handleEvent = useCallback(
    (event: SSEEvent) => {
      switch (event.type) {
        case "analysis_completed":
          revalidateImmediateChannelViews(event.channelId);
          revalidateVisibleBuckets(
            "overview",
            channelBucket(event.channelId, "state"),
            channelBucket(event.channelId, "timeline"),
            channelBucket(event.channelId, "threads"),
          );
          markDirty(
            channelBucket(event.channelId, "state"),
            channelBucket(event.channelId, "messages"),
            channelBucket(event.channelId, "timeline"),
            channelBucket(event.channelId, "threads"),
            "overview",
          );
          break;
        case "rollup_updated":
          if (
            event.data.rollupType === "thread" &&
            activeRoute.type === "thread" &&
            activeRoute.channelId === event.channelId
          ) {
            revalidate((key: unknown) =>
              isThreadDetailKey(key, event.channelId),
            );
          }
          revalidateVisibleBuckets(
            "overview",
            "channels",
            channelBucket(event.channelId, "state"),
            channelBucket(event.channelId, "threads"),
          );
          markDirty(
            channelBucket(event.channelId, "state"),
            channelBucket(event.channelId, "threads"),
            "overview",
            "channels",
          );
          break;
        case "alert_triggered":
          revalidateVisibleBuckets(
            "inbox",
            "alerts",
            "overview",
            "channels",
            channelBucket(event.channelId, "state"),
            channelBucket(event.channelId, "messages"),
            channelBucket(event.channelId, "threads"),
          );
          markDirty(
            "inbox",
            "alerts",
            "overview",
            "channels",
            channelBucket(event.channelId, "state"),
            channelBucket(event.channelId, "messages"),
            channelBucket(event.channelId, "threads"),
          );
          break;
        case "channel_status_changed":
          // Channel removed or status change — revalidate channels list immediately
          if (
            event.data.newStatus === "removed" ||
            event.data.newStatus === "ready"
          ) {
            revalidate("/api/channels");
            revalidate("/api/analytics/overview");
          }
          revalidateVisibleBuckets(
            "channels",
            "overview",
            channelBucket(event.channelId, "state"),
            channelBucket(event.channelId, "messages"),
            channelBucket(event.channelId, "timeline"),
            channelBucket(event.channelId, "threads"),
          );
          markDirty(
            "channels",
            "overview",
            channelBucket(event.channelId, "state"),
            channelBucket(event.channelId, "messages"),
            channelBucket(event.channelId, "timeline"),
            channelBucket(event.channelId, "threads"),
          );
          break;
        case "message_ingested":
          revalidateImmediateChannelViews(event.channelId);
          revalidateVisibleBuckets(
            "channels",
            "overview",
            channelBucket(event.channelId, "state"),
            channelBucket(event.channelId, "threads"),
          );
          markDirty(
            "channels",
            "overview",
            channelBucket(event.channelId, "state"),
            channelBucket(event.channelId, "threads"),
          );
          break;
      }

      onEventRef.current?.(event);
    },
    [
      activeRoute,
      markDirty,
      revalidate,
      revalidateImmediateChannelViews,
      revalidateVisibleBuckets,
    ],
  );

  useEffect(() => {
    handleEventRef.current = handleEvent;
  }, [handleEvent]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        dirtyBucketsRef.current.size > 0
      ) {
        clearFlushTimer();
        flushDirty();
        if (dirtyBucketsRef.current.size > 0) {
          scheduleFlush();
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [clearFlushTimer, flushDirty, scheduleFlush]);

  useEffect(() => {
    if (
      dirtyBucketsRef.current.size === 0 ||
      document.visibilityState === "hidden"
    ) {
      return;
    }

    clearFlushTimer();
    flushDirty();
    if (dirtyBucketsRef.current.size > 0) {
      scheduleFlush();
    }
  }, [activeRoute, clearFlushTimer, flushDirty, scheduleFlush]);

  useEffect(() => {
    let wasConnected = false;
    const source = new EventSource(url);

    source.onopen = () => {
      setConnectionState("reconnecting");
    };

    source.addEventListener("connected", (rawEvent: MessageEvent) => {
      try {
        const payload = JSON.parse(rawEvent.data as string) as Record<
          string,
          unknown
        >;
        if (typeof payload.workspaceId !== "string") {
          if (process.env.NODE_ENV !== "production") {
            console.warn("PulseBoard SSE connected event missing workspaceId");
          }
          return;
        }

        setConnectionState("connected");
        if (wasConnected && dirtyBucketsRef.current.size > 0) {
          if (flushTimerRef.current) {
            clearTimeout(flushTimerRef.current);
            flushTimerRef.current = null;
          }
          flushDirtyRef.current();
          if (dirtyBucketsRef.current.size > 0) {
            scheduleFlushRef.current();
          }
        }
        wasConnected = true;
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "PulseBoard SSE connected event could not be parsed",
            error,
          );
        }
      }
    });

    for (const type of SSE_EVENT_TYPES) {
      source.addEventListener(type, (rawEvent: MessageEvent) => {
        try {
          const payload = JSON.parse(rawEvent.data as string) as Record<
            string,
            unknown
          >;
          // Validate required fields
          if (
            typeof payload.type !== "string" ||
            !SSE_EVENT_TYPES.includes(payload.type as SSEEventType) ||
            typeof payload.channelId !== "string"
          ) {
            if (process.env.NODE_ENV !== "production") {
              console.warn(
                "PulseBoard SSE event ignored because it failed validation",
                payload,
              );
            }
            return;
          }
          handleEventRef.current(payload as unknown as SSEEvent);
        } catch {
          if (process.env.NODE_ENV !== "production") {
            console.warn("PulseBoard SSE event could not be parsed");
          }
        }
      });
    }

    source.onerror = () => {
      // EventSource reconnects automatically per the spec.
      setConnectionState(
        source.readyState === EventSource.CLOSED
          ? "disconnected"
          : "reconnecting",
      );
    };

    return () => {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      source.close();
      setConnectionState("disconnected");
    };
  }, [url]);
}
