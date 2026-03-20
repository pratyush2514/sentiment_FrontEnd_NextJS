"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { ConversationPolicy } from "@/lib/types";

export function useConversationPolicies() {
  return useSWR<ConversationPolicy[]>("/api/conversation-policies", apiFetch, {
    revalidateOnFocus: false,
    keepPreviousData: true,
    dedupingInterval: 10_000,
  });
}
