"use client";

import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";

import { apiFetch } from "@/lib/api";
import type { AttentionItem } from "@/lib/types";

import type {
  FollowUpActionRequest,
  FollowUpActionType,
  UseFollowUpActionsOptions,
  UseFollowUpActionsResult,
} from "../types";

const DEFAULT_REVALIDATE_KEYS = [
  (key: unknown) => typeof key === "string" && key.startsWith("/api/inbox"),
  "/api/analytics/overview",
  (key: unknown) => typeof key === "string" && key.startsWith("/api/alerts"),
] as const;

function buildPayload(
  action: FollowUpActionType,
  options?: Omit<FollowUpActionRequest, "action">,
): FollowUpActionRequest {
  return {
    action,
    snoozeHours: options?.snoozeHours,
  };
}

export function useFollowUpActions(
  options: UseFollowUpActionsOptions = {},
): UseFollowUpActionsResult {
  const { mutate } = useSWRConfig();
  const [mutatingItemId, setMutatingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const revalidate = useCallback(
    async () => {
      const keys = options.revalidateKeys ?? DEFAULT_REVALIDATE_KEYS;
      await Promise.all(
        keys.map((key) => mutate(key as never, undefined, { revalidate: true })),
      );
    },
    [mutate, options.revalidateKeys],
  );

  const executeFollowUpAction = useCallback(
    async (
      item: Pick<AttentionItem, "id" | "followUpItemId">,
      action: FollowUpActionType,
      actionOptions?: Omit<FollowUpActionRequest, "action">,
    ) => {
      if (!item.followUpItemId) {
        return;
      }

      setMutatingItemId(item.id);
      setError(null);

      try {
        await apiFetch(`/api/alerts/follow-ups/${item.followUpItemId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(action, actionOptions)),
        });
        await revalidate();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update follow-up action.");
      } finally {
        setMutatingItemId((current) => (current === item.id ? null : current));
      }
    },
    [revalidate],
  );

  const wrap = useCallback(
    (
      action: FollowUpActionType,
      actionOptions?: Omit<FollowUpActionRequest, "action">,
    ) =>
      async (item: Pick<AttentionItem, "id" | "followUpItemId">) => {
        await executeFollowUpAction(item, action, actionOptions);
      },
    [executeFollowUpAction],
  );

  return {
    isMutating: Boolean(mutatingItemId),
    mutatingItemId,
    error,
    executeFollowUpAction,
    resolveFollowUp: wrap("resolve"),
    dismissFollowUp: wrap("dismiss"),
    snoozeFollowUp: wrap("snooze", { snoozeHours: 24 }),
    reopenFollowUp: wrap("reopen"),
    acknowledgeWaitingFollowUp: wrap("acknowledge_waiting"),
  };
}
