"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import {
  resolveDashboardQueryConfig,
  type DashboardQueryConfig,
} from "./queryConfig";

export interface Meeting {
  id: string;
  workspace_id: string;
  fathom_call_id: string;
  source: "api" | "webhook" | "shared_link";
  confidence: "high" | "medium";
  channel_id: string | null;
  title: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  participants_json: Array<{ name: string; email: string | null; domain: string | null }>;
  fathom_summary: string | null;
  recording_url: string | null;
  share_url: string | null;
  processing_status: string;
  extraction_status: string;
  digest_message_ts: string | null;
  created_at: string;
}

interface MeetingsResponse {
  meetings: Meeting[];
  total: number;
}

export function useMeetings(options?: {
  channelId?: string;
  status?: string;
  swr?: DashboardQueryConfig;
}) {
  const params = new URLSearchParams();
  if (options?.channelId) params.set("channel_id", options.channelId);
  if (options?.status) params.set("status", options.status);

  const key = `/api/meetings?${params.toString()}`;

  return useSWR<MeetingsResponse>(key, apiFetch, {
    ...resolveDashboardQueryConfig(
      {
        refreshInterval: 60_000,
        revalidateOnFocus: false,
        refreshWhenHidden: false,
        keepPreviousData: true,
        dedupingInterval: 5_000,
      },
      options?.swr,
    ),
  });
}
