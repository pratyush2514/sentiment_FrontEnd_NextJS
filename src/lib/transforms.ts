/**
 * Data transformation layer: maps backend response shapes to frontend types.
 * All functions are pure — no side effects, no fetch calls.
 */

import type {
  AttentionSummary,
  ChannelCardData,
  ChannelHealth,
  ChannelSignal,
  ChannelInsight,
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
  InteractionTone,
  RiskDriver,
} from "./types";
import type { AlertContext, DashboardAlert, WorkspaceOverview } from "./types/api";

// ─── Backend Response Shapes ────────────────────────────────────────────────

export interface BackendChannelItem {
  channelId: string;
  name: string | null;
  status: string;
  conversationType?: string;
  effectiveImportanceTier?: string;
  messageCount: number;
  initializedAt: string | null;
  lastActivity: string | null;
  updatedAt: string | null;
  sentimentSnapshot: Record<string, unknown>;
  runningSummary: string;
  health: ChannelHealth;
  signal: ChannelSignal;
  signalConfidence: number;
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

export interface BackendChannelState {
  channelId: string;
  channelName?: string;
  conversationType?: string;
  status: string;
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
  keyDecisions: (string | { text: string; ts?: string; detectedAt?: string })[];
  sentimentSnapshot: Record<string, unknown>;
  health: ChannelHealth;
  signal: ChannelSignal;
  signalConfidence: number;
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
    const signal = normalizeSignal(ch.signal)!;
    return {
      id: ch.channelId,
      name: ch.name ?? ch.channelId,
      status: ch.status as ChannelCardData["status"],
      conversationType: (ch.conversationType as ChannelCardData["conversationType"]) ?? "public_channel",
      health: normalizeHealth(ch.health)!,
      signal,
      signalConfidence: ch.signalConfidence ?? 0.5,
      effectiveChannelMode:
        ch.effectiveChannelMode === "automation" ||
        ch.effectiveChannelMode === "mixed" ||
        ch.effectiveChannelMode === "collaboration"
          ? ch.effectiveChannelMode
          : "collaboration",
      riskDrivers,
      attentionSummary,
      messageDispositionCounts,
      messageCount: ch.messageCount,
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
  const attentionSummary = parseAttentionSummary(data.attentionSummary);
  const messageDispositionCounts = parseMessageDispositionCounts(data.messageDispositionCounts);
  const relatedIncidents = parseRelatedIncidents(data.relatedIncidents);
  const signal = normalizeSignal(data.signal)!;
  const health = normalizeHealth(data.health)!;
  const totalMsgCount = data.participants.reduce((sum, p) => sum + p.messageCount, 0) || 1;

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

  const keyDecisions: KeyDecision[] = data.keyDecisions.map((kd) => {
    if (typeof kd === "string") {
      return {
        text: kd,
        detectedAt: data.updatedAt ?? null,
        confidence: 0.8,
        participantCount: 0,
      };
    }
    return {
      text: kd.text,
      detectedAt: kd.detectedAt ?? data.updatedAt ?? null,
      threadTs: kd.ts,
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
    runningSummary: data.runningSummary,
    health,
    signal,
    signalConfidence: data.signalConfidence ?? 0.5,
    insights: toChannelInsights(riskDrivers),
    riskDrivers,
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
    messageCount: data.messageCount,
    lastEventAt: data.lastEventAt ?? data.updatedAt ?? null,
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
