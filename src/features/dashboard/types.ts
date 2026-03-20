import type { Dispatch, SetStateAction } from "react";

import type {
  ActiveThread,
  AttentionItem,
  ChannelCardData,
  ChannelState,
  ConversationType,
  DashboardAlert,
  ThreadMessage,
  TimelineDataPoint,
  ThreadInsight,
  WorkspaceOverview,
} from "@/lib/types";
import type { TrendPoint } from "@/lib/hooks/useSentimentTrends";
import type { SSEConnectionState } from "@/lib/hooks/useSSE";

export type DashboardTrendRange = 7 | 14 | 30 | 90;

export interface DashboardTrendRangeOption {
  label: string;
  value: DashboardTrendRange;
}

export interface DashboardAlertGroup {
  channelId: string;
  channelName: string;
  conversationType?: ConversationType;
  alerts: DashboardAlert[];
}

export interface RealtimeRefreshPolicy {
  scope: RealtimeRefreshScope;
  connectionState: SSEConnectionState;
  live: boolean;
  refreshInterval: number;
  revalidateOnFocus: boolean;
  keepPreviousData: boolean;
  dedupingInterval: number;
  refreshWhenHidden: boolean;
}

export type RealtimeRefreshScope =
  | "overview"
  | "channel"
  | "thread"
  | "inbox"
  | "settings";

export interface UseRealtimeRefreshPolicyOptions {
  enabled?: boolean;
  liveRefreshInterval?: number;
  pollingRefreshInterval?: number;
  dedupingInterval?: number;
  revalidateOnFocus?: boolean;
  refreshWhenHidden?: boolean;
}

export interface DashboardOverviewViewModel {
  overview: WorkspaceOverview | undefined;
  channels: ChannelCardData[] | undefined;
  alerts: DashboardAlert[] | undefined;
  trends: TrendPoint[] | undefined;
  overviewLoading: boolean;
  channelsLoading: boolean;
  alertsLoading: boolean;
  trendsLoading: boolean;
  isLoading: boolean;
  trendRange: DashboardTrendRange;
  setTrendRange: Dispatch<SetStateAction<DashboardTrendRange>>;
  trendRangeOptions: readonly DashboardTrendRangeOption[];
  topChannels: ChannelCardData[];
  recentAlerts: DashboardAlert[];
  alertGroups: DashboardAlertGroup[];
  refreshPolicy: RealtimeRefreshPolicy;
}

export interface UseDashboardOverviewModelOptions {
  initialTrendRange?: DashboardTrendRange;
  trendRangeOptions?: readonly DashboardTrendRangeOption[];
  recentAlertLimit?: number;
  topChannelLimit?: number;
}

export interface ChannelDetailActionPlan {
  shouldSeedRollup: boolean;
  shouldSeedAnalysis: boolean;
  shouldRetryBackfill: boolean;
  threadSeedTargets: string[];
}

export interface ChannelDetailViewModel {
  channelId: string;
  channel: ChannelCardData | undefined;
  state: ChannelState | undefined;
  timeline: TimelineDataPoint[] | undefined;
  threads: ActiveThread[] | undefined;
  channelName: string;
  conversationType: ConversationType | undefined;
  status: ChannelState["status"] | ChannelCardData["status"] | "ready";
  effectiveStatus: ChannelState["status"] | ChannelCardData["status"] | "ready";
  isLoading: boolean;
  stateLoading: boolean;
  timelineLoading: boolean;
  threadsLoading: boolean;
  isChannelSettingUp: boolean;
  isChannelFailed: boolean;
  isChannelRemoved: boolean;
  openConversation: boolean;
  highlightedMessageTs: string | null;
  selectedParticipantId: string | null;
  setSelectedParticipantId: Dispatch<SetStateAction<string | null>>;
  activeThreads: ActiveThread[];
  recentThreads: ActiveThread[];
  threadInsights: ThreadInsight[];
  userMap: Map<string, string>;
  refreshPolicy: RealtimeRefreshPolicy;
  actionPlan: ChannelDetailActionPlan;
}

export interface UseChannelDetailModelOptions {
  openConversation?: boolean;
  highlightedMessageTs?: string | null;
  queuedBackfillRetry?: boolean;
  initialSelectedParticipantId?: string | null;
  activeThreadLimit?: number;
}

export interface ThreadDetailActionPlan {
  shouldQueueRollup: boolean;
}

export interface ThreadDetailViewModel {
  channelId: string;
  threadTs: string;
  channel: ChannelCardData | undefined;
  state: ChannelState | undefined;
  threads: ActiveThread[] | undefined;
  messages: ThreadMessage[] | undefined;
  channelName: string;
  conversationType: ConversationType | undefined;
  thread: ActiveThread | undefined;
  threadInsights: ThreadInsight[];
  crucialMessageTs: string | null;
  crucialMessageSummary: string | null;
  highlightedMessageTs: string | null;
  isLoading: boolean;
  channelLoading: boolean;
  stateLoading: boolean;
  threadsLoading: boolean;
  messagesLoading: boolean;
  userMap: Map<string, string>;
  refreshPolicy: RealtimeRefreshPolicy;
  actionPlan: ThreadDetailActionPlan;
}

export interface UseThreadDetailModelOptions {
  highlightedMessageTs?: string | null;
  analysisTargetLimit?: number;
  threadSeedLimit?: number;
}

export type FollowUpActionType =
  | "resolve"
  | "dismiss"
  | "snooze"
  | "acknowledge_waiting"
  | "reopen";

export interface FollowUpActionRequest {
  action: FollowUpActionType;
  snoozeHours?: number;
}

export interface UseFollowUpActionsOptions {
  revalidateKeys?: readonly (string | ((key: unknown) => boolean))[];
}

export interface UseFollowUpActionsResult {
  isMutating: boolean;
  mutatingItemId: string | null;
  error: string | null;
  executeFollowUpAction: (
    item: Pick<AttentionItem, "id" | "followUpItemId">,
    action: FollowUpActionType,
    options?: Omit<FollowUpActionRequest, "action">,
  ) => Promise<void>;
  resolveFollowUp: (
    item: Pick<AttentionItem, "id" | "followUpItemId">,
    options?: Omit<FollowUpActionRequest, "action">,
  ) => Promise<void>;
  dismissFollowUp: (
    item: Pick<AttentionItem, "id" | "followUpItemId">,
    options?: Omit<FollowUpActionRequest, "action">,
  ) => Promise<void>;
  snoozeFollowUp: (
    item: Pick<AttentionItem, "id" | "followUpItemId">,
    options?: Omit<FollowUpActionRequest, "action">,
  ) => Promise<void>;
  reopenFollowUp: (
    item: Pick<AttentionItem, "id" | "followUpItemId">,
    options?: Omit<FollowUpActionRequest, "action">,
  ) => Promise<void>;
  acknowledgeWaitingFollowUp: (
    item: Pick<AttentionItem, "id" | "followUpItemId">,
    options?: Omit<FollowUpActionRequest, "action">,
  ) => Promise<void>;
}
