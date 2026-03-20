"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type {
  AttentionGroup,
  AttentionItem,
  AttentionKind,
  AttentionSeverity,
  AttentionState,
  ConversationType,
  FollowUpWorkflowState,
} from "@/lib/types";
import {
  resolveDashboardQueryConfig,
  type DashboardQueryConfig,
} from "./queryConfig";

interface UseInboxOptions {
  limit?: number;
  channelId?: string | null;
  kind?: AttentionKind | "all";
  group?: AttentionGroup | "all";
  severity?: AttentionSeverity | "all";
  assigneeUserId?: string | null;
  workflowState?: FollowUpWorkflowState | "all";
  resolutionState?: AttentionState | "all";
  ownershipPhase?: "primary" | "escalation" | "all";
  includeHistory?: boolean;
  conversationType?: ConversationType | "all";
  swr?: DashboardQueryConfig;
}

function buildQuery(options: UseInboxOptions): string {
  const params = new URLSearchParams();
  params.set("limit", String(options.limit ?? 80));
  if (options.channelId) params.set("channel_id", options.channelId);
  if (options.kind) params.set("kind", options.kind);
  if (options.group) params.set("group", options.group);
  if (options.severity) params.set("severity", options.severity);
  if (options.assigneeUserId) params.set("assignee_user_id", options.assigneeUserId);
  if (options.workflowState) params.set("workflow_state", options.workflowState);
  if (options.resolutionState) params.set("resolution_state", options.resolutionState);
  if (options.ownershipPhase) params.set("ownership_phase", options.ownershipPhase);
  if (options.includeHistory) params.set("include_history", "true");
  if (options.conversationType) params.set("conversation_type", options.conversationType);
  return params.toString();
}

export function useInbox(options: UseInboxOptions = {}) {
  const query = buildQuery(options);
  return useSWR<AttentionItem[]>(
    `/api/inbox?${query}`,
    apiFetch,
    {
      ...resolveDashboardQueryConfig(
        {
          revalidateOnFocus: false,
          keepPreviousData: true,
          dedupingInterval: 4_000,
        },
        options.swr,
      ),
    },
  );
}
