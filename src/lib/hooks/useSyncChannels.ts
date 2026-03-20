"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSWRConfig } from "swr";

export interface SyncResult {
  discovered: number;
  totalVisible: number;
  alreadyTracked: number;
  newlyTracked: number;
  channels: Array<{ id: string; name: string; jobId: string | null }>;
}

export function useSyncChannels() {
  const { mutate } = useSWRConfig();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auto-clear feedback after 5 seconds
  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  const syncChannels = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setError(null);
    setLastResult(null);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);

    try {
      const res = await fetch("/api/channels/sync", { method: "POST" });
      const json = await res.json();

      if (!res.ok || json.ok === false) {
        setError(json.error ?? "Sync failed");
        return;
      }

      const result: SyncResult = json.data;
      setLastResult(result);

      // Immediately revalidate all channel-related SWR caches
      void mutate("/api/channels");
      void mutate("/api/conversation-policies");

      // Auto-dismiss feedback
      dismissTimer.current = setTimeout(() => setLastResult(null), 5_000);
    } catch {
      setError("Failed to connect to backend");
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, mutate]);

  return { syncChannels, isSyncing, lastResult, error };
}
