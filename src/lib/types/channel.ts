// ─── Channel & Workspace Types ───────────────────────────────────────────

import type { Emotion, EscalationRisk, SentimentTrajectory, MessageAnalysis, InteractionTone } from './sentiment';
import type { AnalysisStatus } from "./message";
import type {
  ChannelMode,
  ChannelModeOverride,
  ConversationType,
  ImportanceTier,
  ImportanceTierOverride,
} from "./api";

export type ChannelStatus = 'pending' | 'initializing' | 'ready' | 'failed' | 'removed';

export type ChannelHealth = 'healthy' | 'attention' | 'at-risk';

export interface SentimentSnapshot {
  totalAnalyzed: number;
  emotionDistribution: Record<Emotion, number>;
  highRiskCount: number;
}

export interface HealthCounts {
  openAlertCount: number;
  highSeverityAlertCount: number;
  automationIncidentCount: number;
  criticalAutomationIncidentCount: number;
  automationIncident24hCount: number;
  criticalAutomationIncident24hCount: number;
  humanRiskSignalCount: number;
  requestSignalCount: number;
  decisionSignalCount: number;
  resolutionSignalCount: number;
  flaggedMessageCount: number;
  highRiskMessageCount: number;
  attentionThreadCount: number;
  blockedThreadCount: number;
  escalatedThreadCount: number;
  riskyThreadCount: number;
  totalMessageCount: number;
  skippedMessageCount: number;
  contextOnlyMessageCount: number;
  ignoredMessageCount: number;
  inflightMessageCount: number;
}

export interface ChannelWindowStats {
  analysisWindowDays: number;
  messageCountInWindow: number;
  analyzedMessageCount: number;
  skippedMessageCount: number;
  contextOnlyMessageCount: number;
  ignoredMessageCount: number;
  inflightMessageCount: number;
}

export interface Participant {
  userId: string;
  displayName: string;
  messageCount: number;
  profileImage?: string;
  contributionPct: number;
  sentimentTrend: 'improving' | 'stable' | 'declining' | 'insufficient';
  escalationInvolvement: number;
  role?: 'client' | 'worker' | 'senior' | 'observer' | 'unknown';
  displayLabel?: string | null;
  dominantEmotion?: string | null;
  frustrationScore: number;
}

export type SurfacePriority = "none" | "low" | "medium" | "high";
export type MessageCandidateKind =
  | "ignore"
  | "context_only"
  | "message_candidate"
  | "thread_turning_point"
  | "resolution_signal";
export type CanonicalSignalType =
  | "ignore"
  | "context"
  | "request"
  | "decision"
  | "resolution"
  | "human_risk"
  | "operational_incident";
export type CanonicalSignalSeverity = "none" | "low" | "medium" | "high";
export type StateTransition =
  | "issue_opened"
  | "investigating"
  | "blocked"
  | "waiting_external"
  | "ownership_assigned"
  | "decision_made"
  | "resolved"
  | "escalated";
export type SignalStateImpact =
  | "none"
  | "issue_opened"
  | "blocked"
  | "investigating"
  | "resolved"
  | "escalated";
export type EvidenceType = "heuristic" | "llm_enriched" | "rollup_derived";
export type OriginType = "human" | "bot" | "system";
export type IncidentFamily =
  | "none"
  | "workflow_error"
  | "execution_failure"
  | "data_shape_error"
  | "timeout"
  | "http_error"
  | "infra_error"
  | "unknown";
export type ThreadState =
  | "monitoring"
  | "investigating"
  | "blocked"
  | "waiting_external"
  | "resolved"
  | "escalated";
export type EmotionalTemperature = "calm" | "watch" | "tense" | "escalated";

export interface MessageTriage {
  candidateKind: MessageCandidateKind;
  signalType?: CanonicalSignalType | null;
  severity?: CanonicalSignalSeverity | null;
  stateImpact?: SignalStateImpact | null;
  evidenceType?: EvidenceType | null;
  channelMode?: ChannelMode | null;
  originType?: OriginType | null;
  confidence?: number | null;
  incidentFamily?: IncidentFamily | null;
  surfacePriority: SurfacePriority;
  reasonCodes: string[];
  stateTransition?: StateTransition | null;
  relatedIncident?: RelatedIncident | null;
}

export interface RelatedIncident {
  sourceChannelId?: string | null;
  sourceChannelName: string;
  kind: "referenced_external_incident";
  message?: string;
  detectedAt?: string | null;
  blocksLocalWork: boolean;
  incidentFamily?: IncidentFamily | null;
}

export interface CrucialMoment {
  messageTs: string;
  kind: string;
  reason: string;
  surfacePriority: SurfacePriority;
}

export interface ThreadInsightSummary {
  summary: string;
  primaryIssue?: string | null;
  threadState?: ThreadState | null;
  surfacePriority: SurfacePriority;
  operationalRisk?: "none" | "low" | "medium" | "high" | null;
  emotionalTemperature?: EmotionalTemperature | null;
  openQuestions: string[];
  crucialMoments: CrucialMoment[];
  lastMeaningfulChangeTs?: string | null;
  updatedAt?: string | null;
  threadTs?: string | null;
}

export interface ActiveThread {
  threadTs: string;
  summary: string;
  messageCount: number;
  lastActivityAt: string;
  sentimentTrajectory: SentimentTrajectory | null;
  openQuestions?: string[];
  insights?: ThreadInsight[];
  threadInsight?: ThreadInsightSummary | null;
  crucialMessageTs?: string | null;
  crucialMessageSummary?: string | null;
  crucialMessage?: CrucialMessageSummary | null;
}

export interface ChannelThreadsData {
  surfacedThreads: ActiveThread[];
  recentThreads: ActiveThread[];
}

export interface KeyDecision {
  text: string;
  detectedAt: string | null;
  threadTs?: string;
  confidence: number;
  participantCount: number;
}

export interface Channel {
  id: string;
  workspaceId: string;
  channelId: string;
  name: string;
  status: ChannelStatus;
  initializedAt: string | null;
  lastEventAt: string | null;
  messageCount: number;
}

export type ChannelSignal = 'stable' | 'elevated' | 'escalating';

export interface RiskDriver {
  key: string;
  label: string;
  message: string;
  severity: "none" | "low" | "medium" | "high";
  category: "human" | "operational" | "thread" | "alert" | "summary";
}

export interface AttentionSummary {
  status: "clear" | "watch" | "action";
  title: string;
  message: string;
  driverKeys: string[];
}

export interface MessageDispositionCounts {
  totalInWindow: number;
  deepAiAnalyzed: number;
  heuristicIncidentSignals: number;
  contextOnly: number;
  routineAcknowledgments: number;
  storedWithoutDeepAnalysis: number;
  inFlight: number;
}

export interface ChannelInsight {
  label: string;
  value: string;
  type: 'concern' | 'tension' | 'trend' | 'actor' | 'neutral';
}

export interface ThreadInsight {
  label: string;
  value: string;
  type: "concern" | "tension" | "trend" | "actor" | "neutral" | "crucial";
  threadTs?: string | null;
  messageTs?: string | null;
}

export interface CrucialMessageSummary {
  messageTs: string;
  summary?: string | null;
  reason?: string | null;
  userName?: string | null;
  threadTs?: string | null;
}

export interface ChannelState {
  channelId: string;
  channelName?: string;
  conversationType?: ConversationType;
  status: ChannelStatus;
  importanceTierOverride?: ImportanceTierOverride;
  recommendedImportanceTier?: ImportanceTier;
  effectiveImportanceTier?: ImportanceTier;
  channelModeOverride?: ChannelModeOverride;
  recommendedChannelMode?: ChannelMode;
  effectiveChannelMode?: ChannelMode;
  initializedAt: string | null;
  runningSummary: string;
  health: ChannelHealth;
  signal: ChannelSignal;
  signalConfidence: number;
  insights: ChannelInsight[];
  riskDrivers: RiskDriver[];
  attentionSummary: AttentionSummary;
  messageDispositionCounts: MessageDispositionCounts;
  relatedIncidents?: RelatedIncident[];
  participants: Participant[];
  activeThreads: ActiveThread[];
  keyDecisions: KeyDecision[];
  sentimentSnapshot: SentimentSnapshot;
  healthCounts: HealthCounts;
  windowStats?: ChannelWindowStats;
  threadInsights?: ThreadInsight[];
  messageCount: number;
  lastEventAt: string | null;
}

export interface ChannelCardData {
  id: string;
  name: string;
  status: ChannelStatus;
  conversationType?: ConversationType;
  health: ChannelHealth;
  signal: ChannelSignal;
  signalConfidence: number;
  effectiveChannelMode?: ChannelMode;
  riskDrivers: RiskDriver[];
  attentionSummary: AttentionSummary;
  messageDispositionCounts: MessageDispositionCounts;
  messageCount: number;
  lastActivity: string | null;
  sentimentSnapshot: SentimentSnapshot;
  healthCounts: HealthCounts;
  sparklineData: number[];
}

export interface SlackFileAttachment {
  name: string;
  title?: string;
  mimetype?: string;
  filetype?: string;
  size?: number;
  permalink?: string;
}

export interface SlackLinkAttachment {
  url: string;
  domain: string;
  label?: string;
  linkType: "pr" | "issue" | "repo" | "doc" | "design" | "task" | "link";
}

export interface FlaggedMessage {
  id: string;
  channelId: string;
  channelName: string;
  ts: string;
  threadTs?: string;
  userId: string;
  userName: string;
  authorFlaggedCount?: number;
  text: string;
  files?: SlackFileAttachment[];
  analysis: MessageAnalysis;
  createdAt: string;
}

export interface ThreadMessage {
  id: string;
  ts: string;
  threadTs?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  files?: SlackFileAttachment[];
  links?: SlackLinkAttachment[];
  source?: "realtime" | "backfill";
  createdAt: string | null;
  analysisStatus?: AnalysisStatus;
  emotion?: Emotion;
  confidence?: number;
  escalationRisk?: EscalationRisk;
  explanation?: string;
  sarcasmDetected?: boolean;
  triggerPhrases?: string[];
  behavioralPattern?: string;
  messageIntent?: string | null;
  isActionable?: boolean | null;
  isBlocking?: boolean;
  urgencyLevel?: string;
  interactionTone?: InteractionTone | null;
  followUp?: {
    itemId: string;
    seriousness: "low" | "medium" | "high";
    summary: string;
    dueAt?: string | null;
    repeatedAskCount: number;
  } | null;
  triage?: MessageTriage | null;
  isCrucial?: boolean;
  crucialReason?: string | null;
  threadInsights?: ThreadInsight[];
}

export interface ThreadConversationData {
  messages: ThreadMessage[];
  thread: ActiveThread | null;
  threadInsight?: ThreadInsightSummary | null;
  threadInsights: ThreadInsight[];
  crucialMessage?: CrucialMessageSummary | null;
}

export interface CostData {
  totalCost: number;
  totalCalls: number;
  callsSaved: number;
  filterRate: number;
  dailyCosts: { date: string; cost: number; calls: number }[];
  channelCosts: { channelName: string; cost: number; calls: number }[];
}
