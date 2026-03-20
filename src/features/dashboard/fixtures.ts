import type {
  ActiveThread,
  AttentionSummary,
  ChannelCardData,
  ChannelState,
  DashboardAlert,
  HealthCounts,
  MessageDispositionCounts,
  RiskDriver,
  ThreadMessage,
  TimelineDataPoint,
  WorkspaceOverview,
} from "@/lib/types";

import type {
  DashboardTrendRangeOption,
} from "./types";

export interface DashboardOverviewFixture {
  overview: WorkspaceOverview;
  channels: ChannelCardData[];
  alerts: DashboardAlert[];
  trends: {
    timestamp: string;
    positive: number;
    neutral: number;
    negative: number;
    highRisk: number;
    total: number;
  }[];
}

export interface ChannelDetailFixture {
  channel: ChannelCardData;
  state: ChannelState;
  timeline: TimelineDataPoint[];
  threads: ActiveThread[];
  alerts: DashboardAlert[];
}

export interface ThreadDetailFixture {
  channel: ChannelCardData;
  state: ChannelState;
  thread: ActiveThread;
  messages: ThreadMessage[];
}

export interface LandingDashboardAlignmentFixture {
  title: string;
  subtitle: string;
  overview: WorkspaceOverview;
  channels: ChannelCardData[];
  alerts: DashboardAlert[];
}

export interface FollowUpActionFixture {
  id: string;
  channelId: string;
  channelName: string;
  conversationType: ChannelCardData["conversationType"];
  summary: string;
  actionHint: string;
  dueAt: string | null;
}

export const dashboardTrendRangeOptions = [
  { label: "7d", value: 7 },
  { label: "14d", value: 14 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
] as const satisfies readonly DashboardTrendRangeOption[];

function buildHealthCounts(overrides: Partial<HealthCounts>): HealthCounts {
  return {
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
    ...overrides,
  };
}

function buildMessageDispositionCounts(
  healthCounts: HealthCounts,
  deepAiAnalyzed: number,
): MessageDispositionCounts {
  const heuristicIncidentSignals = Math.max(
    0,
    Math.min(
      healthCounts.humanRiskSignalCount,
      healthCounts.totalMessageCount - deepAiAnalyzed,
    ),
  );

  return {
    totalInWindow: healthCounts.totalMessageCount,
    deepAiAnalyzed,
    heuristicIncidentSignals,
    contextOnly: healthCounts.contextOnlyMessageCount,
    routineAcknowledgments: healthCounts.ignoredMessageCount,
    storedWithoutDeepAnalysis:
      healthCounts.contextOnlyMessageCount +
      healthCounts.ignoredMessageCount +
      heuristicIncidentSignals,
    inFlight: healthCounts.inflightMessageCount,
  };
}

const clientBetaHealthCounts = buildHealthCounts({
  openAlertCount: 3,
  highSeverityAlertCount: 1,
  automationIncidentCount: 1,
  criticalAutomationIncidentCount: 0,
  automationIncident24hCount: 1,
  criticalAutomationIncident24hCount: 0,
  humanRiskSignalCount: 7,
  requestSignalCount: 6,
  decisionSignalCount: 2,
  resolutionSignalCount: 1,
  flaggedMessageCount: 7,
  highRiskMessageCount: 2,
  attentionThreadCount: 3,
  blockedThreadCount: 1,
  escalatedThreadCount: 1,
  riskyThreadCount: 2,
  totalMessageCount: 87,
  skippedMessageCount: 24,
  contextOnlyMessageCount: 16,
  ignoredMessageCount: 8,
  inflightMessageCount: 0,
});

const clientBetaRiskDrivers: RiskDriver[] = [
  {
    key: "follow-up-pressure",
    label: "Open follow-up pressure",
    message: "Three unresolved alerts are still waiting on a response in client-beta.",
    severity: "high",
    category: "alert",
  },
  {
    key: "delivery-thread",
    label: "Delivery timeline thread",
    message: "A blocked delivery thread is still carrying the most recent escalation risk.",
    severity: "high",
    category: "thread",
  },
];

const clientBetaAttentionSummary: AttentionSummary = {
  status: "action",
  title: "Immediate attention needed",
  message: "Client-facing pressure is active and the delivery thread still needs a human owner.",
  driverKeys: clientBetaRiskDrivers.map((driver) => driver.key),
};

const projectAlphaHealthCounts = buildHealthCounts({
  openAlertCount: 1,
  highSeverityAlertCount: 0,
  automationIncidentCount: 0,
  criticalAutomationIncidentCount: 0,
  automationIncident24hCount: 0,
  criticalAutomationIncident24hCount: 0,
  humanRiskSignalCount: 2,
  requestSignalCount: 2,
  decisionSignalCount: 1,
  resolutionSignalCount: 0,
  flaggedMessageCount: 2,
  highRiskMessageCount: 1,
  attentionThreadCount: 1,
  blockedThreadCount: 0,
  escalatedThreadCount: 0,
  riskyThreadCount: 1,
  totalMessageCount: 61,
  skippedMessageCount: 19,
  contextOnlyMessageCount: 12,
  ignoredMessageCount: 7,
  inflightMessageCount: 1,
});

const projectAlphaRiskDrivers: RiskDriver[] = [
  {
    key: "scope-watch",
    label: "Scope thread is heating up",
    message: "Recent replies are still circling scope, ownership, and timing.",
    severity: "medium",
    category: "thread",
  },
];

const projectAlphaAttentionSummary: AttentionSummary = {
  status: "watch",
  title: "Watch this channel",
  message: "project-alpha has one active alert and a recent thread worth monitoring.",
  driverKeys: projectAlphaRiskDrivers.map((driver) => driver.key),
};

export const landingDashboardAlignmentFixture: LandingDashboardAlignmentFixture = {
  title: "See what Slack conversations really mean.",
  subtitle:
    "PulseBoard monitors Slack channels and surfaces emotional dynamics, escalation risk, and follow-up work in one view.",
  overview: {
    activeChannels: 12,
    avgSentiment: 0.64,
    alerts24h: 3,
    followUpsOpen: 9,
    teamHealth: 84,
    totalMessages24h: 512,
  },
  channels: [],
  alerts: [],
};

export const dashboardOverviewFixture: DashboardOverviewFixture = {
  overview: {
    activeChannels: 5,
    avgSentiment: 0.71,
    alerts24h: 4,
    followUpsOpen: 6,
    teamHealth: 79,
    totalMessages24h: 184,
  },
  channels: [
    {
      id: "client-beta",
      name: "client-beta",
      status: "ready",
      conversationType: "private_channel",
      health: "at-risk",
      signal: "escalating",
      signalConfidence: 0.88,
      effectiveChannelMode: "collaboration",
      riskDrivers: clientBetaRiskDrivers,
      attentionSummary: clientBetaAttentionSummary,
      messageDispositionCounts: buildMessageDispositionCounts(
        clientBetaHealthCounts,
        87,
      ),
      messageCount: 291,
      lastActivity: "2026-03-18T08:46:00.000Z",
      sentimentSnapshot: {
        totalAnalyzed: 87,
        emotionDistribution: {
          anger: 12,
          joy: 21,
          sadness: 9,
          neutral: 28,
          fear: 7,
          surprise: 4,
          disgust: 6,
        },
        highRiskCount: 5,
      },
      healthCounts: clientBetaHealthCounts,
      sparklineData: [28, 26, 24, 20, 19, 16, 12],
    },
    {
      id: "project-alpha",
      name: "project-alpha",
      status: "ready",
      conversationType: "public_channel",
      health: "attention",
      signal: "elevated",
      signalConfidence: 0.74,
      effectiveChannelMode: "collaboration",
      riskDrivers: projectAlphaRiskDrivers,
      attentionSummary: projectAlphaAttentionSummary,
      messageDispositionCounts: buildMessageDispositionCounts(
        projectAlphaHealthCounts,
        61,
      ),
      messageCount: 180,
      lastActivity: "2026-03-18T08:15:00.000Z",
      sentimentSnapshot: {
        totalAnalyzed: 61,
        emotionDistribution: {
          anger: 5,
          joy: 24,
          sadness: 6,
          neutral: 19,
          fear: 2,
          surprise: 2,
          disgust: 3,
        },
        highRiskCount: 2,
      },
      healthCounts: projectAlphaHealthCounts,
      sparklineData: [18, 19, 21, 23, 22, 24, 25],
    },
  ],
  alerts: [
    {
      id: "alert-1",
      kind: "follow_up",
      followUpItemId: "fu-1",
      channelId: "client-beta",
      channelName: "client-beta",
      conversationType: "private_channel",
      severity: "high",
      title: "Waiting on reply",
      message: "The client is still waiting on a response to the delivery timeline question.",
      sourceMessageTs: "1710751600.000000",
      threadTs: "1710751600.000000",
      actorName: "Sarah K.",
      dueAt: "2026-03-18T06:00:00.000Z",
      createdAt: "2026-03-18T08:32:00.000Z",
      contextHref: "/dashboard/channels/client-beta/threads/1710751600.000000",
      metadata: {
        threadInsights: [
          {
            label: "Crucial thread",
            value: "Delivery timeline needs an explicit owner before the next update.",
            type: "crucial",
            threadTs: "1710751600.000000",
            messageTs: "1710751600.000000",
          },
        ],
        crucialMessage: {
          messageTs: "1710751600.000000",
          summary: "The client is waiting on a firm delivery timeline.",
          reason: "Repeated asks and a blocking deadline make this the message to surface first.",
          userName: "Sarah K.",
          threadTs: "1710751600.000000",
        },
      },
    },
    {
      id: "alert-2",
      kind: "sentiment",
      channelId: "project-alpha",
      channelName: "project-alpha",
      conversationType: "public_channel",
      severity: "medium",
      title: "Tone drifting negative",
      message: "The latest thread shows more pushback around scope and timing.",
      sourceMessageTs: "1710751700.000000",
      threadTs: "1710751700.000000",
      actorName: "Alice",
      createdAt: "2026-03-18T08:10:00.000Z",
      contextHref: "/dashboard/channels/project-alpha",
      metadata: {
        threadInsights: [
          {
            label: "Scope tension",
            value: "The latest thread is still circling ownership and timeline clarity.",
            type: "tension",
            threadTs: "1710751700.000000",
            messageTs: "1710751700.000000",
          },
        ],
      },
    },
  ],
  trends: [
    { timestamp: "2026-03-12T00:00:00.000Z", positive: 0.62, neutral: 0.26, negative: 0.12, highRisk: 1, total: 42 },
    { timestamp: "2026-03-13T00:00:00.000Z", positive: 0.59, neutral: 0.28, negative: 0.13, highRisk: 1, total: 44 },
    { timestamp: "2026-03-14T00:00:00.000Z", positive: 0.57, neutral: 0.29, negative: 0.14, highRisk: 1, total: 39 },
    { timestamp: "2026-03-15T00:00:00.000Z", positive: 0.54, neutral: 0.30, negative: 0.16, highRisk: 2, total: 41 },
    { timestamp: "2026-03-16T00:00:00.000Z", positive: 0.48, neutral: 0.31, negative: 0.21, highRisk: 2, total: 45 },
    { timestamp: "2026-03-17T00:00:00.000Z", positive: 0.44, neutral: 0.31, negative: 0.25, highRisk: 3, total: 47 },
    { timestamp: "2026-03-18T00:00:00.000Z", positive: 0.41, neutral: 0.30, negative: 0.29, highRisk: 4, total: 49 },
  ],
};

export const dashboardLandingAlignmentPreviewFixture: LandingDashboardAlignmentFixture = {
  title: landingDashboardAlignmentFixture.title,
  subtitle: landingDashboardAlignmentFixture.subtitle,
  overview: landingDashboardAlignmentFixture.overview,
  channels: dashboardOverviewFixture.channels,
  alerts: dashboardOverviewFixture.alerts,
};

export const dashboardChannelDetailFixture: ChannelDetailFixture = {
  channel: dashboardOverviewFixture.channels[0],
  state: {
    channelId: "client-beta",
    channelName: "client-beta",
    conversationType: "private_channel",
    status: "ready",
    importanceTierOverride: "auto",
    recommendedImportanceTier: "high_value",
    effectiveImportanceTier: "high_value",
    channelModeOverride: "auto",
    recommendedChannelMode: "collaboration",
    effectiveChannelMode: "collaboration",
    initializedAt: "2026-03-01T10:00:00.000Z",
    runningSummary:
      "Team discussed scope timing, the client wants a firmer delivery plan, and Bob is coordinating the next update.",
    health: "at-risk",
    signal: "escalating",
    signalConfidence: 0.88,
    insights: [
      {
        label: "Unresolved high-severity alerts",
        value: "1 high-severity alert requires immediate attention",
        type: "concern",
      },
      {
        label: "Open follow-up alerts",
        value: "3 unresolved alerts still need action",
        type: "tension",
      },
    ],
    riskDrivers: clientBetaRiskDrivers,
    attentionSummary: clientBetaAttentionSummary,
    messageDispositionCounts: buildMessageDispositionCounts(
      clientBetaHealthCounts,
      87,
    ),
    threadInsights: [
      {
        label: "Crucial thread",
        value: "The delivery-date thread is the one most likely to affect the client relationship.",
        type: "crucial",
        threadTs: "1710751600.000000",
        messageTs: "1710751600.000000",
      },
    ],
    participants: [
      {
        userId: "u-1",
        displayName: "Sarah K.",
        messageCount: 27,
        contributionPct: 37,
        sentimentTrend: "declining",
        escalationInvolvement: 4,
        role: "client",
        dominantEmotion: "anger",
        frustrationScore: 0.81,
      },
      {
        userId: "u-2",
        displayName: "Bob",
        messageCount: 21,
        contributionPct: 29,
        sentimentTrend: "stable",
        escalationInvolvement: 1,
        role: "worker",
        dominantEmotion: "neutral",
        frustrationScore: 0.23,
      },
      {
        userId: "u-3",
        displayName: "Alice",
        messageCount: 24,
        contributionPct: 34,
        sentimentTrend: "stable",
        escalationInvolvement: 0,
        role: "senior",
        dominantEmotion: "joy",
        frustrationScore: 0.14,
      },
    ],
    activeThreads: [
      {
        threadTs: "1710751600.000000",
        summary: "Delivery date needs a stronger commitment and owner.",
        messageCount: 7,
        lastActivityAt: "2026-03-18T08:32:00.000Z",
        sentimentTrajectory: "deteriorating",
        openQuestions: ["Can the updated timeline be confirmed today?"],
      },
      {
        threadTs: "1710748200.000000",
        summary: "Scope handoff and review comments remain open.",
        messageCount: 4,
        lastActivityAt: "2026-03-17T17:22:00.000Z",
        sentimentTrajectory: "stable",
        openQuestions: ["Who owns the final review pass?"],
      },
    ],
    keyDecisions: [
      {
        text: "Alice will send a revised timeline before the end of day.",
        detectedAt: "2026-03-18T08:20:00.000Z",
        confidence: 0.91,
        participantCount: 3,
      },
      {
        text: "Bob owns the follow-up on scope change impacts.",
        detectedAt: "2026-03-17T16:45:00.000Z",
        confidence: 0.85,
        participantCount: 2,
      },
    ],
    sentimentSnapshot: {
      totalAnalyzed: 87,
      emotionDistribution: {
        anger: 12,
        joy: 21,
        sadness: 9,
        neutral: 28,
        fear: 7,
        surprise: 4,
        disgust: 6,
      },
      highRiskCount: 5,
    },
    healthCounts: clientBetaHealthCounts,
    messageCount: 72,
    lastEventAt: "2026-03-18T08:46:00.000Z",
  },
  timeline: [
    { timestamp: "2026-03-12T00:00:00.000Z", joy: 15, neutral: 19, anger: 6, disgust: 2, sadness: 3, fear: 1, surprise: 2, total: 48, highRiskCount: 1, avgConfidence: 0.84 },
    { timestamp: "2026-03-13T00:00:00.000Z", joy: 13, neutral: 20, anger: 5, disgust: 3, sadness: 4, fear: 1, surprise: 2, total: 48, highRiskCount: 1, avgConfidence: 0.83 },
    { timestamp: "2026-03-14T00:00:00.000Z", joy: 12, neutral: 18, anger: 7, disgust: 3, sadness: 5, fear: 2, surprise: 1, total: 48, highRiskCount: 2, avgConfidence: 0.81 },
    { timestamp: "2026-03-15T00:00:00.000Z", joy: 10, neutral: 17, anger: 8, disgust: 4, sadness: 6, fear: 2, surprise: 1, total: 48, highRiskCount: 2, avgConfidence: 0.79 },
    { timestamp: "2026-03-16T00:00:00.000Z", joy: 9, neutral: 16, anger: 9, disgust: 4, sadness: 7, fear: 2, surprise: 1, total: 48, highRiskCount: 3, avgConfidence: 0.78 },
    { timestamp: "2026-03-17T00:00:00.000Z", joy: 8, neutral: 15, anger: 10, disgust: 5, sadness: 8, fear: 2, surprise: 0, total: 48, highRiskCount: 4, avgConfidence: 0.76 },
    { timestamp: "2026-03-18T00:00:00.000Z", joy: 7, neutral: 14, anger: 11, disgust: 5, sadness: 9, fear: 2, surprise: 0, total: 48, highRiskCount: 5, avgConfidence: 0.74 },
  ],
  threads: [
    {
      threadTs: "1710751600.000000",
      summary: "Delivery date needs a stronger commitment and owner.",
      messageCount: 7,
      lastActivityAt: "2026-03-18T08:32:00.000Z",
      sentimentTrajectory: "deteriorating",
      openQuestions: ["Can the updated timeline be confirmed today?"],
      insights: [
        {
          label: "Crucial thread",
          value: "This thread is the highest-priority escalation in the channel right now.",
          type: "crucial",
          threadTs: "1710751600.000000",
          messageTs: "1710751600.000000",
        },
      ],
      crucialMessageTs: "1710751600.000000",
      crucialMessageSummary: "The client is waiting on a firm delivery timeline.",
      crucialMessage: {
        messageTs: "1710751600.000000",
        summary: "The client is waiting on a firm delivery timeline.",
        reason: "Repeated asks and a blocking deadline make this message the one to surface first.",
        userName: "Sarah K.",
        threadTs: "1710751600.000000",
      },
    },
    {
      threadTs: "1710748200.000000",
      summary: "Scope handoff and review comments remain open.",
      messageCount: 4,
      lastActivityAt: "2026-03-17T17:22:00.000Z",
      sentimentTrajectory: "stable",
      openQuestions: ["Who owns the final review pass?"],
    },
  ],
  alerts: dashboardOverviewFixture.alerts,
};

export const dashboardThreadDetailFixture: ThreadDetailFixture = {
  channel: dashboardChannelDetailFixture.channel,
  state: dashboardChannelDetailFixture.state,
  thread: dashboardChannelDetailFixture.threads[0],
  messages: [
    {
      id: "client-beta-1710751600.000000",
      ts: "1710751600.000000",
      threadTs: "1710751600.000000",
      userId: "u-1",
      userName: "Sarah K.",
      text: "We need the updated timeline today. This keeps slipping.",
      createdAt: "2026-03-18T08:30:00.000Z",
      analysisStatus: "completed",
      emotion: "anger",
      confidence: 0.91,
      escalationRisk: "high",
      explanation: "Direct language and repeated timeline pressure indicate rising frustration.",
      sarcasmDetected: false,
      triggerPhrases: ["today", "keeps slipping"],
      behavioralPattern: "timeline escalation",
      messageIntent: "request",
      isActionable: true,
      isBlocking: true,
      urgencyLevel: "high",
      isCrucial: true,
      crucialReason: "Repeated asks and a blocking deadline make this the message to surface first.",
      followUp: {
        itemId: "fu-1",
        seriousness: "high",
        summary: "The client expects a timeline update today.",
        dueAt: "2026-03-18T06:00:00.000Z",
        repeatedAskCount: 3,
      },
    },
    {
      id: "client-beta-1710751660.000000",
      ts: "1710751660.000000",
      threadTs: "1710751600.000000",
      userId: "u-2",
      userName: "Bob",
      text: "I can post the revised plan in the next hour.",
      createdAt: "2026-03-18T08:33:00.000Z",
      analysisStatus: "completed",
      emotion: "joy",
      confidence: 0.82,
      escalationRisk: "low",
      explanation: "Clear commitment and helpful timing reduce tension.",
      sarcasmDetected: false,
      triggerPhrases: ["next hour"],
      behavioralPattern: "commitment",
      messageIntent: "commitment",
      isActionable: true,
      isBlocking: false,
      urgencyLevel: "medium",
      threadInsights: [
        {
          label: "Commitment offered",
          value: "Bob's reply softens the immediate risk but does not close the loop.",
          type: "trend",
          threadTs: "1710751600.000000",
          messageTs: "1710751660.000000",
        },
      ],
    },
    {
      id: "client-beta-1710751720.000000",
      ts: "1710751720.000000",
      threadTs: "1710751600.000000",
      userId: "u-3",
      userName: "Alice",
      text: "Let's confirm the owner before we send the update.",
      createdAt: "2026-03-18T08:35:00.000Z",
      analysisStatus: "pending",
      messageIntent: "question",
      isActionable: true,
      isBlocking: false,
      urgencyLevel: "low",
      threadInsights: [
        {
          label: "Owner still unclear",
          value: "The open question keeps the thread from being fully resolved.",
          type: "tension",
          threadTs: "1710751600.000000",
          messageTs: "1710751720.000000",
        },
      ],
    },
  ],
};

export const dashboardFollowUpActionFixtures: FollowUpActionFixture[] = [
  {
    id: "fu-1",
    channelId: "client-beta",
    channelName: "client-beta",
    conversationType: "private_channel",
    summary: "Client is waiting on a timeline response.",
    actionHint: "Resolve and notify the queue",
    dueAt: "2026-03-18T06:00:00.000Z",
  },
  {
    id: "fu-2",
    channelId: "project-alpha",
    channelName: "project-alpha",
    conversationType: "public_channel",
    summary: "Scope disagreement is still open.",
    actionHint: "Snooze for 24 hours",
    dueAt: null,
  },
];
