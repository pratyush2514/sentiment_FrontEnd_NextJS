"use client";

import useSWR from "swr";
import type { FlaggedMessage, PaginatedResponse } from "@/lib/types";
import type { EscalationRisk } from "@/lib/types";
import type { ProductWindowScope } from "@/lib/types";

interface UseMessagesOptions {
  channelId: string | null;
  risk?: EscalationRisk | "flagged";
  page?: number;
  perPage?: number;
  scope?: ProductWindowScope | null;
}

// apiFetch returns json.data, but paginated responses need the full envelope,
// so this hook uses a dedicated fetcher that preserves all pagination fields.
async function messagesFetcher(
  url: string,
): Promise<PaginatedResponse<FlaggedMessage>> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return {
    data: json.data,
    total: json.total,
    page: json.page,
    perPage: json.perPage,
    hasMore: json.hasMore,
  };
}

export function useMessages({
  channelId,
  risk,
  page = 1,
  perPage = 20,
  scope = null,
}: UseMessagesOptions) {
  const params = new URLSearchParams();
  if (risk) params.set("risk", risk);
  params.set("page", String(page));
  params.set("per_page", String(perPage));
  if (scope) params.set("scope", scope);

  const key = channelId
    ? `/api/channels/${channelId}/messages?${params.toString()}`
    : null;

  return useSWR<PaginatedResponse<FlaggedMessage>>(key, messagesFetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
    dedupingInterval: 3_000,
  });
}
