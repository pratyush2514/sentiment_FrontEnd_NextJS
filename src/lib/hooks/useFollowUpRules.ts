"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { FollowUpRuleConfig } from "@/lib/types";

export function useFollowUpRules() {
  return useSWR<FollowUpRuleConfig[]>("/api/follow-up-rules", apiFetch, {
    refreshInterval: 60_000,
  });
}
