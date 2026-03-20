"use client";

import { useMemo, useState } from "react";

import { useChannels, useChannelState, useThreads, useTimeline } from "@/lib/hooks";

import {
  createChannelUserMap,
  buildChannelDetailActionPlan,
  toDashboardQueryConfig,
} from "../utils";
import { useRealtimeRefreshPolicy } from "./useRealtimeRefreshPolicy";

import type {
  ChannelDetailViewModel,
  UseChannelDetailModelOptions,
} from "../types";

export function useChannelDetailModel(
  channelId: string | null,
  options: UseChannelDetailModelOptions = {},
): ChannelDetailViewModel {
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(
    options.initialSelectedParticipantId ?? null,
  );

  const refreshPolicy = useRealtimeRefreshPolicy("channel");
  const queryConfig = toDashboardQueryConfig(refreshPolicy);
  const channelsQuery = useChannels(queryConfig);
  const stateQuery = useChannelState(channelId, queryConfig);
  const timelineQuery = useTimeline(channelId, 168, queryConfig);
  const threadsQuery = useThreads(channelId, queryConfig);

  const channel = channelsQuery.data?.find((entry) => entry.id === channelId);
  const state = stateQuery.data;
  const timeline = timelineQuery.data;
  const threadCollections = threadsQuery.data;

  const activeThreads = useMemo(
    () =>
      threadCollections?.surfacedThreads && threadCollections.surfacedThreads.length > 0
        ? threadCollections.surfacedThreads
        : state?.activeThreads ?? [],
    [state?.activeThreads, threadCollections],
  );
  const recentThreads = useMemo(
    () => threadCollections?.recentThreads ?? [],
    [threadCollections],
  );

  const channelName = state?.channelName ?? channel?.name ?? channelId ?? "";
  const conversationType = state?.conversationType ?? channel?.conversationType;
  const status = state?.status ?? channel?.status ?? "ready";
  const effectiveStatus =
    options.queuedBackfillRetry && status === "failed" ? "pending" : status;
  const userMap = useMemo(() => createChannelUserMap(state), [state]);
  const resolvedSelectedParticipantId = useMemo(() => {
    const candidate = options.initialSelectedParticipantId ?? selectedParticipantId;
    if (!candidate || !state) {
      return candidate ?? null;
    }

    return state.participants.some((participant) => participant.userId === candidate)
      ? candidate
      : null;
  }, [options.initialSelectedParticipantId, selectedParticipantId, state]);
  const actionPlan = useMemo(
    () =>
      buildChannelDetailActionPlan({
        state,
        timelineLength: timeline?.length ?? 0,
        activeThreads,
        queuedBackfillRetry: options.queuedBackfillRetry,
        seedLimit: options.activeThreadLimit ?? 3,
      }),
    [
      activeThreads,
      options.activeThreadLimit,
      options.queuedBackfillRetry,
      state,
      timeline?.length,
    ],
  );
  const threadInsights = useMemo(
    () => {
      const insights = activeThreads.flatMap((thread) => thread.insights ?? []).filter(Boolean);
      if (insights.length > 0) {
        return insights;
      }
      return state?.threadInsights ?? [];
    },
    [activeThreads, state?.threadInsights],
  );

  return {
    channelId: channelId ?? "",
    channel,
    state,
    timeline,
    threads: activeThreads,
    channelName,
    conversationType,
    status,
    effectiveStatus,
    isLoading:
      channelsQuery.isLoading ||
      stateQuery.isLoading ||
      timelineQuery.isLoading ||
      threadsQuery.isLoading,
    stateLoading: stateQuery.isLoading,
    timelineLoading: timelineQuery.isLoading,
    threadsLoading: threadsQuery.isLoading,
    isChannelSettingUp:
      effectiveStatus === "pending" || effectiveStatus === "initializing",
    isChannelFailed: effectiveStatus === "failed",
    isChannelRemoved: effectiveStatus === "removed",
    openConversation: options.openConversation ?? false,
    highlightedMessageTs: options.highlightedMessageTs ?? null,
    selectedParticipantId: resolvedSelectedParticipantId,
    setSelectedParticipantId,
    activeThreads,
    recentThreads,
    threadInsights,
    userMap,
    refreshPolicy,
    actionPlan,
  };
}
