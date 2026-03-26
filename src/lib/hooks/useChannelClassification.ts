"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";

export interface ChannelClassification {
  channelId: string;
  channelType: string;
  confidence: number;
  classificationSource: string | null;
  clientName: string | null;
  topics: string[];
  reasoning: string | null;
  classifiedAt: string | null;
  overriddenAt: string | null;
}

export function useChannelClassification(channelId: string | null) {
  return useSWR<ChannelClassification>(
    channelId ? `/api/channels/${channelId}/classification` : null,
    apiFetch,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 30_000,
    },
  );
}

export interface ChannelClassificationListItem {
  channelId: string;
  channelType: string;
  confidence: number;
  classificationSource: string;
  clientName: string | null;
  topics: string[];
  classifiedAt: string;
}

interface ClassificationListResponse {
  classifications: ChannelClassificationListItem[];
}

export function useChannelClassifications() {
  return useSWR<ClassificationListResponse>(
    "/api/channels/classifications",
    apiFetch,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 30_000,
    },
  );
}

export async function overrideChannelClassification(
  channelId: string,
  channelType: string,
  clientName?: string | null,
): Promise<void> {
  await apiFetch(`/api/channels/${channelId}/classification`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel_type: channelType, client_name: clientName }),
  });
}
