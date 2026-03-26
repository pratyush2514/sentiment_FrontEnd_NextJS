"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import {
  resolveDashboardQueryConfig,
  type DashboardQueryConfig,
} from "./queryConfig";

export interface FathomHistoricalSync {
  status: "idle" | "queued" | "running" | "completed" | "failed";
  windowDays: number;
  startedAt: string | null;
  completedAt: string | null;
  discoveredCount: number;
  importedCount: number;
  lastError: string | null;
}

export interface FathomConnection {
  connected: boolean;
  status?: string;
  fathomUserEmail?: string | null;
  webhookConfigured?: boolean;
  webhookUrl?: string | null;
  defaultChannelId?: string | null;
  lastSyncedAt?: string | null;
  lastError?: string | null;
  historicalSync?: FathomHistoricalSync | null;
}

export function useFathomConnection(options?: {
  swr?: DashboardQueryConfig;
}) {
  return useSWR<FathomConnection>(
    "/api/fathom/connection",
    apiFetch,
    resolveDashboardQueryConfig(
      {
        refreshInterval: 0,
        revalidateOnFocus: false,
        keepPreviousData: true,
        dedupingInterval: 10_000,
        refreshWhenHidden: false,
      },
      options?.swr,
    ),
  );
}

export async function connectFathom(
  apiKey: string,
  email?: string,
): Promise<{
  connected: boolean;
  webhookUrl?: string | null;
  historicalSync?: FathomHistoricalSync | null;
}> {
  const res = await fetch("/api/fathom/connection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, email }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to connect");
  return json.data;
}

export async function startFathomHistoricalSync(): Promise<{
  connected: boolean;
  historicalSync?: FathomHistoricalSync | null;
}> {
  const res = await fetch("/api/fathom/connection/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to start sync");
  return json.data;
}

export async function updateFathomDefaultChannel(channelId: string | null): Promise<void> {
  const res = await fetch("/api/fathom/connection", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ default_channel_id: channelId }),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error ?? "Failed to update default channel");
  }
}

export async function disconnectFathom(): Promise<void> {
  const res = await fetch("/api/fathom/connection", { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error ?? "Failed to disconnect");
  }
}
