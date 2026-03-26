import type {
  ActiveThread,
  ChannelCardData,
  ChannelState,
  DashboardAlert,
  Participant,
  ThreadMessage,
} from "@/lib/types";
import { isPlaceholderSummary } from "@/lib/utils/summary";

import type {
  ChannelDetailActionPlan,
  DashboardAlertGroup,
  RealtimeRefreshPolicy,
  ThreadDetailActionPlan,
} from "./types";
import type { DashboardQueryConfig } from "@/lib/hooks/queryConfig";

export function createUserDisplayMap(
  participants: Pick<Participant, "userId" | "displayName">[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const participant of participants) {
    if (
      participant.displayName &&
      participant.displayName !== participant.userId
    ) {
      map.set(participant.userId, participant.displayName);
    }
  }
  return map;
}

export function groupAlertsByChannel(
  alerts: DashboardAlert[],
): DashboardAlertGroup[] {
  const map = new Map<string, DashboardAlertGroup>();

  for (const alert of alerts) {
    const existing = map.get(alert.channelId);
    if (existing) {
      existing.alerts.push(alert);
      continue;
    }

    map.set(alert.channelId, {
      channelId: alert.channelId,
      channelName: alert.channelName,
      conversationType: alert.conversationType,
      alerts: [alert],
    });
  }

  return [...map.values()];
}

export function sortChannelsByActivity(
  channels: ChannelCardData[],
): ChannelCardData[] {
  return [...channels].sort((left, right) => {
    const leftActivity = left.lastActivity ? Date.parse(left.lastActivity) : 0;
    const rightActivity = right.lastActivity ? Date.parse(right.lastActivity) : 0;
    if (rightActivity !== leftActivity) {
      return rightActivity - leftActivity;
    }

    return left.name.localeCompare(right.name);
  });
}

export function pickRecentAlerts(alerts: DashboardAlert[], limit = 8) {
  return [...alerts]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, limit);
}

export function pickTopChannels(
  channels: ChannelCardData[],
  limit = 8,
): ChannelCardData[] {
  return sortChannelsByActivity(channels).slice(0, limit);
}

export function createChannelUserMap(state?: ChannelState | undefined) {
  return state?.participants ? createUserDisplayMap(state.participants) : new Map<string, string>();
}

export function pickThreadSeedTargets(
  threads: ActiveThread[] | undefined,
  limit = 3,
): string[] {
  return (threads ?? []).slice(0, limit).map((thread) => thread.threadTs);
}

export function pickThreadAnalysisTargets(
  messages: ThreadMessage[] | undefined,
  limit = 8,
): ThreadMessage[] {
  if (!messages || messages.length === 0) {
    return [];
  }

  return [...messages]
    .filter((message) => {
      return (
        message.analysisStatus === "failed" ||
        message.analysisStatus === "pending" ||
        (message.analysisStatus === "completed" && !message.emotion && !message.explanation)
      );
    })
    .sort((left, right) => {
      const rightPriority = right.isCrucial ? 1 : 0;
      const leftPriority = left.isCrucial ? 1 : 0;
      if (rightPriority !== leftPriority) {
        return rightPriority - leftPriority;
      }

      return Number.parseFloat(right.ts) - Number.parseFloat(left.ts);
    })
    .slice(0, limit);
}
export function buildChannelDetailActionPlan({
  state,
  activeThreads,
  queuedBackfillRetry,
  seedLimit = 3,
}: {
  state: ChannelState | undefined;
  timelineLength: number;
  activeThreads: ActiveThread[];
  queuedBackfillRetry?: boolean;
  seedLimit?: number;
}): ChannelDetailActionPlan {
  const threadSeedTargets = pickThreadSeedTargets(activeThreads, seedLimit);
  if (!state) {
    return {
      shouldSeedRollup: false,
      shouldSeedAnalysis: false,
      shouldRetryBackfill: false,
      threadSeedTargets,
    };
  }

  const activeMessageCount =
    state.activeMessageCount ?? state.windowStats?.messageCountInWindow ?? 0;
  const shouldSeedRollup =
    state.status === "ready" &&
    activeMessageCount > 0 &&
    (isPlaceholderSummary(state.runningSummary) || state.keyDecisions.length === 0 || threadSeedTargets.length > 0);

  const shouldSeedAnalysis =
    false;

  return {
    shouldSeedRollup,
    shouldSeedAnalysis,
    shouldRetryBackfill: Boolean(queuedBackfillRetry && state.status === "failed"),
    threadSeedTargets,
  };
}

export function buildThreadDetailActionPlan({
  messages,
}: {
  messages: ThreadMessage[] | undefined;
}): ThreadDetailActionPlan {
  return {
    shouldQueueRollup: Boolean(messages && messages.length > 0),
  };
}

export function toDashboardQueryConfig(
  policy: RealtimeRefreshPolicy,
): DashboardQueryConfig {
  return {
    refreshInterval: policy.refreshInterval,
    revalidateOnFocus: policy.revalidateOnFocus,
    keepPreviousData: policy.keepPreviousData,
    dedupingInterval: policy.dedupingInterval,
    refreshWhenHidden: policy.refreshWhenHidden,
  };
}
