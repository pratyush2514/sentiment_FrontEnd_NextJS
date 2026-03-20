"use client";

import { useMemo } from "react";

import { useChannels, useChannelState, useThreadMessages, useThreads } from "@/lib/hooks";

import {
  createChannelUserMap,
  buildThreadDetailActionPlan,
  toDashboardQueryConfig,
} from "../utils";
import { useRealtimeRefreshPolicy } from "./useRealtimeRefreshPolicy";

import type {
  ThreadDetailViewModel,
  UseThreadDetailModelOptions,
} from "../types";

export function useThreadDetailModel(
  channelId: string | null,
  threadTs: string | null,
  options: UseThreadDetailModelOptions = {},
): ThreadDetailViewModel {
  const refreshPolicy = useRealtimeRefreshPolicy("thread");
  const queryConfig = toDashboardQueryConfig(refreshPolicy);
  const channelsQuery = useChannels(queryConfig);
  const stateQuery = useChannelState(channelId, queryConfig);
  const threadsQuery = useThreads(channelId, queryConfig);
  const messagesQuery = useThreadMessages(channelId, threadTs, queryConfig);

  const channel = channelsQuery.data?.find((entry) => entry.id === channelId);
  const state = stateQuery.data;
  const threadCollections = threadsQuery.data;
  const threadConversation = messagesQuery.data;
  const messages = threadConversation?.messages;

  const availableThreads = [
    ...(threadCollections?.surfacedThreads ?? state?.activeThreads ?? []),
    ...(threadCollections?.recentThreads ?? []),
  ].filter((thread, index, array) =>
    array.findIndex((candidate) => candidate.threadTs === thread.threadTs) === index,
  );
  const thread =
    availableThreads.find((entry) => entry.threadTs === threadTs) ??
    threadConversation?.thread ??
    undefined;
  const channelName = state?.channelName ?? channel?.name ?? channelId ?? "";
  const conversationType = state?.conversationType ?? channel?.conversationType;
  const userMap = useMemo(() => createChannelUserMap(state), [state]);
  const messageInsights = messages?.flatMap((message) => message.threadInsights ?? []) ?? [];
  const threadInsights = thread?.insights?.length
    ? thread.insights
    : (threadConversation?.threadInsights?.length ?? 0) > 0
      ? threadConversation?.threadInsights ?? []
      : messageInsights.length > 0
        ? messageInsights
        : state?.threadInsights ?? [];
  const crucialMessageTs =
    thread?.crucialMessageTs ??
    thread?.crucialMessage?.messageTs ??
    threadConversation?.crucialMessage?.messageTs ??
    threadInsights.find((insight) => insight.type === "crucial")?.messageTs ??
    messages?.find((message) => message.isCrucial)?.ts ??
    null;
  const crucialMessageSummary =
    thread?.crucialMessageSummary ??
    thread?.crucialMessage?.summary ??
    thread?.crucialMessage?.reason ??
    threadConversation?.crucialMessage?.summary ??
    threadConversation?.crucialMessage?.reason ??
    threadInsights.find((insight) => insight.type === "crucial")?.value ??
    messages?.find((message) => message.isCrucial)?.crucialReason ??
    null;
  const actionPlan = useMemo(
    () =>
      buildThreadDetailActionPlan({
        messages,
      }),
    [messages],
  );

  return {
    channelId: channelId ?? "",
    threadTs: threadTs ?? "",
    channel,
    state,
    threads: availableThreads,
    messages,
    channelName,
    conversationType,
    thread,
    highlightedMessageTs: options.highlightedMessageTs ?? null,
    isLoading:
      channelsQuery.isLoading ||
      stateQuery.isLoading ||
      threadsQuery.isLoading ||
      messagesQuery.isLoading,
    channelLoading: channelsQuery.isLoading,
    stateLoading: stateQuery.isLoading,
    threadsLoading: threadsQuery.isLoading,
    messagesLoading: messagesQuery.isLoading,
    userMap,
    threadInsights,
    crucialMessageTs,
    crucialMessageSummary,
    refreshPolicy,
    actionPlan,
  };
}
