// ─── Channel & Workspace Types ───────────────────────────────────────────

import type { Emotion, EscalationRisk, SentimentTrajectory, MessageAnalysis, InteractionTone } from './sentiment';
import type {
  AnalysisEligibility,
  AnalysisExecution,
  AnalysisQuality,
  AnalysisStatus,
  AnalysisSuppressionReason,
} from "./message";
import type {
  ChannelMode,
  ChannelModeOverride,
  ConversationType,
  ImportanceTier,
  ImportanceTierOverride,
} from "./api";

export type ChannelStatus = 'pending' | 'initializing' | 'ready' | 'failed' | 'removed';
export type ProductWindowScope = "active" | "archive" | "live";

export type ChannelHealth = 'healthy' | 'attention' | 'at-risk';
export type IngestReadiness = "not_started" | "hydrating" | "ready";
export type IntelligenceReadiness = "missing" | "bootstrap" | "partial" | "ready" | "stale";
export type SummaryArtifactKind = "channel_rollup" | "thread_rollup" | "backfill_rollup";
export type SummaryGenerationMode = "llm" | "fallback" | "reused_existing";
export type SummaryCompletenessStatus =
  | "complete"
  | "partial"
  | "stale"
  | "no_recent_messages";
export type BackfillRunStatus =
  | "running"
  | "completed"
  | "completed_with_degradations"
  | "failed";
export type BackfillRunPhase =
  | "history_import"
  | "thread_expansion"
  | "user_enrichment"
  | "member_sync"
  | "initial_intelligence"
  | "finalize";
export type BackfillMemberSyncResult =
  | "not_started"
  | "running"
  | "succeeded"
  | "degraded"
  | "failed";
export type DegradationSignalScope =
  | "channel"
  | "message"
  | "thread"
  | "summary_artifact"
  | "backfill_run";
export type DegradationSignalSeverity = "info" | "warning" | "error";

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

export interface ChannelWindowMetadata {
  defaultScope?: ProductWindowScope;
  activeWindowDays?: number;
  archiveWindowDays?: number;
  liveWindowHours?: number;
  activeMessageCount?: number;
  totalImportedMessageCount?: number;
}

export interface ChannelRecentActivity {
  label: string;
  windowHours: number;
  messageCount: number;
  activeThreads: number;
  openFollowUps: number;
  resolvedFollowUps: number;
}

export interface ChannelLatestMeeting {
  id: string;
  title: string;
  startedAt: string;
  source: "api" | "webhook" | "shared_link";
  confidence: "high" | "medium";
  meetingSentiment?: "positive" | "neutral" | "concerned" | "tense" | null;
  summary?: string | null;
  openObligations: number;
  overdueObligations: number;
  blockers: string[];
  decisions: string[];
  nextSteps: string[];
}

export interface ChannelMeetingContext {
  latestMeeting: ChannelLatestMeeting;
}

export interface UnifiedDriver {
  level: "positive" | "warning" | "critical";
  source: "slack" | "fathom" | "combined";
  message: string;
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

export type SummaryFactKind =
  | "topic"
  | "blocker"
  | "resolution"
  | "decision"
  | "primary_issue"
  | "open_question";

export interface SummaryEvidenceRef {
  messageTs: string;
  threadTs?: string | null;
  excerpt?: string | null;
}

export interface SummaryFact {
  kind: SummaryFactKind;
  text: string;
  evidence: SummaryEvidenceRef[];
}

export interface KeyDecision {
  text: string;
  detectedAt: string | null;
  threadTs?: string | null;
  messageTs?: string | null;
  evidence?: SummaryEvidenceRef[];
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
export type ChannelSignalEvidenceTier = "signal" | "pattern" | "confirmed";

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

export interface SummaryArtifact {
  id: string;
  summaryKind: SummaryArtifactKind;
  generationMode: SummaryGenerationMode;
  completenessStatus: SummaryCompletenessStatus;
  summary: string;
  keyDecisions: string[];
  summaryFacts: SummaryFact[];
  degradedReasons: string[];
  coverageStartTs?: string | null;
  coverageEndTs?: string | null;
  candidateMessageCount: number;
  includedMessageCount: number;
  artifactVersion: number;
  sourceRunId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SummaryCoverage {
  startTs: string | null;
  endTs: string | null;
}

export interface BackfillRun {
  id: string;
  status: BackfillRunStatus;
  currentPhase: BackfillRunPhase;
  pagesFetched: number;
  messagesImported: number;
  threadRootsDiscovered: number;
  threadsAttempted: number;
  threadsFailed: number;
  usersResolved: number;
  memberSyncResult: BackfillMemberSyncResult;
  summaryArtifactId?: string | null;
  degradedReasonCount: number;
  lastError?: string | null;
  startedAt: string;
  completedAt?: string | null;
  updatedAt: string;
}

export interface DegradationSignal {
  id: string;
  scopeType: DegradationSignalScope;
  scopeKey?: string | null;
  messageTs?: string | null;
  threadTs?: string | null;
  summaryArtifactId?: string | null;
  backfillRunId?: string | null;
  degradationType: string;
  severity: DegradationSignalSeverity;
  details: Record<string, unknown>;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface MessageTruthCounts {
  total: number;
  eligible: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  suppressed: number;
  partial: number;
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
  ingestReadiness?: IngestReadiness | null;
  intelligenceReadiness?: IntelligenceReadiness | null;
  latestSummaryCompleteness?: SummaryCompletenessStatus | null;
  hasActiveDegradations?: boolean;
  currentSummaryArtifactId?: string | null;
  activeBackfillRunId?: string | null;
  activeWindowSummary?: string;
  activeWindowSummaryUpdatedAt?: string | null;
  activeWindowSummaryCoverage?: SummaryCoverage | null;
  liveSummary?: string | null;
  liveSummaryUpdatedAt?: string | null;
  liveSummaryCoverage?: SummaryCoverage | null;
  runningSummary: string;
  summaryArtifact?: SummaryArtifact | null;
  backfillRun?: BackfillRun | null;
  degradationSignals?: DegradationSignal[];
  health: ChannelHealth;
  signal: ChannelSignal;
  signalConfidence: number;
  signalEvidenceTier?: ChannelSignalEvidenceTier;
  insights: ChannelInsight[];
  riskDrivers: RiskDriver[];
  recentActivity?: ChannelRecentActivity | null;
  meetingContext?: ChannelMeetingContext | null;
  unifiedDrivers?: UnifiedDriver[];
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
  defaultScope?: ProductWindowScope;
  activeWindowDays?: number;
  archiveWindowDays?: number;
  liveWindowHours?: number;
  activeMessageCount?: number;
  totalImportedMessageCount?: number;
  messageCount: number;
  lastEventAt: string | null;
}

export interface ChannelCardData {
  id: string;
  name: string;
  status: ChannelStatus;
  conversationType?: ConversationType;
  ingestReadiness?: IngestReadiness | null;
  intelligenceReadiness?: IntelligenceReadiness | null;
  latestSummaryCompleteness?: SummaryCompletenessStatus | null;
  hasActiveDegradations?: boolean;
  health: ChannelHealth;
  signal: ChannelSignal;
  signalConfidence: number;
  signalEvidenceTier?: ChannelSignalEvidenceTier;
  effectiveChannelMode?: ChannelMode;
  riskDrivers: RiskDriver[];
  attentionSummary: AttentionSummary;
  messageDispositionCounts: MessageDispositionCounts;
  messageCount: number;
  lastActivity: string | null;
  sentimentSnapshot: SentimentSnapshot;
  healthCounts: HealthCounts;
  sparklineData: number[];
  defaultScope?: ProductWindowScope;
  activeWindowDays?: number;
  archiveWindowDays?: number;
  liveWindowHours?: number;
  activeMessageCount?: number;
  totalImportedMessageCount?: number;
  /** AI-classified channel type (optional, filled when classification exists) */
  channelType?: string | null;
  classificationConfidence?: number | null;
}

export interface ChannelDiagnostics {
  channelId: string;
  channelName: string;
  status: ChannelStatus;
  ingestReadiness: IngestReadiness;
  intelligenceReadiness: IntelligenceReadiness;
  latestSummaryCompleteness?: SummaryCompletenessStatus | null;
  hasActiveDegradations: boolean;
  currentSummaryArtifactId?: string | null;
  activeBackfillRunId?: string | null;
  summaryArtifact?: SummaryArtifact | null;
  backfillRun?: BackfillRun | null;
  degradationSignals: DegradationSignal[];
  messageTruthCounts: MessageTruthCounts;
  generatedAt: string;
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
  analysisEligibility?: AnalysisEligibility | null;
  analysisExecution?: AnalysisExecution | null;
  analysisQuality?: AnalysisQuality | null;
  suppressionReason?: AnalysisSuppressionReason | null;
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
