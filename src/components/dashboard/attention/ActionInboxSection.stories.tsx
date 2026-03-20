import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SWRConfig } from "swr";
import { ActionInboxSection } from "./ActionInboxSection";
import type { AppSession, AttentionItem, ChannelCardData } from "@/lib/types";

const meta = {
  title: "Dashboard/Action Inbox Section",
  component: ActionInboxSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ActionInboxSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Date.now();

function minutesAgo(minutes: number) {
  return new Date(now - minutes * 60 * 1000).toISOString();
}

function hoursAgo(hours: number) {
  return new Date(now - hours * 60 * 60 * 1000).toISOString();
}

function signalForHealth(health: ChannelCardData["health"]): ChannelCardData["signal"] {
  switch (health) {
    case "at-risk":
      return "escalating";
    case "attention":
      return "elevated";
    default:
      return "stable";
  }
}

function buildHealthCounts(
  overrides: Partial<ChannelCardData["healthCounts"]> = {},
): ChannelCardData["healthCounts"] {
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
  healthCounts: ChannelCardData["healthCounts"],
  deepAiAnalyzed: number,
): ChannelCardData["messageDispositionCounts"] {
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

function inboxChannel(
  id: string,
  name: string,
  health: ChannelCardData["health"],
  conversationType: ChannelCardData["conversationType"] = "public_channel",
): ChannelCardData {
  const signal = signalForHealth(health);
  const healthCounts = buildHealthCounts({
    openAlertCount: 1,
    highSeverityAlertCount: health === "at-risk" ? 1 : 0,
    humanRiskSignalCount: health === "healthy" ? 1 : 2,
    requestSignalCount: 2,
    decisionSignalCount: 1,
    resolutionSignalCount: 0,
    flaggedMessageCount: 2,
    highRiskMessageCount: health === "at-risk" ? 1 : 0,
    attentionThreadCount: 1,
    blockedThreadCount: health === "at-risk" ? 1 : 0,
    escalatedThreadCount: 0,
    riskyThreadCount: 1,
    totalMessageCount: 52,
    skippedMessageCount: 18,
    contextOnlyMessageCount: 12,
    ignoredMessageCount: 6,
    inflightMessageCount: 0,
  });

  return {
    id,
    name,
    status: "ready",
    conversationType,
    health,
    signal,
    signalConfidence:
      signal === "escalating" ? 0.83 : signal === "elevated" ? 0.71 : 0.64,
    effectiveChannelMode: "collaboration",
    riskDrivers:
      health === "healthy"
        ? [
            {
              key: `${id}-clear`,
              label: "Routine activity",
              message: `${name} is active, but nothing currently needs intervention.`,
              severity: "low",
              category: "summary",
            },
          ]
        : [
            {
              key: `${id}-follow-ups`,
              label: "Open attention items",
              message: `${name} has active follow-up pressure that still needs a reply.`,
              severity: health === "at-risk" ? "high" : "medium",
              category: "alert",
            },
          ],
    attentionSummary:
      health === "healthy"
        ? {
            status: "clear",
            title: "Nothing needs attention",
            message: `${name} is clear right now.`,
            driverKeys: [],
          }
        : {
            status: health === "at-risk" ? "action" : "watch",
            title: health === "at-risk" ? "Direct attention recommended" : "Watch this channel",
            message:
              health === "at-risk"
                ? `${name} has active risk signals that should be reviewed soon.`
                : `${name} has a small amount of open pressure worth keeping an eye on.`,
            driverKeys: [`${id}-follow-ups`],
          },
    messageDispositionCounts: buildMessageDispositionCounts(healthCounts, 34),
    messageCount: 120,
    lastActivity: hoursAgo(2),
    sentimentSnapshot: {
      totalAnalyzed: 52,
      emotionDistribution: {
        anger: 1,
        joy: 22,
        sadness: 3,
        neutral: 20,
        fear: 2,
        surprise: 3,
        disgust: 1,
      },
      highRiskCount: 1,
    },
    healthCounts,
    sparklineData: [0.58, 0.57, 0.59, 0.6, 0.62, 0.63, 0.64, 0.65],
  };
}

const channels: ChannelCardData[] = [
  inboxChannel("billing-renewals", "billing-renewals", "attention"),
  inboxChannel("launch-ops", "launch-ops", "healthy", "private_channel"),
  inboxChannel("partner-success", "partner-success", "at-risk"),
  inboxChannel("customer-onboarding", "customer-onboarding", "healthy"),
];

const session: AppSession = {
  workspaceId: "workspace-demo",
  workspaceName: "PulseBoard Demo",
  userId: "user-avery",
  userName: "Avery",
  authMode: "mock",
  issuedAt: now,
  expiresAt: now + 1000 * 60 * 60,
};

const inbox: AttentionItem[] = [
  {
    id: "inbox-1",
    kind: "reply_needed",
    group: "needs_reply",
    resolutionState: "open",
    severity: "high",
    priorityScore: 98,
    conversationType: "public_channel",
    channelId: "billing-renewals",
    channelName: "billing-renewals",
    actorUserId: "user-mia",
    actorName: "Mia",
    sourceMessageTs: "1710702000.000000",
    title: "Client wants the renewal plan confirmed today",
    message: "Can we get a final answer on the enterprise renewal before EOD?",
    whyThisMatters: "This is the last open blocker in the renewal thread and the client is asking for a direct commitment.",
    expectedResponderIds: ["user-avery"],
    expectedResponderNames: ["Avery"],
    workflowState: "pending_reply_window",
    primaryResponderIds: ["user-avery"],
    primaryResponderNames: ["Avery"],
    escalationResponderIds: ["user-sam"],
    escalationResponderNames: ["Sam"],
    primaryMissedSla: true,
    lastStateChangedAt: minutesAgo(35),
    dueAt: minutesAgo(20),
    createdAt: minutesAgo(52),
    contextHref: "/dashboard/channels/billing-renewals?thread=inbox-1",
    followUpItemId: "follow-up-1",
    messageIntent: "request",
    urgencyDimensions: {
      isActionable: true,
      isBlocking: true,
      urgencyLevel: "high",
    },
  },
  {
    id: "inbox-2",
    kind: "follow_up_due",
    group: "acknowledged",
    resolutionState: "acknowledged",
    severity: "medium",
    priorityScore: 76,
    conversationType: "private_channel",
    channelId: "launch-ops",
    channelName: "launch-ops",
    actorUserId: "user-noah",
    actorName: "Noah",
    sourceMessageTs: "1710702600.000000",
    title: "Waiting on launch checklist sign-off",
    message: "The checklist is ready, but we still need one final pass on the rollout dependencies.",
    whyThisMatters: "The team already acknowledged the task, but the thread is still incomplete and waiting on the next reply.",
    expectedResponderIds: ["user-avery"],
    expectedResponderNames: ["Avery"],
    workflowState: "acknowledged_waiting",
    primaryResponderIds: ["user-avery"],
    primaryResponderNames: ["Avery"],
    escalationResponderIds: ["user-sam"],
    escalationResponderNames: ["Sam"],
    acknowledgedAt: minutesAgo(18),
    lastStateChangedAt: minutesAgo(18),
    dueAt: minutesAgo(40),
    createdAt: minutesAgo(95),
    contextHref: "/dashboard/channels/launch-ops?thread=inbox-2",
    followUpItemId: "follow-up-2",
    resolutionReason: "reply",
    messageIntent: "question",
    urgencyDimensions: {
      isActionable: true,
      isBlocking: false,
      urgencyLevel: "medium",
    },
  },
  {
    id: "inbox-3",
    kind: "sentiment_risk",
    group: "sentiment_risk",
    resolutionState: "open",
    severity: "high",
    priorityScore: 92,
    conversationType: "public_channel",
    channelId: "partner-success",
    channelName: "partner-success",
    sourceMessageTs: "1710703200.000000",
    title: "Tone is trending sharper in partner-success",
    message: "Multiple replies mention missed expectations and the thread is showing signs of frustration.",
    whyThisMatters: "A tone shift like this is the earliest signal that a conversation may need direct human intervention.",
    expectedResponderIds: ["user-sam"],
    expectedResponderNames: ["Sam"],
    workflowState: "escalated",
    primaryResponderIds: ["user-avery"],
    primaryResponderNames: ["Avery"],
    escalationResponderIds: ["user-sam"],
    escalationResponderNames: ["Sam"],
    resolvedViaEscalation: true,
    lastStateChangedAt: minutesAgo(11),
    dueAt: minutesAgo(5),
    createdAt: minutesAgo(24),
    contextHref: "/dashboard/channels/partner-success?thread=inbox-3",
    followUpItemId: "follow-up-3",
    messageIntent: "escalation",
    urgencyDimensions: {
      isActionable: true,
      isBlocking: false,
      urgencyLevel: "critical",
    },
  },
  {
    id: "inbox-4",
    kind: "leadership_instruction",
    group: "resolved_recently",
    resolutionState: "resolved",
    severity: "low",
    priorityScore: 42,
    conversationType: "dm",
    channelId: "customer-onboarding",
    channelName: "customer-onboarding",
    actorUserId: "user-leo",
    actorName: "Leo",
    sourceMessageTs: "1710703800.000000",
    title: "Onboarding follow-up was closed out cleanly",
    message: "Thanks for the quick turnaround, we are all set on the onboarding checklist.",
    whyThisMatters: "Recently resolved items provide a useful accountability trail and help the team see what good closure looks like.",
    expectedResponderIds: ["user-avery"],
    expectedResponderNames: ["Avery"],
    primaryResponderIds: ["user-avery"],
    primaryResponderNames: ["Avery"],
    escalationResponderIds: [],
    escalationResponderNames: [],
    workflowState: "resolved",
    resolutionReason: "manual_done",
    engagementScope: "manual",
    lastStateChangedAt: minutesAgo(6),
    createdAt: minutesAgo(85),
    contextHref: "/dashboard/channels/customer-onboarding?thread=inbox-4",
    followUpItemId: null,
    messageIntent: "acknowledgment",
    urgencyDimensions: {
      isActionable: false,
      isBlocking: false,
      urgencyLevel: "low",
    },
  },
];

const inboxKey = "/api/inbox?limit=120&group=all&severity=all";
const sessionKey = "/api/session";

function StoryDataShell({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        fallback: {
          [sessionKey]: session,
          [inboxKey]: inbox,
        },
        isPaused: () => true,
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}

export const Default: Story = {
  args: {
    channels,
  },
  render: (args) => (
    <StoryDataShell>
      <div className="max-w-6xl">
        <ActionInboxSection channels={args.channels} />
      </div>
    </StoryDataShell>
  ),
};
