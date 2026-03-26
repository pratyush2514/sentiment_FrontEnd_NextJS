"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import {
  resolveDashboardQueryConfig,
  type DashboardQueryConfig,
} from "./queryConfig";

export async function updateObligationStatus(
  obligationId: string,
  status: string,
): Promise<void> {
  const res = await fetch("/api/meetings/obligations", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ obligation_id: obligationId, status }),
  });
  if (!res.ok) throw new Error("Failed to update obligation");
}

export interface MeetingObligation {
  id: string;
  meeting_id: string;
  channel_id: string | null;
  obligation_type: string;
  title: string;
  description: string | null;
  owner_user_id: string | null;
  owner_name: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  extraction_confidence: number;
  meeting_title: string | null;
  meeting_share_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ObligationsResponse {
  obligations: MeetingObligation[];
  total: number;
}

export function useMeetingObligations(
  options?: {
    status?: string;
    channelId?: string;
    swr?: DashboardQueryConfig;
  },
) {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.channelId) params.set("channel_id", options.channelId);

  const key = `/api/meetings/obligations?${params.toString()}`;

  return useSWR<ObligationsResponse>(key, apiFetch, {
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
