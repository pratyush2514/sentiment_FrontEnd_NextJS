import type {
  CrucialMessageSummary,
  MessageTriage,
  SlackFileAttachment,
  ThreadInsight,
  ThreadInsightSummary,
} from "./channel";
import type { InteractionTone } from "./sentiment";

export interface WorkspaceOverview {
  activeChannels: number;
  avgSentiment: number;
  alerts24h: number;
  followUpsOpen: number;
  teamHealth: number;
  totalMessages24h: number;
}

export type TokenRotationStatus =
  | "ready"
  | "legacy_reinstall_required"
  | "refresh_failed"
  | "expired_or_invalid";

export interface WorkspaceStatusResponse {
  installed: boolean;
  botUserId: string | null;
  scopes: string[];
  tokenRotationStatus?: TokenRotationStatus;
  botTokenExpiresAt?: string | null;
  lastTokenRefreshAt?: string | null;
  lastTokenRefreshError?: string | null;
  lastTokenRefreshErrorAt?: string | null;
}

export interface DashboardAlert {
  id: string;
  kind: "follow_up" | "sentiment";
  followUpItemId?: string | null;
  channelId: string;
  channelName: string;
  conversationType?: ConversationType;
  severity: "low" | "medium" | "high";
  title: string;
  message: string;
  sourceMessageTs: string;
  threadTs?: string | null;
  actorName?: string | null;
  dueAt?: string | null;
  createdAt: string;
  contextHref?: string;
  metadata?: {
    emotion?: string;
    interactionTone?: InteractionTone | null;
    threadInsights?: ThreadInsight[];
    threadInsight?: ThreadInsightSummary | null;
    crucialMessage?: CrucialMessageSummary | null;
    threadState?: string;
    surfaceReason?: string;
    primaryIssue?: string;
    emotionalTemperature?: string;
    operationalRisk?: string;
    relatedMessageCount?: number;
    [key: string]: unknown;
  };
}

export type ConversationType =
  | "public_channel"
  | "private_channel"
  | "dm"
  | "group_dm";

export type ImportanceTierOverride =
  | "auto"
  | "high_value"
  | "standard"
  | "low_value";

export type ImportanceTier = Exclude<ImportanceTierOverride, "auto">;

export type ChannelModeOverride =
  | "auto"
  | "collaboration"
  | "automation"
  | "mixed";

export type ChannelMode = Exclude<ChannelModeOverride, "auto">;

export type AttentionKind =
  | "reply_needed"
  | "follow_up_due"
  | "leadership_instruction"
  | "sentiment_risk"
  | "thread_escalation";

export type AttentionGroup =
  | "needs_reply"
  | "acknowledged"
  | "escalated"
  | "sentiment_risk"
  | "resolved_recently";

export type AttentionState = "open" | "acknowledged" | "escalated" | "resolved";
export type AttentionSeverity = "low" | "medium" | "high";
export type FollowUpWorkflowState =
  | "pending_reply_window"
  | "awaiting_primary"
  | "acknowledged_waiting"
  | "escalated"
  | "resolved"
  | "dismissed"
  | "expired";
export type FollowUpResolutionReason =
  | "reply"
  | "reaction_ack"
  | "requester_ack"
  | "natural_conclusion"
  | "manual_done"
  | "manual_dismissed"
  | "expired";
export type FollowUpResolutionScope =
  | "thread"
  | "channel"
  | "reaction"
  | "manual"
  | "system";

export interface AttentionItem {
  id: string;
  kind: AttentionKind;
  group: AttentionGroup;
  resolutionState: AttentionState;
  severity: AttentionSeverity;
  priorityScore: number;
  conversationType: ConversationType;
  channelId: string;
  channelName: string;
  actorUserId?: string | null;
  actorName?: string | null;
  sourceMessageTs: string;
  threadTs?: string | null;
  title: string;
  message: string;
  whyThisMatters: string;
  expectedResponderIds: string[];
  expectedResponderNames: string[];
  workflowState?: FollowUpWorkflowState | null;
  primaryResponderIds: string[];
  primaryResponderNames: string[];
  escalationResponderIds: string[];
  escalationResponderNames: string[];
  resolvedViaEscalation?: boolean;
  primaryMissedSla?: boolean;
  acknowledgedAt?: string | null;
  ignoredScore?: number;
  visibilityAfter?: string | null;
  lastStateChangedAt: string;
  dueAt?: string | null;
  createdAt: string;
  contextHref: string;
  followUpItemId?: string | null;
  resolutionReason?: FollowUpResolutionReason | null;
  engagementScope?: FollowUpResolutionScope | null;
  lastEngagementAt?: string | null;
  metadata?: {
    emotion?: string;
    threadInsights?: ThreadInsight[];
    crucialMessage?: CrucialMessageSummary | null;
    relatedMessageCount?: number;
    [key: string]: unknown;
  };
  messageIntent?: string | null;
  urgencyDimensions?: {
    isActionable: boolean;
    isBlocking: boolean;
    urgencyLevel: string;
  } | null;
}

export type UserRole = "client" | "worker" | "senior" | "observer";

export interface RoleAssignment {
  id: string;
  workspace_id: string;
  user_id: string;
  role: UserRole;
  source: "manual" | "inferred";
  review_state: "pending" | "confirmed" | "rejected";
  confidence: number;
  reasons_json: string[];
  created_at: string;
  updated_at: string;
}

export interface RoleSuggestion {
  role: UserRole;
  confidence: number;
  source: "policy" | "profile" | "interaction";
  reasons: string[];
}

export interface RoleDirectoryEntry {
  userId: string;
  displayName: string;
  profileImage: string | null;
  email: string | null;
  messageCount: number;
  channelCount: number;
  confirmedRole: UserRole | null;
  displayLabel: string | null;
  suggestedRole: RoleSuggestion | null;
  effectiveRole: UserRole | "unknown";
  assignments: RoleAssignment[];
}

export interface ChannelMemberWithRole {
  userId: string;
  displayName: string;
  profileImage: string | null;
  email: string | null;
  isBot: boolean;
  role: UserRole | null;
  displayLabel: string | null;
  policyFlags: {
    isOwner: boolean;
    isClient: boolean;
    isSenior: boolean;
  };
}

export interface ConversationPolicy {
  channelId: string;
  channelName: string;
  conversationType: ConversationType;
  analysisWindowDays: number;
  enabled: boolean;
  slaHours: number;
  ownerUserIds: string[];
  clientUserIds: string[];
  seniorUserIds: string[];
  importanceTierOverride: ImportanceTierOverride;
  recommendedImportanceTier: ImportanceTier;
  effectiveImportanceTier: ImportanceTier;
  channelModeOverride: ChannelModeOverride;
  recommendedChannelMode: ChannelMode;
  effectiveChannelMode: ChannelMode;
  slackNotificationsEnabled: boolean;
  muted: boolean;
  privacyOptIn: boolean;
}

export interface AlertContextMessage {
  id: string;
  ts: string;
  threadTs?: string;
  userId: string;
  userName: string;
  text: string;
  files?: SlackFileAttachment[];
  links?: import("./channel").SlackLinkAttachment[];
  createdAt: string | null;
  analysisStatus?: "pending" | "processing" | "completed" | "failed" | "skipped";
  emotion?: string;
  interactionTone?: InteractionTone | null;
  escalationRisk?: "low" | "medium" | "high";
  isSource: boolean;
  triage?: MessageTriage | null;
  isCrucial?: boolean;
  crucialReason?: string | null;
  threadInsights?: ThreadInsight[];
  crucialMessage?: CrucialMessageSummary | null;
}

export interface AlertContext {
  channelId: string;
  channelName: string;
  sourceMessageTs: string;
  threadTs?: string | null;
  messages: AlertContextMessage[];
  contextHref: string;
  threadInsight?: ThreadInsightSummary | null;
  threadInsights?: ThreadInsight[];
  crucialMessage?: CrucialMessageSummary | null;
  crucialMessages?: AlertContextMessage[];
}

export interface FollowUpRuleConfig {
  channelId: string;
  channelName: string;
  enabled: boolean;
  analysisWindowDays: number;
  slaHours: number;
  ownerUserIds: string[];
  clientUserIds: string[];
}

export interface ApiResponse<T> {
  data: T;
  ok: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}
