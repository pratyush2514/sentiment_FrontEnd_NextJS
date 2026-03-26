/**
 * Data transformation layer: maps backend response shapes to frontend types.
 * All functions are pure — no side effects, no fetch calls.
 */

import type {
  AttentionSummary,
  BackfillRun,
  ChannelCardData,
  ChannelDiagnostics,
  ChannelHealth,
  ChannelSignal,
  ChannelInsight,
  ChannelMeetingContext,
  ChannelRecentActivity,
  ChannelState,
  CrucialMessageSummary,
  CrucialMoment,
  MessageDispositionCounts,
  MessageTriage,
  SentimentSnapshot,
  HealthCounts,
  ChannelWindowStats,
  Participant,
  ActiveThread,
  ChannelThreadsData,
  KeyDecision,
  FlaggedMessage,
  ThreadMessage,
  ThreadConversationData,
  ThreadInsight,
  ThreadInsightSummary,
  TimelineDataPoint,
  Emotion,
  EscalationRisk,
  DegradationSignal,
  IngestReadiness,
  InteractionTone,
  IntelligenceReadiness,
  MessageTruthCounts,
  RiskDriver,
  SummaryArtifact,
  SummaryCoverage,
  SummaryCompletenessStatus,
  ProductWindowScope,
  UnifiedDriver,
} from "./types";
import type { AlertContext, DashboardAlert, WorkspaceOverview } from "./types/api";

// ─── Backend Response Shapes ────────────────────────────────────────────────

export interface BackendChannelItem {
  channelId: string;
  name: string | null;
  status: string;
  conversationType?: string;
  ingestReadiness?: string | null;
  intelligenceReadiness?: string | null;
  latestSummaryCompleteness?: string | null;
  hasActiveDegradations?: boolean;
  effectiveImportanceTier?: string;
  defaultScope?: string | null;
  activeWindowDays?: number | null;
  archiveWindowDays?: number | null;
  liveWindowHours?: number | null;
  activeMessageCount?: number | null;
  totalImportedMessageCount?: number | null;
  messageCount: number;
  initializedAt: string | null;
  lastActivity: string | null;
  updatedAt: string | null;
  sentimentSnapshot: Record<string, unknown>;
  runningSummary: string;
  health: ChannelHealth;
  signal: ChannelSignal;
  signalConfidence: number;
  signalEvidenceTier?: string | null;
  effectiveChannelMode?: string;
  riskDrivers: Array<{ key: string; label: string; message: string; severity: string; category: string }>;
  attentionSummary: { status: string; title: string; message: string; driverKeys: string[] };
  messageDispositionCounts: {
    totalInWindow: number;
    deepAiAnalyzed: number;
    heuristicIncidentSignals: number;
    contextOnly: number;
    routineAcknowledgments: number;
    storedWithoutDeepAnalysis: number;
    inFlight: number;
  };
  sparklineData?: number[];
  healthCounts: {
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
  };
}

export interface BackendChannelsResponse {
  total: number;
  channels: BackendChannelItem[];
}

interface BackendParticipant {
  userId: string;
  displayName: string;
  messageCount: number;
  profileImage?: string | null;
  sentimentTrend?: Participant["sentimentTrend"];
  escalationInvolvement?: number;
  role?: string;
  displayLabel?: string | null;
  dominantEmotion?: string | null;
  frustrationScore?: number;
}

interface BackendActiveThread {
  threadTs: string;
  replyCount: number;
  lastActivity: string;
  summary?: string | null;
  openQuestions?: string[];
  threadInsight?: BackendThreadInsightSummary | null;
}

interface BackendSummaryEvidenceRef {
  messageTs?: string | null;
  threadTs?: string | null;
  excerpt?: string | null;
}

interface BackendSummaryFact {
  kind?: string | null;
  text?: string | null;
  evidence?: BackendSummaryEvidenceRef[] | null;
}

interface BackendSummaryArtifact {
  id: string;
  summaryKind: string;
  generationMode: string;
  completenessStatus: string;
  summary: string;
  keyDecisions?: string[];
  summaryFacts?: BackendSummaryFact[];
  degradedReasons?: string[];
  coverageStartTs?: string | null;
  coverageEndTs?: string | null;
  candidateMessageCount?: number | null;
  includedMessageCount?: number | null;
  artifactVersion?: number | null;
  sourceRunId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BackendBackfillRun {
  id: string;
  status: string;
  currentPhase: string;
  pagesFetched?: number | null;
  messagesImported?: number | null;
  threadRootsDiscovered?: number | null;
  threadsAttempted?: number | null;
  threadsFailed?: number | null;
  usersResolved?: number | null;
  memberSyncResult?: string | null;
  summaryArtifactId?: string | null;
  degradedReasonCount?: number | null;
  lastError?: string | null;
  startedAt: string;
  completedAt?: string | null;
  updatedAt: string;
}

interface BackendDegradationSignal {
  id: string;
  scopeType: string;
  scopeKey?: string | null;
  messageTs?: string | null;
  threadTs?: string | null;
  summaryArtifactId?: string | null;
  backfillRunId?: string | null;
  degradationType: string;
  severity: string;
  details?: Record<string, unknown> | null;
  createdAt: string;
  resolvedAt?: string | null;
}

interface BackendMessageTruthCounts {
  total?: number;
  eligible?: number;
  pending?: number;
  processing?: number;
  completed?: number;
  failed?: number;
  suppressed?: number;
  partial?: number;
}

export interface BackendChannelState {
  channelId: string;
  channelName?: string;
  conversationType?: string;
  status: string;
  ingestReadiness?: string | null;
  intelligenceReadiness?: string | null;
  latestSummaryCompleteness?: string | null;
  hasActiveDegradations?: boolean;
  currentSummaryArtifactId?: string | null;
  activeBackfillRunId?: string | null;
  activeWindowSummary?: string | null;
  activeWindowSummaryUpdatedAt?: string | null;
  activeWindowSummaryCoverage?: {
    startTs?: string | null;
    endTs?: string | null;
  } | null;
  defaultScope?: string | null;
  activeWindowDays?: number | null;
  archiveWindowDays?: number | null;
  liveWindowHours?: number | null;
  activeMessageCount?: number | null;
  totalImportedMessageCount?: number | null;
  importanceTierOverride?: string;
  recommendedImportanceTier?: string;
  effectiveImportanceTier?: string;
  channelModeOverride?: string;
  recommendedChannelMode?: string;
  effectiveChannelMode?: string;
  initializedAt: string | null;
  updatedAt: string | null;
  lastEventAt: string | null;
  runningSummary: string;
  liveSummary?: string | null;
  liveSummaryUpdatedAt?: string | null;
  liveSummaryCoverage?: {
    startTs?: string | null;
    endTs?: string | null;
  } | null;
  keyDecisions: Array<
    | string
    | {
        text: string;
        ts?: string;
        messageTs?: string | null;
        threadTs?: string | null;
        detectedAt?: string | null;
        evidence?: BackendSummaryEvidenceRef[] | null;
      }
  >;
  sentimentSnapshot: Record<string, unknown>;
  health: ChannelHealth;
  signal: ChannelSignal;
  signalConfidence: number;
  signalEvidenceTier?: string | null;
  riskDrivers: Array<{ key: string; label: string; message: string; severity: string; category: string }>;
  recentActivity?: {
    label: string;
    windowHours: number;
    messageCount: number;
    activeThreads: number;
    openFollowUps: number;
    resolvedFollowUps: number;
  } | null;
  meetingContext?: {
    latestMeeting: {
      id: string;
      title: string;
      startedAt: string;
      source: string;
      confidence: string;
      meetingSentiment?: string | null;
      summary?: string | null;
      openObligations: number;
      overdueObligations: number;
      blockers: string[];
      decisions: string[];
      nextSteps: string[];
    };
  } | null;
  unifiedDrivers?: Array<{
    level: string;
    source: string;
    message: string;
  }>;
  attentionSummary: { status: string; title: string; message: string; driverKeys: string[] };
  messageDispositionCounts: {
    totalInWindow: number;
    deepAiAnalyzed: number;
    heuristicIncidentSignals: number;
    contextOnly: number;
    routineAcknowledgments: number;
    storedWithoutDeepAnalysis: number;
    inFlight: number;
  };
  relatedIncidents?: Array<{
    sourceChannelId?: string | null;
    sourceChannelName: string;
    kind: string;
    message?: string;
    detectedAt?: string | null;
    blocksLocalWork?: boolean;
    incidentFamily?: string | null;
  }>;
  threadInsights?: BackendThreadInsight[];
  summaryArtifact?: BackendSummaryArtifact | null;
  backfillRun?: BackendBackfillRun | null;
  degradationSignals?: BackendDegradationSignal[];
  healthCounts: {
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
  };
  windowStats?: {
    analysisWindowDays: number;
    messageCountInWindow: number;
    analyzedMessageCount: number;
    skippedMessageCount: number;
    contextOnlyMessageCount: number;
    ignoredMessageCount: number;
    inflightMessageCount: number;
  };
  participants: BackendParticipant[];
  activeThreads: BackendActiveThread[];
  messageCount: number;
}

interface BackendAnalysis {
  emotion: Emotion;
  confidence: number;
  escalationRisk: EscalationRisk;
  explanation: string | null;
  sarcasmDetected: boolean;
  interactionTone?: string | null;
  themes: string[];
  intendedEmotion?: Emotion;
  triggerPhrases?: string[];
  behavioralPattern?: string | null;
  summary?: string;
  threadSentiment?: string;
  sentimentTrajectory?: "improving" | "stable" | "deteriorating";
  llmProvider?: string;
  llmModel?: string;
  messageIntent?: string | null;
  isActionable?: boolean | null;
  isBlocking?: boolean;
  urgencyLevel?: string;
  triage?: BackendMessageTriage | null;
  threadInsights?: BackendThreadInsight[];
  threadInsight?: BackendThreadInsightSummary | null;
  crucialMessage?: BackendCrucialMessage | null;
  isCrucial?: boolean;
  crucialReason?: string | null;
}

interface BackendThreadInsight {
  label: string;
  value: string;
  type?: string;
  threadTs?: string | null;
  messageTs?: string | null;
}

interface BackendCrucialMoment {
  messageTs?: string;
  kind?: string;
  reason?: string;
  surfacePriority?: string;
}

interface BackendThreadInsightSummary {
  summary?: string | null;
  primaryIssue?: string | null;
  threadState?: string | null;
  surfacePriority?: string | null;
  operationalRisk?: string | null;
  emotionalTemperature?: string | null;
  openQuestions?: string[];
  crucialMoments?: BackendCrucialMoment[];
  lastMeaningfulChangeTs?: string | null;
  updatedAt?: string | null;
}

interface BackendMessageTriage {
  candidateKind?: string | null;
  signalType?: string | null;
  severity?: string | null;
  stateImpact?: string | null;
  evidenceType?: string | null;
  channelMode?: string | null;
  originType?: string | null;
  confidence?: number | null;
  incidentFamily?: string | null;
  surfacePriority?: string | null;
  reasonCodes?: string[] | null;
  stateTransition?: string | null;
  relatedIncident?: {
    sourceChannelId?: string | null;
    sourceChannelName: string;
    kind: string;
    message?: string;
    detectedAt?: string | null;
    blocksLocalWork?: boolean;
    incidentFamily?: string | null;
  } | null;
}

interface BackendCrucialMessage {
  messageTs?: string;
  summary?: string | null;
  reason?: string | null;
  userName?: string | null;
  threadTs?: string | null;
}

interface BackendMessage {
  ts: string;
  userId: string;
  displayName: string;
  text: string;
  threadTs?: string;
  source: string;
  analysisStatus: string;
  analysisEligibility?: string | null;
  analysisExecution?: string | null;
  analysisQuality?: string | null;
  suppressionReason?: string | null;
  createdAt: string | null;
  replyCount?: number;
  analysis: BackendAnalysis | null;
  files?: Array<{ name: string; title?: string; mimetype?: string; filetype?: string; size?: number; permalink?: string }>;
  links?: Array<{ url: string; domain: string; label?: string; linkType: string }>;
  followUp?: {
    itemId: string;
    seriousness: "low" | "medium" | "high";
    summary: string;
    dueAt?: string | null;
    repeatedAskCount: number;
  } | null;
  triage?: BackendMessageTriage | null;
  threadInsights?: BackendThreadInsight[];
  threadInsight?: BackendThreadInsightSummary | null;
  crucialMessage?: BackendCrucialMessage | null;
  isCrucial?: boolean;
  crucialReason?: string | null;
}

export interface BackendMessagesResponse {
  channelId: string;
  channelName?: string;
  total: number;
  returned: number;
  messages: BackendMessage[];
  threadTs?: string;
  sourceMessageTs?: string;
  threadInsights?: BackendThreadInsight[];
  threadInsight?: BackendThreadInsightSummary | null;
  crucialMessage?: BackendCrucialMessage | null;
  crucialMessages?: BackendMessage[];
}

export interface BackendLiveMessagesResponse {
  channelId: string;
  total: number;
  returned: number;
  messages: BackendMessage[];
}

export interface BackendChannelDiagnosticsResponse {
  channelId: string;
  channelName: string;
  status: string;
  ingestReadiness: string;
  intelligenceReadiness: string;
  latestSummaryCompleteness?: string | null;
  hasActiveDegradations: boolean;
  currentSummaryArtifactId?: string | null;
  activeBackfillRunId?: string | null;
  summaryArtifact?: BackendSummaryArtifact | null;
  backfillRun?: BackendBackfillRun | null;
  degradationSignals?: BackendDegradationSignal[];
  messageTruthCounts?: BackendMessageTruthCounts | null;
  generatedAt: string;
}

interface BackendSentimentBucket {
  bucket: string;
  total: number;
  emotions: Record<string, number>;
  avgConfidence: number;
  highRiskCount: number;
}

export interface BackendTimelineResponse {
  channelId: string;
  granularity: string;
  total: number;
  buckets: BackendSentimentBucket[];
}

interface BackendThreadItem {
  threadTs: string;
  replyCount: number;
  lastActivity: string;
  summary?: string | null;
  sentimentTrajectory?: "improving" | "stable" | "deteriorating" | null;
  openQuestions?: string[];
  insights?: BackendThreadInsight[];
  threadInsight?: BackendThreadInsightSummary | null;
  crucialMessageTs?: string | null;
  crucialMessageSummary?: string | null;
  crucialMessage?: BackendCrucialMessage | null;
  rootMessage: {
    ts: string;
    userId: string;
    displayName: string;
    text: string;
  } | null;
}

export interface BackendThreadsResponse {
  channelId: string;
  total: number;
  returned: number;
  threads: BackendThreadItem[];
  recentThreads?: BackendThreadItem[];
}

interface BackendAlertMetadata {
  emotion?: string;
  threadInsights?: BackendThreadInsight[];
  threadInsight?: BackendThreadInsightSummary | null;
  crucialMessage?: BackendCrucialMessage | null;
  threadState?: string;
  surfaceReason?: string;
  primaryIssue?: string;
  emotionalTemperature?: string;
  operationalRisk?: string;
  relatedMessageCount?: number;
  [key: string]: unknown;
}

export interface BackendDashboardAlert {
  id: string;
  kind: "follow_up" | "sentiment";
  followUpItemId?: string | null;
  channelId: string;
  channelName: string;
  conversationType?: string;
  severity: "low" | "medium" | "high";
  title: string;
  message: string;
  sourceMessageTs: string;
  threadTs?: string | null;
  actorName?: string | null;
  dueAt?: string | null;
  createdAt: string;
  contextHref?: string;
  metadata?: BackendAlertMetadata;
}

interface BackendAnalyticsItem {
  messageTs: string;
  messageText: string | null;
  threadTs: string | null;
  user: {
    userId: string | null;
    displayName: string | null;
  };
  dominantEmotion: Emotion;
  confidence: number;
  escalationRisk: EscalationRisk;
  sarcasmDetected: boolean | null;
  interactionTone?: string | null;
  explanation: string | null;
  themes: string[];
  llmProvider: string;
  llmModel: string;
  analyzedAt: string;
  authorFlaggedCount?: number;
}

export interface BackendChannelAnalyticsResponse {
  channelId: string;
  channelName?: string;
  total: number;
  returned: number;
  limit: number;
  offset: number;
  analytics: BackendAnalyticsItem[];
}

export interface BackendOverview {
  totalMessages: number;
  totalAnalyses: number;
  emotionDistribution: Record<string, number>;
  avgSentiment: number;
  highRiskCount: number;
  openFollowUpCount: number;
  highSeverityFollowUpCount: number;
  flaggedMessageCount: number;
  totalCostUsd: number;
  costTodayUsd: number;
  activeChannels: number;
  teamHealth: number;
}

// ─── Transform: Channels List ───────────────────────────────────────────────

function parseSentimentSnapshot(raw: Record<string, unknown>): SentimentSnapshot {
  const dist = (raw.emotionDistribution ?? raw.emotion_distribution ?? {}) as Record<string, number>;
  return {
    totalAnalyzed:
      (raw.totalAnalyzed as number) ??
      (raw.total_analyzed as number) ??
      (raw.totalMessages as number) ??
      (raw.total_messages as number) ??
      0,
    emotionDistribution: {
      anger: dist.anger ?? 0,
      joy: dist.joy ?? 0,
      sadness: dist.sadness ?? 0,
      neutral: dist.neutral ?? 0,
      fear: dist.fear ?? 0,
      surprise: dist.surprise ?? 0,
      disgust: dist.disgust ?? 0,
    },
    highRiskCount: (raw.highRiskCount as number) ?? (raw.high_risk_count as number) ?? 0,
  };
}

const DEFAULT_HEALTH_COUNTS: HealthCounts = {
  openAlertCount: 0,
  highSeverityAlertCount: 0,
  automationIncidentCount: 0,
  criticalAutomationIncidentCount: 0,
  automationIncident24hCount: 0,
  criticalAutomationIncident24hCount: 0,
  humanRiskSignalCount: 0,
  requestSignalCount: 0,
  decisionSignalCount: 0,
  resolutionSignalCount: 0,
  flaggedMessageCount: 0,
  highRiskMessageCount: 0,
  attentionThreadCount: 0,
  blockedThreadCount: 0,
  escalatedThreadCount: 0,
  riskyThreadCount: 0,
  totalMessageCount: 0,
  skippedMessageCount: 0,
  contextOnlyMessageCount: 0,
  ignoredMessageCount: 0,
  inflightMessageCount: 0,
};

function normalizeSignal(signal?: string | null): ChannelSignal | null {
  return signal === "stable" || signal === "elevated" || signal === "escalating"
    ? signal
    : null;
}

function normalizeHealth(health?: string | null): ChannelHealth | null {
  return health === "healthy" || health === "attention" || health === "at-risk"
    ? health
    : null;
}

function normalizeIngestReadiness(value?: string | null): IngestReadiness | null {
  switch (value) {
    case "not_started":
    case "hydrating":
    case "ready":
      return value;
    default:
      return null;
  }
}

function normalizeIntelligenceReadiness(
  value?: string | null,
): IntelligenceReadiness | null {
  switch (value) {
    case "missing":
    case "bootstrap":
    case "partial":
    case "ready":
    case "stale":
      return value;
    default:
      return null;
  }
}

function normalizeSummaryCompleteness(
  value?: string | null,
): SummaryCompletenessStatus | null {
  switch (value) {
    case "complete":
    case "partial":
    case "stale":
    case "no_recent_messages":
      return value;
    default:
      return null;
  }
}

function normalizeSummaryArtifactKind(
  value?: string | null,
): SummaryArtifact["summaryKind"] {
  switch (value) {
    case "channel_rollup":
    case "thread_rollup":
    case "backfill_rollup":
      return value;
    default:
      return "channel_rollup";
  }
}

function normalizeSummaryGenerationMode(
  value?: string | null,
): SummaryArtifact["generationMode"] {
  switch (value) {
    case "llm":
    case "fallback":
    case "reused_existing":
      return value;
    default:
      return "llm";
  }
}

function normalizeBackfillRunStatus(
  value?: string | null,
): BackfillRun["status"] {
  switch (value) {
    case "running":
    case "completed":
    case "completed_with_degradations":
    case "failed":
      return value;
    default:
      return "running";
  }
}

function normalizeBackfillRunPhase(
  value?: string | null,
): BackfillRun["currentPhase"] {
  switch (value) {
    case "history_import":
    case "thread_expansion":
    case "user_enrichment":
    case "member_sync":
    case "initial_intelligence":
    case "finalize":
      return value;
    default:
      return "history_import";
  }
}

function normalizeBackfillMemberSyncResult(
  value?: string | null,
): BackfillRun["memberSyncResult"] {
  switch (value) {
    case "not_started":
    case "running":
    case "succeeded":
    case "degraded":
    case "failed":
      return value;
    default:
      return "not_started";
  }
}

function normalizeDegradationScope(
  value?: string | null,
): DegradationSignal["scopeType"] {
  switch (value) {
    case "channel":
    case "message":
    case "thread":
    case "summary_artifact":
    case "backfill_run":
      return value;
    default:
      return "channel";
  }
}

function normalizeDegradationSeverity(
  value?: string | null,
): DegradationSignal["severity"] {
  switch (value) {
    case "info":
    case "warning":
    case "error":
      return value;
    default:
      return "warning";
  }
}

function normalizeAnalysisEligibilityValue(
  value?: string | null,
): ThreadMessage["analysisEligibility"] {
  switch (value) {
    case "eligible":
    case "not_candidate":
    case "policy_suppressed":
    case "privacy_suppressed":
      return value;
    default:
      return null;
  }
}

function normalizeAnalysisExecutionValue(
  value?: string | null,
): ThreadMessage["analysisExecution"] {
  switch (value) {
    case "not_run":
    case "pending":
    case "processing":
    case "completed":
    case "failed":
      return value;
    default:
      return null;
  }
}

function normalizeAnalysisQualityValue(
  value?: string | null,
): ThreadMessage["analysisQuality"] {
  switch (value) {
    case "none":
    case "fallback":
    case "partial":
    case "verified":
      return value;
    default:
      return null;
  }
}

function normalizeAnalysisSuppressionReasonValue(
  value?: string | null,
): ThreadMessage["suppressionReason"] {
  switch (value) {
    case "channel_not_ready":
    case "cooldown":
    case "importance_tier":
    case "privacy_skip":
    case "budget_exceeded":
    case "not_candidate":
      return value;
    default:
      return null;
  }
}

function assertCanonicalChannelContract(params: {
  signal?: string | null;
  health?: string | null;
  attentionSummary?: unknown;
  messageDispositionCounts?: unknown;
  riskDrivers?: unknown;
  source: string;
}): void {
  if (!normalizeSignal(params.signal)) {
    throw new Error(`Missing canonical channel signal in ${params.source}`);
  }
  if (!normalizeHealth(params.health)) {
    throw new Error(`Missing canonical channel health in ${params.source}`);
  }
  if (!params.attentionSummary || typeof params.attentionSummary !== "object") {
    throw new Error(`Missing attention summary in ${params.source}`);
  }
  if (
    !params.messageDispositionCounts ||
    typeof params.messageDispositionCounts !== "object"
  ) {
    throw new Error(`Missing message disposition counts in ${params.source}`);
  }
  if (!Array.isArray(params.riskDrivers)) {
    throw new Error(`Missing risk drivers in ${params.source}`);
  }
}

function normalizeImportanceTierOverride(
  value?: string | null,
): "auto" | "high_value" | "standard" | "low_value" {
  switch (value) {
    case "high_value":
    case "standard":
    case "low_value":
    case "auto":
      return value;
    default:
      return "auto";
  }
}

function normalizeImportanceTier(
  value?: string | null,
): "high_value" | "standard" | "low_value" {
  switch (value) {
    case "high_value":
    case "standard":
    case "low_value":
      return value;
    default:
      return "standard";
  }
}

function parseHealthCounts(raw?: BackendChannelItem["healthCounts"]): HealthCounts {
  if (!raw) return DEFAULT_HEALTH_COUNTS;
  return {
    openAlertCount: raw.openAlertCount ?? 0,
    highSeverityAlertCount: raw.highSeverityAlertCount ?? 0,
    automationIncidentCount: raw.automationIncidentCount ?? 0,
    criticalAutomationIncidentCount: raw.criticalAutomationIncidentCount ?? 0,
    automationIncident24hCount: raw.automationIncident24hCount ?? 0,
    criticalAutomationIncident24hCount: raw.criticalAutomationIncident24hCount ?? 0,
    humanRiskSignalCount: raw.humanRiskSignalCount ?? 0,
    requestSignalCount: raw.requestSignalCount ?? 0,
    decisionSignalCount: raw.decisionSignalCount ?? 0,
    resolutionSignalCount: raw.resolutionSignalCount ?? 0,
    flaggedMessageCount: raw.flaggedMessageCount ?? 0,
    highRiskMessageCount: raw.highRiskMessageCount ?? 0,
    attentionThreadCount: raw.attentionThreadCount ?? 0,
    blockedThreadCount: raw.blockedThreadCount ?? 0,
    escalatedThreadCount: raw.escalatedThreadCount ?? 0,
    riskyThreadCount: raw.riskyThreadCount ?? 0,
    totalMessageCount: raw.totalMessageCount ?? 0,
    skippedMessageCount: raw.skippedMessageCount ?? 0,
    contextOnlyMessageCount: raw.contextOnlyMessageCount ?? 0,
    ignoredMessageCount: raw.ignoredMessageCount ?? 0,
    inflightMessageCount: raw.inflightMessageCount ?? 0,
  };
}

function normalizeRiskDriverSeverity(
  value?: string | null,
): RiskDriver["severity"] {
  switch (value) {
    case "none":
    case "low":
    case "medium":
    case "high":
      return value;
    default:
      return "low";
  }
}

function normalizeRiskDriverCategory(
  value?: string | null,
): RiskDriver["category"] {
  switch (value) {
    case "human":
    case "operational":
    case "thread":
    case "alert":
    case "summary":
      return value;
    default:
      return "summary";
  }
}

function parseRiskDrivers(
  raw: BackendChannelItem["riskDrivers"] | BackendChannelState["riskDrivers"] | undefined,
): RiskDriver[] {
  return (raw ?? []).map((driver) => ({
    key: driver.key,
    label: driver.label,
    message: driver.message,
    severity: normalizeRiskDriverSeverity(driver.severity),
    category: normalizeRiskDriverCategory(driver.category),
  }));
}

function parseRecentActivity(
  raw?: BackendChannelState["recentActivity"],
): ChannelRecentActivity | null {
  if (!raw) {
    return null;
  }

  return {
    label: raw.label?.trim() || "Recent activity",
    windowHours: Math.max(1, raw.windowHours ?? 24),
    messageCount: Math.max(0, raw.messageCount ?? 0),
    activeThreads: Math.max(0, raw.activeThreads ?? 0),
    openFollowUps: Math.max(0, raw.openFollowUps ?? 0),
    resolvedFollowUps: Math.max(0, raw.resolvedFollowUps ?? 0),
  };
}

function parseMeetingContext(
  raw?: BackendChannelState["meetingContext"],
): ChannelMeetingContext | null {
  if (!raw?.latestMeeting) {
    return null;
  }

  const meetingSentiment =
    raw.latestMeeting.meetingSentiment === "positive" ||
    raw.latestMeeting.meetingSentiment === "neutral" ||
    raw.latestMeeting.meetingSentiment === "concerned" ||
    raw.latestMeeting.meetingSentiment === "tense"
      ? raw.latestMeeting.meetingSentiment
      : null;

  return {
    latestMeeting: {
      id: raw.latestMeeting.id,
      title: raw.latestMeeting.title?.trim() || "Untitled meeting",
      startedAt: raw.latestMeeting.startedAt,
      source:
        raw.latestMeeting.source === "shared_link" ||
        raw.latestMeeting.source === "webhook"
          ? raw.latestMeeting.source
          : "api",
      confidence: raw.latestMeeting.confidence === "medium" ? "medium" : "high",
      meetingSentiment,
      summary: raw.latestMeeting.summary?.trim() || null,
      openObligations: Math.max(0, raw.latestMeeting.openObligations ?? 0),
      overdueObligations: Math.max(0, raw.latestMeeting.overdueObligations ?? 0),
      blockers: Array.isArray(raw.latestMeeting.blockers)
        ? raw.latestMeeting.blockers.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        : [],
      decisions: Array.isArray(raw.latestMeeting.decisions)
        ? raw.latestMeeting.decisions.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        : [],
      nextSteps: Array.isArray(raw.latestMeeting.nextSteps)
        ? raw.latestMeeting.nextSteps.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        : [],
    },
  };
}

function parseUnifiedDrivers(
  raw?: BackendChannelState["unifiedDrivers"],
): UnifiedDriver[] {
  return (raw ?? [])
    .map((driver) => {
      const level =
        driver.level === "positive" ||
        driver.level === "warning" ||
        driver.level === "critical"
          ? driver.level
          : null;
      const source =
        driver.source === "slack" ||
        driver.source === "fathom" ||
        driver.source === "combined"
          ? driver.source
          : null;
      const message = driver.message?.trim() ?? "";

      if (!level || !source || !message) {
        return null;
      }

      return { level, source, message };
    })
    .filter((driver): driver is UnifiedDriver => Boolean(driver));
}

function parseAttentionSummary(
  raw: BackendChannelItem["attentionSummary"] | BackendChannelState["attentionSummary"] | undefined,
): AttentionSummary {
  const status =
    raw?.status === "clear" || raw?.status === "watch" || raw?.status === "action"
      ? raw.status
      : "clear";

  return {
    status,
    title: raw?.title ?? "Nothing needs attention",
    message: raw?.message ?? "Nothing needs attention in this channel right now.",
    driverKeys: raw?.driverKeys ?? [],
  };
}

function parseMessageDispositionCounts(
  raw: BackendChannelItem["messageDispositionCounts"] | BackendChannelState["messageDispositionCounts"] | undefined,
): MessageDispositionCounts {
  return {
    totalInWindow: Math.max(0, raw?.totalInWindow ?? 0),
    deepAiAnalyzed: Math.max(0, raw?.deepAiAnalyzed ?? 0),
    heuristicIncidentSignals: Math.max(0, raw?.heuristicIncidentSignals ?? 0),
    contextOnly: Math.max(0, raw?.contextOnly ?? 0),
    routineAcknowledgments: Math.max(0, raw?.routineAcknowledgments ?? 0),
    storedWithoutDeepAnalysis: Math.max(0, raw?.storedWithoutDeepAnalysis ?? 0),
    inFlight: Math.max(0, raw?.inFlight ?? 0),
  };
}

interface BackendChannelWindowMetadata {
  defaultScope?: string | null;
  activeWindowDays?: number | null;
  archiveWindowDays?: number | null;
  liveWindowHours?: number | null;
  activeMessageCount?: number | null;
  totalImportedMessageCount?: number | null;
  messageCount?: number | null;
}

interface ParsedChannelWindowMetadata {
  defaultScope: ProductWindowScope;
  activeWindowDays: number;
  archiveWindowDays: number;
  liveWindowHours: number;
  activeMessageCount: number;
  totalImportedMessageCount: number;
}

function normalizeProductWindowScope(
  value?: string | null,
): ProductWindowScope {
  switch (value) {
    case "active":
    case "archive":
    case "live":
      return value;
    default:
      return "active";
  }
}

function parseChannelWindowMetadata(
  raw: BackendChannelWindowMetadata,
  activeMessageCountFallback = 0,
): ParsedChannelWindowMetadata {
  const activeMessageCount = Math.max(
    0,
    raw.activeMessageCount ?? activeMessageCountFallback ?? 0,
  );
  const totalImportedMessageCount = Math.max(
    0,
    raw.totalImportedMessageCount ?? raw.messageCount ?? activeMessageCount,
  );

  return {
    defaultScope: normalizeProductWindowScope(raw.defaultScope),
    activeWindowDays: Math.max(1, raw.activeWindowDays ?? 7),
    archiveWindowDays: Math.max(1, raw.archiveWindowDays ?? 30),
    liveWindowHours: Math.max(1, raw.liveWindowHours ?? 24),
    activeMessageCount,
    totalImportedMessageCount,
  };
}

function parseWindowStats(raw?: BackendChannelState["windowStats"]): ChannelWindowStats | undefined {
  if (!raw) {
    return undefined;
  }

  return {
    analysisWindowDays: Math.max(1, raw.analysisWindowDays ?? 7),
    messageCountInWindow: Math.max(0, raw.messageCountInWindow ?? 0),
    analyzedMessageCount: Math.max(0, raw.analyzedMessageCount ?? 0),
    skippedMessageCount: Math.max(0, raw.skippedMessageCount ?? 0),
    contextOnlyMessageCount: Math.max(0, raw.contextOnlyMessageCount ?? 0),
    ignoredMessageCount: Math.max(0, raw.ignoredMessageCount ?? 0),
    inflightMessageCount: Math.max(0, raw.inflightMessageCount ?? 0),
  };
}

function parseSummaryCoverage(
  raw?: { startTs?: string | null; endTs?: string | null } | null,
): SummaryCoverage | null {
  if (!raw) {
    return null;
  }

  return {
    startTs: raw.startTs ?? null,
    endTs: raw.endTs ?? null,
  };
}

function normalizeSummaryFactKind(
  value: unknown,
): SummaryArtifact["summaryFacts"][number]["kind"] | null {
  switch (value) {
    case "topic":
    case "blocker":
    case "resolution":
    case "decision":
    case "primary_issue":
    case "open_question":
      return value;
    default:
      return null;
  }
}

function parseSummaryEvidenceRefs(
  raw?: BackendSummaryEvidenceRef[] | null,
): SummaryArtifact["summaryFacts"][number]["evidence"] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [];
  }

  const parsed: SummaryArtifact["summaryFacts"][number]["evidence"] = [];
  for (const item of raw) {
    const messageTs = item.messageTs?.trim();
    if (!messageTs) {
      continue;
    }

    parsed.push({
      messageTs,
      threadTs: item.threadTs ?? null,
      excerpt: item.excerpt ?? null,
    });
  }

  return parsed;
}

function parseSummaryFacts(
  raw?: BackendSummaryFact[] | null,
): SummaryArtifact["summaryFacts"] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [];
  }

  return raw
    .map((item) => {
      const kind = normalizeSummaryFactKind(item.kind);
      const text = item.text?.trim();
      const evidence = parseSummaryEvidenceRefs(item.evidence);
      if (!kind || !text || evidence.length === 0) {
        return null;
      }

      return {
        kind,
        text,
        evidence,
      };
    })
    .filter((item): item is SummaryArtifact["summaryFacts"][number] => Boolean(item));
}

function parseSummaryArtifact(raw?: BackendSummaryArtifact | null): SummaryArtifact | null {
  if (!raw) {
    return null;
  }

  return {
    id: raw.id,
    summaryKind: normalizeSummaryArtifactKind(raw.summaryKind),
    generationMode: normalizeSummaryGenerationMode(raw.generationMode),
    completenessStatus: normalizeSummaryCompleteness(raw.completenessStatus) ?? "partial",
    summary: raw.summary ?? "",
    keyDecisions: Array.isArray(raw.keyDecisions) ? raw.keyDecisions : [],
    summaryFacts: parseSummaryFacts(raw.summaryFacts),
    degradedReasons: Array.isArray(raw.degradedReasons) ? raw.degradedReasons : [],
    coverageStartTs: raw.coverageStartTs ?? null,
    coverageEndTs: raw.coverageEndTs ?? null,
    candidateMessageCount: Math.max(0, raw.candidateMessageCount ?? 0),
    includedMessageCount: Math.max(0, raw.includedMessageCount ?? 0),
    artifactVersion: Math.max(1, raw.artifactVersion ?? 1),
    sourceRunId: raw.sourceRunId ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function parseBackfillRun(raw?: BackendBackfillRun | null): BackfillRun | null {
  if (!raw) {
    return null;
  }

  return {
    id: raw.id,
    status: normalizeBackfillRunStatus(raw.status),
    currentPhase: normalizeBackfillRunPhase(raw.currentPhase),
    pagesFetched: Math.max(0, raw.pagesFetched ?? 0),
    messagesImported: Math.max(0, raw.messagesImported ?? 0),
    threadRootsDiscovered: Math.max(0, raw.threadRootsDiscovered ?? 0),
    threadsAttempted: Math.max(0, raw.threadsAttempted ?? 0),
    threadsFailed: Math.max(0, raw.threadsFailed ?? 0),
    usersResolved: Math.max(0, raw.usersResolved ?? 0),
    memberSyncResult: normalizeBackfillMemberSyncResult(raw.memberSyncResult),
    summaryArtifactId: raw.summaryArtifactId ?? null,
    degradedReasonCount: Math.max(0, raw.degradedReasonCount ?? 0),
    lastError: raw.lastError ?? null,
    startedAt: raw.startedAt,
    completedAt: raw.completedAt ?? null,
    updatedAt: raw.updatedAt,
  };
}

function parseDegradationSignals(
  raw?: BackendDegradationSignal[] | null,
): DegradationSignal[] {
  if (!raw || raw.length === 0) {
    return [];
  }

  return raw.map((signal) => ({
    id: signal.id,
    scopeType: normalizeDegradationScope(signal.scopeType),
    scopeKey: signal.scopeKey ?? null,
    messageTs: signal.messageTs ?? null,
    threadTs: signal.threadTs ?? null,
    summaryArtifactId: signal.summaryArtifactId ?? null,
    backfillRunId: signal.backfillRunId ?? null,
    degradationType: signal.degradationType,
    severity: normalizeDegradationSeverity(signal.severity),
    details: signal.details ?? {},
    createdAt: signal.createdAt,
    resolvedAt: signal.resolvedAt ?? null,
  }));
}

function parseMessageTruthCounts(
  raw?: BackendMessageTruthCounts | null,
): MessageTruthCounts {
  return {
    total: Math.max(0, raw?.total ?? 0),
    eligible: Math.max(0, raw?.eligible ?? 0),
    pending: Math.max(0, raw?.pending ?? 0),
    processing: Math.max(0, raw?.processing ?? 0),
    completed: Math.max(0, raw?.completed ?? 0),
    failed: Math.max(0, raw?.failed ?? 0),
    suppressed: Math.max(0, raw?.suppressed ?? 0),
    partial: Math.max(0, raw?.partial ?? 0),
  };
}

function normalizeThreadInsightType(type?: string | null): ThreadInsight["type"] {
  switch (type) {
    case "concern":
    case "tension":
    case "trend":
    case "actor":
    case "neutral":
    case "crucial":
      return type;
    default:
      return "neutral";
  }
}

function normalizeThreadInsights(raw?: BackendThreadInsight[] | null): ThreadInsight[] {
  if (!raw || raw.length === 0) {
    return [];
  }

  return raw
    .map((insight) => ({
      label: insight.label,
      value: insight.value,
      type: normalizeThreadInsightType(insight.type),
      threadTs: insight.threadTs ?? null,
      messageTs: insight.messageTs ?? null,
    }))
    .filter((insight) => Boolean(insight.label || insight.value));
}

function normalizeSurfacePriority(value?: string | null): MessageTriage["surfacePriority"] {
  switch (value) {
    case "none":
    case "low":
    case "medium":
    case "high":
      return value;
    default:
      return "none";
  }
}

function normalizeThreadState(value?: string | null): ThreadInsightSummary["threadState"] {
  switch (value) {
    case "monitoring":
    case "investigating":
    case "blocked":
    case "waiting_external":
    case "resolved":
    case "escalated":
      return value;
    default:
      return null;
  }
}

function normalizeEmotionalTemperature(
  value?: string | null,
): ThreadInsightSummary["emotionalTemperature"] {
  switch (value) {
    case "calm":
    case "watch":
    case "tense":
    case "escalated":
      return value;
    default:
      return null;
  }
}

function normalizeInteractionTone(value?: string | null): InteractionTone | null {
  switch (value) {
    case "collaborative":
    case "corrective":
    case "tense":
    case "confrontational":
    case "dismissive":
    case "neutral":
      return value;
    default:
      return null;
  }
}

function readBackendInteractionTone(
  source: { interactionTone?: string | null } | null | undefined,
): string | null {
  if (!source) return null;
  const raw = source as Record<string, unknown>;
  return (
    source.interactionTone ??
    (typeof raw.interaction_tone === "string" ? raw.interaction_tone : null) ??
    null
  );
}

function normalizeOperationalRisk(
  value?: string | null,
): ThreadInsightSummary["operationalRisk"] {
  switch (value) {
    case "none":
    case "low":
    case "medium":
    case "high":
      return value;
    default:
      return null;
  }
}

function humanizeEnum(value?: string | null): string {
  if (!value) return "";
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeMessageTriage(raw?: BackendMessageTriage | null): MessageTriage | null {
  if (!raw?.candidateKind) {
    return null;
  }

  return {
    candidateKind: raw.candidateKind as MessageTriage["candidateKind"],
    signalType: (raw.signalType ?? null) as MessageTriage["signalType"],
    severity: (raw.severity ?? null) as MessageTriage["severity"],
    stateImpact: (raw.stateImpact ?? null) as MessageTriage["stateImpact"],
    evidenceType: (raw.evidenceType ?? null) as MessageTriage["evidenceType"],
    channelMode: (raw.channelMode ?? null) as MessageTriage["channelMode"],
    originType: (raw.originType ?? null) as MessageTriage["originType"],
    confidence: raw.confidence ?? null,
    incidentFamily: (raw.incidentFamily ?? null) as MessageTriage["incidentFamily"],
    surfacePriority: normalizeSurfacePriority(raw.surfacePriority),
    reasonCodes: raw.reasonCodes ?? [],
    stateTransition: (raw.stateTransition ?? null) as MessageTriage["stateTransition"],
    relatedIncident:
      raw.relatedIncident?.kind === "referenced_external_incident" &&
      raw.relatedIncident.sourceChannelName
        ? {
            kind: "referenced_external_incident",
            sourceChannelId: raw.relatedIncident.sourceChannelId ?? null,
            sourceChannelName: raw.relatedIncident.sourceChannelName,
            message: raw.relatedIncident.message,
            detectedAt: raw.relatedIncident.detectedAt ?? null,
            blocksLocalWork: Boolean(raw.relatedIncident.blocksLocalWork),
            incidentFamily:
              (raw.relatedIncident.incidentFamily ?? null) as MessageTriage["incidentFamily"],
          }
        : null,
  };
}

function normalizeSignalEvidenceTier(
  value?: string | null,
): "signal" | "pattern" | "confirmed" | undefined {
  switch (value) {
    case "signal":
    case "pattern":
    case "confirmed":
      return value;
    default:
      return undefined;
  }
}

function parseRelatedIncidents(
  raw?: BackendChannelState["relatedIncidents"],
): ChannelState["relatedIncidents"] {
  return (raw ?? [])
    .filter(
      (incident) =>
        incident?.kind === "referenced_external_incident" &&
        typeof incident.sourceChannelName === "string" &&
        incident.sourceChannelName.trim().length > 0,
    )
    .map((incident) => ({
      kind: "referenced_external_incident" as const,
      sourceChannelId: incident.sourceChannelId ?? null,
      sourceChannelName: incident.sourceChannelName,
      message: incident.message,
      detectedAt: incident.detectedAt ?? null,
      blocksLocalWork: Boolean(incident.blocksLocalWork),
      incidentFamily:
        (incident.incidentFamily ?? null) as MessageTriage["incidentFamily"],
    }));
}

function normalizeThreadInsightSummary(
  raw?: BackendThreadInsightSummary | null,
  fallbackThreadTs?: string | null,
): ThreadInsightSummary | null {
  if (!raw) {
    return null;
  }

  const crucialMoments = (raw.crucialMoments ?? [])
    .filter((moment): moment is Required<Pick<BackendCrucialMoment, "messageTs">> & BackendCrucialMoment =>
      typeof moment.messageTs === "string" && moment.messageTs.length > 0,
    )
    .map((moment) => ({
      messageTs: moment.messageTs,
      kind: moment.kind ?? "turning_point",
      reason: moment.reason ?? (humanizeEnum(moment.kind) || "Crucial thread moment surfaced."),
      surfacePriority: normalizeSurfacePriority(moment.surfacePriority),
    }));

  const summary = raw.summary?.trim() ?? "";
  const primaryIssue = raw.primaryIssue?.trim() ?? null;
  const openQuestions = (raw.openQuestions ?? []).filter((question) => question.trim().length > 0);

  if (!summary && !primaryIssue && openQuestions.length === 0 && crucialMoments.length === 0) {
    return null;
  }

  return {
    summary,
    primaryIssue,
    threadState: normalizeThreadState(raw.threadState),
    surfacePriority: normalizeSurfacePriority(raw.surfacePriority),
    operationalRisk: normalizeOperationalRisk(raw.operationalRisk),
    emotionalTemperature: normalizeEmotionalTemperature(raw.emotionalTemperature),
    openQuestions,
    crucialMoments,
    lastMeaningfulChangeTs: raw.lastMeaningfulChangeTs ?? null,
    updatedAt: raw.updatedAt ?? null,
    threadTs: fallbackThreadTs ?? null,
  };
}

function isSurfacedThreadMoment(
  moment: Pick<CrucialMoment, "surfacePriority">,
): boolean {
  return moment.surfacePriority === "medium" || moment.surfacePriority === "high";
}

function isManagerRelevantThreadSummary(
  structured?: ThreadInsightSummary | null,
): boolean {
  if (!structured) {
    return false;
  }

  if (
    structured.surfacePriority === "medium" ||
    structured.surfacePriority === "high"
  ) {
    return true;
  }

  if (
    structured.operationalRisk === "medium" ||
    structured.operationalRisk === "high"
  ) {
    return true;
  }

  if (
    structured.threadState === "blocked" ||
    structured.threadState === "escalated"
  ) {
    return true;
  }

  return (
    structured.threadState === "waiting_external" &&
    structured.openQuestions.length > 0 &&
    structured.surfacePriority !== "none"
  );
}

function deriveThreadInsightType(
  threadState?: ThreadInsightSummary["threadState"],
  emotionalTemperature?: ThreadInsightSummary["emotionalTemperature"],
): ThreadInsight["type"] {
  if (threadState === "blocked" || threadState === "escalated") {
    return "concern";
  }
  if (threadState === "waiting_external" || emotionalTemperature === "tense") {
    return "tension";
  }
  if (threadState === "resolved") {
    return "trend";
  }
  return "neutral";
}

function deriveDisplayThreadInsights(
  structured?: ThreadInsightSummary | null,
): ThreadInsight[] {
  if (!structured) {
    return [];
  }

  const items: ThreadInsight[] = [];
  const baseType = deriveThreadInsightType(structured.threadState, structured.emotionalTemperature);
  const managerRelevant = isManagerRelevantThreadSummary(structured);

  if (structured.primaryIssue && (managerRelevant || structured.openQuestions.length > 0)) {
    items.push({
      label: "Primary issue",
      value: structured.primaryIssue,
      type: baseType,
      threadTs: structured.threadTs ?? null,
      messageTs: structured.lastMeaningfulChangeTs ?? null,
    });
  }

  if (managerRelevant && structured.threadState && structured.threadState !== "monitoring") {
    items.push({
      label: "Thread state",
      value: humanizeEnum(structured.threadState),
      type: baseType,
      threadTs: structured.threadTs ?? null,
      messageTs: structured.lastMeaningfulChangeTs ?? null,
    });
  }

  if (
    managerRelevant &&
    structured.emotionalTemperature &&
    structured.emotionalTemperature !== "calm"
  ) {
    items.push({
      label: "Temperature",
      value: humanizeEnum(structured.emotionalTemperature),
      type: structured.emotionalTemperature === "escalated" ? "tension" : "neutral",
      threadTs: structured.threadTs ?? null,
      messageTs: structured.lastMeaningfulChangeTs ?? null,
    });
  }

  if (structured.openQuestions[0]) {
    items.push({
      label: "Open question",
      value: structured.openQuestions[0],
      type: "neutral",
      threadTs: structured.threadTs ?? null,
      messageTs: structured.lastMeaningfulChangeTs ?? null,
    });
  }

  for (const moment of structured.crucialMoments.filter(isSurfacedThreadMoment).slice(0, 2)) {
    items.push({
      label: humanizeEnum(moment.kind) || "Crucial moment",
      value: moment.reason,
      type: "crucial",
      threadTs: structured.threadTs ?? null,
      messageTs: moment.messageTs,
    });
  }

  return items.filter((item, index, array) =>
    array.findIndex((candidate) =>
      candidate.label === item.label &&
      candidate.value === item.value &&
      candidate.messageTs === item.messageTs,
    ) === index,
  );
}

function normalizeCrucialMessage(raw?: BackendCrucialMessage | null): CrucialMessageSummary | null {
  if (!raw || !raw.messageTs) {
    return null;
  }

  return {
    messageTs: raw.messageTs,
    summary: raw.summary ?? null,
    reason: raw.reason ?? null,
    userName: raw.userName ?? null,
    threadTs: raw.threadTs ?? null,
  };
}

function deriveCrucialMessage(
  explicit: BackendCrucialMessage | null | undefined,
  structured?: ThreadInsightSummary | null,
): CrucialMessageSummary | null {
  const normalized = normalizeCrucialMessage(explicit);
  if (normalized) {
    return normalized;
  }

  const moment = structured?.crucialMoments.find(isSurfacedThreadMoment);
  if (!moment?.messageTs) {
    return null;
  }

  return {
    messageTs: moment.messageTs,
    summary: moment.reason || structured?.summary || null,
    reason: moment.reason || structured?.primaryIssue || structured?.summary || null,
    threadTs: structured?.threadTs ?? null,
  };
}

export function transformChannelsList(data: BackendChannelsResponse): ChannelCardData[] {
  return data.channels.map((ch) => {
    assertCanonicalChannelContract({
      signal: ch.signal,
      health: ch.health,
      attentionSummary: ch.attentionSummary,
      messageDispositionCounts: ch.messageDispositionCounts,
      riskDrivers: ch.riskDrivers,
      source: `channels.list:${ch.channelId}`,
    });
    const snapshot = parseSentimentSnapshot(ch.sentimentSnapshot);
    const healthCounts = parseHealthCounts(ch.healthCounts);
    const riskDrivers = parseRiskDrivers(ch.riskDrivers);
    const attentionSummary = parseAttentionSummary(ch.attentionSummary);
    const messageDispositionCounts = parseMessageDispositionCounts(ch.messageDispositionCounts);
    const windowMetadata = parseChannelWindowMetadata(ch, ch.activeMessageCount ?? ch.messageCount);
    const signal = normalizeSignal(ch.signal)!;
    return {
      id: ch.channelId,
      name: ch.name ?? ch.channelId,
      status: ch.status as ChannelCardData["status"],
      conversationType: (ch.conversationType as ChannelCardData["conversationType"]) ?? "public_channel",
      ingestReadiness: normalizeIngestReadiness(ch.ingestReadiness),
      intelligenceReadiness: normalizeIntelligenceReadiness(ch.intelligenceReadiness),
      latestSummaryCompleteness: normalizeSummaryCompleteness(ch.latestSummaryCompleteness),
      hasActiveDegradations: ch.hasActiveDegradations ?? false,
      health: normalizeHealth(ch.health)!,
      signal,
      signalConfidence: ch.signalConfidence ?? 0.5,
      signalEvidenceTier: normalizeSignalEvidenceTier(ch.signalEvidenceTier),
      effectiveChannelMode:
        ch.effectiveChannelMode === "automation" ||
        ch.effectiveChannelMode === "mixed" ||
        ch.effectiveChannelMode === "collaboration"
          ? ch.effectiveChannelMode
          : "collaboration",
      riskDrivers,
      attentionSummary,
      messageDispositionCounts,
      ...windowMetadata,
      messageCount: windowMetadata.totalImportedMessageCount,
      lastActivity: ch.lastActivity ?? ch.updatedAt ?? null,
      sentimentSnapshot: snapshot,
      healthCounts,
      sparklineData: Array.isArray(ch.sparklineData)
        ? ch.sparklineData.filter((point): point is number => typeof point === "number")
        : [],
    };
  });
}

// ─── Transform: Channel State ───────────────────────────────────────────────

function toChannelInsightType(
  severity: RiskDriver["severity"],
): ChannelInsight["type"] {
  switch (severity) {
    case "high":
      return "concern";
    case "medium":
      return "tension";
    default:
      return "neutral";
  }
}

function toChannelInsights(drivers: RiskDriver[]): ChannelInsight[] {
  return drivers.map((driver) => ({
    label: driver.label,
    value: driver.message,
    type: toChannelInsightType(driver.severity),
  }));
}

export function transformChannelState(data: BackendChannelState): ChannelState {
  assertCanonicalChannelContract({
    signal: data.signal,
    health: data.health,
    attentionSummary: data.attentionSummary,
    messageDispositionCounts: data.messageDispositionCounts,
    riskDrivers: data.riskDrivers,
    source: `channels.state:${data.channelId}`,
  });
  const snapshot = parseSentimentSnapshot(data.sentimentSnapshot);
  const healthCounts = parseHealthCounts(data.healthCounts);
  const windowStats = parseWindowStats(data.windowStats);
  const riskDrivers = parseRiskDrivers(data.riskDrivers);
  const recentActivity = parseRecentActivity(data.recentActivity);
  const meetingContext = parseMeetingContext(data.meetingContext);
  const unifiedDrivers = parseUnifiedDrivers(data.unifiedDrivers);
  const attentionSummary = parseAttentionSummary(data.attentionSummary);
  const messageDispositionCounts = parseMessageDispositionCounts(data.messageDispositionCounts);
  const relatedIncidents = parseRelatedIncidents(data.relatedIncidents);
  const summaryArtifact = parseSummaryArtifact(data.summaryArtifact);
  const backfillRun = parseBackfillRun(data.backfillRun);
  const degradationSignals = parseDegradationSignals(data.degradationSignals);
  const activeWindowSummaryCoverage =
    parseSummaryCoverage(data.activeWindowSummaryCoverage) ??
    (summaryArtifact
      ? {
          startTs: summaryArtifact.coverageStartTs ?? null,
          endTs: summaryArtifact.coverageEndTs ?? null,
        }
      : null);
  const activeWindowSummary =
    data.activeWindowSummary?.trim() ||
    data.runningSummary?.trim() ||
    "";
  const liveSummary = data.liveSummary?.trim() || null;
  const signal = normalizeSignal(data.signal)!;
  const health = normalizeHealth(data.health)!;
  const totalMsgCount = data.participants.reduce((sum, p) => sum + p.messageCount, 0) || 1;
  const windowMetadata = parseChannelWindowMetadata(
    data,
    windowStats?.messageCountInWindow ?? data.activeMessageCount ?? data.messageCount,
  );

  const participants: Participant[] = data.participants.map((p) => ({
    userId: p.userId,
    displayName: p.displayName,
    messageCount: p.messageCount,
    profileImage: p.profileImage ?? undefined,
    contributionPct: Math.round((p.messageCount / totalMsgCount) * 100),
    sentimentTrend: p.sentimentTrend ?? "insufficient",
    escalationInvolvement: p.escalationInvolvement ?? 0,
    role: (p.role as Participant["role"]) ?? "unknown",
    displayLabel: p.displayLabel ?? null,
    dominantEmotion: p.dominantEmotion ?? null,
    frustrationScore: p.frustrationScore ?? 0,
  }));

  const activeThreads: ActiveThread[] = data.activeThreads.map((t) => {
    const threadInsight = normalizeThreadInsightSummary(t.threadInsight, t.threadTs);
    const crucialMessage = deriveCrucialMessage(null, threadInsight);
    const threadInsights = deriveDisplayThreadInsights(threadInsight);

    return {
      threadTs: t.threadTs,
      summary: t.summary?.trim() || threadInsight?.summary || "Live thread activity",
      messageCount: t.replyCount,
      lastActivityAt: t.lastActivity,
      sentimentTrajectory: null,
      openQuestions: t.openQuestions ?? threadInsight?.openQuestions ?? [],
      insights: threadInsights,
      threadInsight,
      crucialMessageTs: crucialMessage?.messageTs ?? null,
      crucialMessageSummary:
        crucialMessage?.summary ?? crucialMessage?.reason ?? null,
      crucialMessage,
    };
  });

  const decisionFacts = summaryArtifact?.summaryFacts.filter(
    (fact) => fact.kind === "decision",
  ) ?? [];
  const keyDecisionSource: BackendChannelState["keyDecisions"] = data.keyDecisions.length > 0
    ? data.keyDecisions
    : decisionFacts.map((fact) => ({
        text: fact.text,
        messageTs: fact.evidence[0]?.messageTs ?? null,
        threadTs:
          fact.evidence.find((evidence) => evidence.threadTs)?.threadTs ?? null,
        ts:
          fact.evidence.find((evidence) => evidence.threadTs)?.threadTs ??
          undefined,
        detectedAt:
          fact.evidence[0]?.messageTs
            ? new Date(
                Number.parseFloat(fact.evidence[0].messageTs) * 1000,
              ).toISOString()
            : data.updatedAt ?? null,
        evidence: fact.evidence,
      }));
  const keyDecisions: KeyDecision[] = keyDecisionSource.map((kd) => {
    if (typeof kd === "string") {
      return {
        text: kd,
        detectedAt: data.updatedAt ?? null,
        confidence: 0.8,
        participantCount: 0,
      };
    }

    const evidence = parseSummaryEvidenceRefs(kd.evidence);
    const legacyTs = "ts" in kd ? kd.ts : undefined;

    return {
      text: kd.text,
      detectedAt:
        kd.detectedAt ??
        (kd.messageTs
          ? new Date(Number.parseFloat(kd.messageTs) * 1000).toISOString()
          : data.updatedAt ?? null),
      threadTs: kd.threadTs ?? legacyTs ?? null,
      messageTs: kd.messageTs ?? evidence[0]?.messageTs ?? null,
      evidence,
      confidence: 0.8,
      participantCount: 0,
    };
  });

  return {
    channelId: data.channelId,
    channelName: data.channelName,
    conversationType: (data.conversationType as ChannelState["conversationType"]) ?? "public_channel",
    status: data.status as ChannelState["status"],
    importanceTierOverride: normalizeImportanceTierOverride(data.importanceTierOverride),
    recommendedImportanceTier: normalizeImportanceTier(data.recommendedImportanceTier),
    effectiveImportanceTier: normalizeImportanceTier(data.effectiveImportanceTier),
    channelModeOverride:
      data.channelModeOverride === "automation" ||
      data.channelModeOverride === "mixed" ||
      data.channelModeOverride === "collaboration" ||
      data.channelModeOverride === "auto"
        ? data.channelModeOverride
        : "auto",
    recommendedChannelMode:
      data.recommendedChannelMode === "automation" ||
      data.recommendedChannelMode === "mixed" ||
      data.recommendedChannelMode === "collaboration"
        ? data.recommendedChannelMode
        : "collaboration",
    effectiveChannelMode:
      data.effectiveChannelMode === "automation" ||
      data.effectiveChannelMode === "mixed" ||
      data.effectiveChannelMode === "collaboration"
        ? data.effectiveChannelMode
        : "collaboration",
    initializedAt: data.initializedAt ?? null,
    ingestReadiness: normalizeIngestReadiness(data.ingestReadiness),
    intelligenceReadiness: normalizeIntelligenceReadiness(data.intelligenceReadiness),
    latestSummaryCompleteness: normalizeSummaryCompleteness(data.latestSummaryCompleteness),
    hasActiveDegradations: data.hasActiveDegradations ?? false,
    currentSummaryArtifactId: data.currentSummaryArtifactId ?? summaryArtifact?.id ?? null,
    activeBackfillRunId: data.activeBackfillRunId ?? backfillRun?.id ?? null,
    activeWindowSummary,
    activeWindowSummaryUpdatedAt:
      data.activeWindowSummaryUpdatedAt ??
      summaryArtifact?.updatedAt ??
      data.updatedAt ??
      null,
    activeWindowSummaryCoverage,
    liveSummary,
    liveSummaryUpdatedAt: data.liveSummaryUpdatedAt ?? null,
    liveSummaryCoverage: parseSummaryCoverage(data.liveSummaryCoverage),
    runningSummary: activeWindowSummary,
    summaryArtifact,
    backfillRun,
    degradationSignals,
    health,
    signal,
    signalConfidence: data.signalConfidence ?? 0.5,
    signalEvidenceTier: normalizeSignalEvidenceTier(data.signalEvidenceTier),
    insights: toChannelInsights(riskDrivers),
    riskDrivers,
    recentActivity,
    meetingContext,
    unifiedDrivers,
    attentionSummary,
    messageDispositionCounts,
    relatedIncidents,
    participants,
    activeThreads,
    keyDecisions,
    sentimentSnapshot: snapshot,
    healthCounts,
    windowStats,
    threadInsights:
      normalizeThreadInsights(data.threadInsights).length > 0
        ? normalizeThreadInsights(data.threadInsights)
        : activeThreads.flatMap((thread) => thread.insights ?? []),
    ...windowMetadata,
    messageCount: windowMetadata.totalImportedMessageCount,
    lastEventAt: data.lastEventAt ?? data.updatedAt ?? null,
  };
}

export function transformChannelDiagnostics(
  data: BackendChannelDiagnosticsResponse,
): ChannelDiagnostics {
  return {
    channelId: data.channelId,
    channelName: data.channelName,
    status: data.status as ChannelDiagnostics["status"],
    ingestReadiness: normalizeIngestReadiness(data.ingestReadiness) ?? "not_started",
    intelligenceReadiness:
      normalizeIntelligenceReadiness(data.intelligenceReadiness) ?? "missing",
    latestSummaryCompleteness: normalizeSummaryCompleteness(
      data.latestSummaryCompleteness,
    ),
    hasActiveDegradations: data.hasActiveDegradations ?? false,
    currentSummaryArtifactId: data.currentSummaryArtifactId ?? null,
    activeBackfillRunId: data.activeBackfillRunId ?? null,
    summaryArtifact: parseSummaryArtifact(data.summaryArtifact),
    backfillRun: parseBackfillRun(data.backfillRun),
    degradationSignals: parseDegradationSignals(data.degradationSignals),
    messageTruthCounts: parseMessageTruthCounts(data.messageTruthCounts),
    generatedAt: data.generatedAt,
  };
}

// ─── Transform: Messages (Flagged) ─────────────────────────────────────────

interface TransformMessagesOptions {
  channelId: string;
  page: number;
  perPage: number;
}

export function transformMessages(
  data: BackendChannelAnalyticsResponse,
  opts: TransformMessagesOptions,
): { data: FlaggedMessage[]; total: number; page: number; perPage: number; hasMore: boolean } {
  const flagged: FlaggedMessage[] = data.analytics
    .map((m) => ({
      id: `${data.channelId}-${m.messageTs}`,
      channelId: data.channelId,
      channelName: data.channelName ?? data.channelId,
      ts: m.messageTs,
      threadTs: m.threadTs ?? undefined,
      userId: m.user.userId ?? "unknown-user",
      userName: m.user.displayName ?? "Unknown user",
      authorFlaggedCount: m.authorFlaggedCount ?? 0,
      text: m.messageText ?? "",
      analysis: {
        messageTs: m.messageTs,
        dominantEmotion: m.dominantEmotion,
        confidence: m.confidence,
        escalationRisk: m.escalationRisk,
        sarcasmDetected: m.sarcasmDetected ?? false,
        interactionTone: normalizeInteractionTone(readBackendInteractionTone(m)) ?? undefined,
        themes: m.themes,
        explanation: m.explanation ?? "",
        llmProvider: m.llmProvider,
        llmModel: m.llmModel,
      },
      createdAt: m.analyzedAt,
    }));

  return {
    data: flagged,
    total: data.total,
    page: opts.page,
    perPage: opts.perPage,
    hasMore: data.offset + data.returned < data.total,
  };
}

// ─── Transform: Timeline ────────────────────────────────────────────────────

export function transformTimeline(data: BackendTimelineResponse): TimelineDataPoint[] {
  return [...data.buckets].reverse().map((b) => ({
    timestamp: b.bucket,
    joy: b.emotions.joy ?? 0,
    neutral: b.emotions.neutral ?? 0,
    anger: b.emotions.anger ?? 0,
    disgust: b.emotions.disgust ?? 0,
    sadness: b.emotions.sadness ?? 0,
    fear: b.emotions.fear ?? 0,
    surprise: b.emotions.surprise ?? 0,
    total: b.total ?? 0,
    highRiskCount: b.highRiskCount ?? 0,
    avgConfidence: b.avgConfidence ?? 0,
  }));
}

// ─── Transform: Overview ────────────────────────────────────────────────────

export function transformOverview(data: BackendOverview): WorkspaceOverview {
  return {
    activeChannels: data.activeChannels,
    avgSentiment: data.avgSentiment,
    alerts24h: data.highRiskCount,
    followUpsOpen: data.openFollowUpCount ?? 0,
    teamHealth: data.teamHealth,
    totalMessages24h: data.totalMessages,
  };
}

// ─── Transform: Thread Messages ─────────────────────────────────────────────

export function transformThreadMessages(data: BackendMessagesResponse): ThreadMessage[] {
  return data.messages.map((m) => {
    const structuredThreadInsight = normalizeThreadInsightSummary(
      m.threadInsight ?? m.analysis?.threadInsight,
      m.threadTs ?? data.threadTs ?? null,
    );
    const threadInsights = normalizeThreadInsights(
      m.threadInsights ?? m.analysis?.threadInsights ?? undefined,
    );

    return {
      id: `${data.channelId}-${m.ts}`,
      ts: m.ts,
      threadTs: m.threadTs,
      userId: m.userId,
      userName: m.displayName,
      text: m.text,
      files: m.files,
      links: m.links as ThreadMessage["links"],
      source: m.source as ThreadMessage["source"],
      createdAt: m.createdAt,
      analysisStatus: m.analysisStatus as ThreadMessage["analysisStatus"],
      analysisEligibility: normalizeAnalysisEligibilityValue(m.analysisEligibility),
      analysisExecution: normalizeAnalysisExecutionValue(m.analysisExecution),
      analysisQuality: normalizeAnalysisQualityValue(m.analysisQuality),
      suppressionReason: normalizeAnalysisSuppressionReasonValue(m.suppressionReason),
      emotion: m.analysis?.emotion,
      confidence: m.analysis?.confidence,
      escalationRisk: m.analysis?.escalationRisk,
      explanation: m.analysis?.explanation ?? undefined,
      sarcasmDetected: m.analysis?.sarcasmDetected,
      interactionTone: normalizeInteractionTone(readBackendInteractionTone(m.analysis)) ?? undefined,
      triggerPhrases: m.analysis?.triggerPhrases ?? undefined,
      behavioralPattern: m.analysis?.behavioralPattern ?? undefined,
      messageIntent: m.analysis?.messageIntent ?? undefined,
      isActionable: m.analysis?.isActionable ?? undefined,
      isBlocking: m.analysis?.isBlocking ?? undefined,
      urgencyLevel: m.analysis?.urgencyLevel ?? undefined,
      followUp: m.followUp ?? null,
      triage: normalizeMessageTriage(m.triage ?? m.analysis?.triage),
      isCrucial: m.isCrucial ?? m.analysis?.isCrucial ?? false,
      crucialReason: m.crucialReason ?? m.analysis?.crucialReason ?? m.analysis?.crucialMessage?.reason ?? null,
      threadInsights:
        threadInsights.length > 0
          ? threadInsights
          : deriveDisplayThreadInsights(structuredThreadInsight),
    };
  });
}

function summarizeThreadFallback(text?: string | null): string {
  const normalized = text?.trim();
  if (!normalized) {
    return "Recent thread activity";
  }

  return normalized.length > 220
    ? `${normalized.slice(0, 217).trimEnd()}...`
    : normalized;
}

export function transformThreadConversation(
  data: BackendMessagesResponse,
): ThreadConversationData {
  const messages = transformThreadMessages(data);
  const structuredThreadInsight = normalizeThreadInsightSummary(
    data.threadInsight,
    data.threadTs ?? null,
  );
  const threadInsights = normalizeThreadInsights(data.threadInsights);
  const derivedThreadInsights =
    threadInsights.length > 0
      ? threadInsights
      : deriveDisplayThreadInsights(structuredThreadInsight);
  const crucialMessage = deriveCrucialMessage(data.crucialMessage, structuredThreadInsight);
  const firstMessage = messages[0];
  const lastMessage = messages[messages.length - 1];
  const lastActivityAt =
    lastMessage?.createdAt ??
    (lastMessage?.ts
      ? new Date(Number.parseFloat(lastMessage.ts) * 1000).toISOString()
      : null);

  return {
    messages,
    thread: data.threadTs
      ? {
          threadTs: data.threadTs,
          summary:
            structuredThreadInsight?.summary ??
            summarizeThreadFallback(firstMessage?.text),
          messageCount: messages.length,
          lastActivityAt: lastActivityAt ?? new Date(0).toISOString(),
          sentimentTrajectory: null,
          openQuestions: structuredThreadInsight?.openQuestions ?? [],
          insights: derivedThreadInsights,
          threadInsight: structuredThreadInsight,
          crucialMessageTs: crucialMessage?.messageTs ?? null,
          crucialMessageSummary:
            crucialMessage?.summary ?? crucialMessage?.reason ?? null,
          crucialMessage,
        }
      : null,
    threadInsight: structuredThreadInsight,
    threadInsights: derivedThreadInsights,
    crucialMessage,
  };
}

export function transformLiveMessages(data: BackendLiveMessagesResponse): ThreadMessage[] {
  return data.messages.map((m) => {
    const structuredThreadInsight = normalizeThreadInsightSummary(
      m.threadInsight ?? m.analysis?.threadInsight,
      m.threadTs ?? null,
    );
    const threadInsights = normalizeThreadInsights(
      m.threadInsights ?? m.analysis?.threadInsights ?? undefined,
    );

    return {
      id: `${data.channelId}-${m.ts}`,
      ts: m.ts,
      threadTs: m.threadTs,
      userId: m.userId,
      userName: m.displayName,
      text: m.text,
      files: m.files,
      links: m.links as ThreadMessage["links"],
      createdAt: m.createdAt,
      analysisStatus: m.analysisStatus as ThreadMessage["analysisStatus"],
      analysisEligibility: normalizeAnalysisEligibilityValue(m.analysisEligibility),
      analysisExecution: normalizeAnalysisExecutionValue(m.analysisExecution),
      analysisQuality: normalizeAnalysisQualityValue(m.analysisQuality),
      suppressionReason: normalizeAnalysisSuppressionReasonValue(m.suppressionReason),
      emotion: m.analysis?.emotion,
      confidence: m.analysis?.confidence,
      escalationRisk: m.analysis?.escalationRisk,
      explanation: m.analysis?.explanation ?? undefined,
      sarcasmDetected: m.analysis?.sarcasmDetected,
      interactionTone: normalizeInteractionTone(readBackendInteractionTone(m.analysis)) ?? undefined,
      triggerPhrases: m.analysis?.triggerPhrases ?? undefined,
      behavioralPattern: m.analysis?.behavioralPattern ?? undefined,
      messageIntent: m.analysis?.messageIntent ?? undefined,
      isActionable: m.analysis?.isActionable ?? undefined,
      isBlocking: m.analysis?.isBlocking ?? undefined,
      urgencyLevel: m.analysis?.urgencyLevel ?? undefined,
      followUp: m.followUp ?? null,
      triage: normalizeMessageTriage(m.triage ?? m.analysis?.triage),
      isCrucial: m.isCrucial ?? m.analysis?.isCrucial ?? false,
      crucialReason: m.crucialReason ?? m.analysis?.crucialReason ?? m.analysis?.crucialMessage?.reason ?? null,
      threadInsights:
        threadInsights.length > 0
          ? threadInsights
          : deriveDisplayThreadInsights(structuredThreadInsight),
    };
  });
}

export function transformAlertContext(data: BackendMessagesResponse): AlertContext {
  const structuredThreadInsight = normalizeThreadInsightSummary(data.threadInsight, data.threadTs ?? null);
  const threadInsights = normalizeThreadInsights(data.threadInsights);
  const derivedThreadInsights =
    threadInsights.length > 0 ? threadInsights : deriveDisplayThreadInsights(structuredThreadInsight);
  const crucialMessage = deriveCrucialMessage(data.crucialMessage, structuredThreadInsight);
  const crucialMessages = (data.crucialMessages ?? []).map((message) => ({
    id: `${data.channelId}-${message.ts}`,
    ts: message.ts,
    threadTs: message.threadTs,
    userId: message.userId,
    userName: message.displayName,
    text: message.text,
    files: message.files,
    links: message.links as ThreadMessage["links"],
    createdAt: message.createdAt,
    analysisStatus: message.analysisStatus as ThreadMessage["analysisStatus"],
    analysisEligibility: normalizeAnalysisEligibilityValue(message.analysisEligibility),
    analysisExecution: normalizeAnalysisExecutionValue(message.analysisExecution),
    analysisQuality: normalizeAnalysisQualityValue(message.analysisQuality),
    suppressionReason: normalizeAnalysisSuppressionReasonValue(message.suppressionReason),
    emotion: message.analysis?.emotion,
    escalationRisk: message.analysis?.escalationRisk,
    isSource: message.ts === data.sourceMessageTs,
    triage: normalizeMessageTriage(message.triage ?? message.analysis?.triage),
    isCrucial: true,
    crucialReason:
      message.crucialReason ??
      message.analysis?.crucialReason ??
      crucialMessage?.reason ??
      null,
    threadInsights: normalizeThreadInsights(
      message.threadInsights ?? message.analysis?.threadInsights ?? undefined,
    ),
    crucialMessage: deriveCrucialMessage(message.crucialMessage, structuredThreadInsight),
  }));
  return {
    channelId: data.channelId,
    channelName: data.channelName ?? data.channelId,
    sourceMessageTs: data.sourceMessageTs ?? "",
    threadTs: data.threadTs ?? null,
    messages: transformThreadMessages(data).map((message) => ({
      ...message,
      isSource: message.ts === data.sourceMessageTs,
    })),
    threadInsight: structuredThreadInsight,
    threadInsights: derivedThreadInsights,
    crucialMessage,
    crucialMessages,
    contextHref: data.threadTs
      ? `/dashboard/channels/${data.channelId}/threads/${data.threadTs}?messageTs=${data.sourceMessageTs}#message-${data.sourceMessageTs?.replace(".", "-") ?? ""}`
      : `/dashboard/channels/${data.channelId}?conversation=1&messageTs=${data.sourceMessageTs ?? ""}`,
  };
}

function transformThreadItem(thread: BackendThreadItem): ActiveThread {
  const threadInsight = normalizeThreadInsightSummary(thread.threadInsight, thread.threadTs);
  const derivedInsights = thread.insights?.length
    ? normalizeThreadInsights(thread.insights)
    : deriveDisplayThreadInsights(threadInsight);
  const crucialMessage = deriveCrucialMessage(thread.crucialMessage, threadInsight);

  return {
    threadTs: thread.threadTs,
    summary:
      thread.summary?.trim() ||
      threadInsight?.summary ||
      thread.rootMessage?.text?.trim() ||
      "Recent thread activity",
    messageCount: thread.replyCount,
    lastActivityAt: thread.lastActivity,
    sentimentTrajectory: thread.sentimentTrajectory ?? null,
    openQuestions: thread.openQuestions ?? threadInsight?.openQuestions ?? [],
    insights: derivedInsights,
    threadInsight,
    crucialMessageTs:
      thread.crucialMessageTs ??
      crucialMessage?.messageTs ??
      null,
    crucialMessageSummary:
      thread.crucialMessageSummary ??
      crucialMessage?.summary ??
      crucialMessage?.reason ??
      null,
    crucialMessage,
  };
}

export function transformThreads(data: BackendThreadsResponse): ChannelThreadsData {
  return {
    surfacedThreads: data.threads.map(transformThreadItem),
    recentThreads: (data.recentThreads ?? []).map(transformThreadItem),
  };
}

export function transformAlerts(data: BackendDashboardAlert[]): DashboardAlert[] {
  return data.map((alert) => {
    const existingThreadInsights = normalizeThreadInsights(alert.metadata?.threadInsights);
    const structuredThreadInsight =
      normalizeThreadInsightSummary(alert.metadata?.threadInsight, alert.threadTs ?? null) ??
      normalizeThreadInsightSummary(
        alert.metadata?.threadState || alert.metadata?.primaryIssue || alert.metadata?.surfaceReason
          ? {
              summary: alert.message,
              primaryIssue:
                typeof alert.metadata?.primaryIssue === "string"
                  ? alert.metadata.primaryIssue
                  : typeof alert.metadata?.surfaceReason === "string"
                    ? alert.metadata.surfaceReason
                    : null,
              threadState:
                typeof alert.metadata?.threadState === "string" ? alert.metadata.threadState : null,
              emotionalTemperature:
                typeof alert.metadata?.emotionalTemperature === "string"
                  ? alert.metadata.emotionalTemperature
                  : null,
              operationalRisk:
                typeof alert.metadata?.operationalRisk === "string"
                  ? alert.metadata.operationalRisk
                  : null,
              surfacePriority: alert.severity,
              openQuestions: [],
              crucialMoments: alert.threadTs
                ? [
                    {
                      messageTs: alert.sourceMessageTs,
                      kind: "crucial_moment",
                      reason:
                        (typeof alert.metadata?.surfaceReason === "string" && alert.metadata.surfaceReason) ||
                        alert.message,
                      surfacePriority: alert.severity,
                    },
                  ]
                : [],
              lastMeaningfulChangeTs: alert.sourceMessageTs,
            }
          : null,
        alert.threadTs ?? null,
      );

    const derivedThreadInsights =
      existingThreadInsights.length > 0
        ? existingThreadInsights
        : deriveDisplayThreadInsights(structuredThreadInsight);
    const crucialMessage = deriveCrucialMessage(alert.metadata?.crucialMessage, structuredThreadInsight);

    return {
      ...alert,
      conversationType: (alert.conversationType as DashboardAlert["conversationType"]) ?? "public_channel",
      metadata: {
        ...(alert.metadata ?? {}),
        threadInsight: structuredThreadInsight,
        threadInsights: derivedThreadInsights,
        crucialMessage,
      },
    };
  });
}
