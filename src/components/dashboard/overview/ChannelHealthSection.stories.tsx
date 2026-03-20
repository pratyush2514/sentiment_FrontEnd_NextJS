import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChannelHealthSection } from "./ChannelHealthSection";
import type { ChannelCardData } from "@/lib/types";

const meta = {
  title: "Dashboard/Channel Health Section",
  component: ChannelHealthSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ChannelHealthSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Date.now();

function hoursAgo(hours: number) {
  return new Date(now - hours * 60 * 60 * 1000).toISOString();
}

function emotionDistribution(
  anger: number,
  joy: number,
  sadness: number,
  neutral: number,
  fear: number,
  surprise: number,
  disgust: number,
) {
  return { anger, joy, sadness, neutral, fear, surprise, disgust };
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

function buildChannel(overrides: Partial<ChannelCardData> & Pick<ChannelCardData, "id" | "name">): ChannelCardData {
  const { id, name, ...rest } = overrides;
  const baseHealth = rest.health ?? "healthy";
  const signal = signalForHealth(baseHealth);
  const healthCounts = buildHealthCounts(rest.healthCounts ?? {
    humanRiskSignalCount: baseHealth === "healthy" ? 1 : 2,
    requestSignalCount: 1,
    decisionSignalCount: 1,
    totalMessageCount: 84,
    skippedMessageCount: 24,
    contextOnlyMessageCount: 18,
    ignoredMessageCount: 6,
  });
  const defaultRiskDrivers: ChannelCardData["riskDrivers"] =
    baseHealth === "healthy"
      ? [
          {
            key: `${id}-clear`,
            label: "Routine activity",
            message: `${name} is active and does not currently need intervention.`,
            severity: "low",
            category: "summary",
          },
        ]
      : [
          {
            key: `${id}-attention`,
            label: "Recent pressure",
            message: `${name} has active risk signals that should stay visible on the dashboard.`,
            severity: baseHealth === "at-risk" ? "high" : "medium",
            category: "alert",
          },
        ];

  return {
    id,
    name,
    status: "ready",
    conversationType: "public_channel",
    health: baseHealth,
    signal,
    signalConfidence:
      signal === "escalating" ? 0.84 : signal === "elevated" ? 0.72 : 0.65,
    effectiveChannelMode: "collaboration",
    riskDrivers: rest.riskDrivers ?? defaultRiskDrivers,
    attentionSummary:
      rest.attentionSummary ??
      (
        baseHealth === "healthy"
          ? {
              status: "clear",
              title: "Nothing needs attention",
              message: `${name} is clear right now.`,
              driverKeys: [],
            }
          : {
              status: baseHealth === "at-risk" ? "action" : "watch",
              title: baseHealth === "at-risk" ? "Direct attention recommended" : "Watch this channel",
              message:
                baseHealth === "at-risk"
                  ? `${name} has active high-risk pressure that should be reviewed soon.`
                  : `${name} has lighter pressure worth monitoring.`,
              driverKeys: defaultRiskDrivers.map((driver) => driver.key),
            }
      ),
    messageDispositionCounts:
      rest.messageDispositionCounts ??
      buildMessageDispositionCounts(healthCounts, 36),
    messageCount: 128,
    lastActivity: hoursAgo(2),
    sentimentSnapshot: {
      totalAnalyzed: 84,
      emotionDistribution: emotionDistribution(2, 34, 6, 34, 2, 4, 2),
      highRiskCount: 1,
    },
    healthCounts,
    sparklineData: [0.48, 0.52, 0.55, 0.58, 0.61, 0.6, 0.63, 0.66],
    ...rest,
  };
}

const channels: ChannelCardData[] = [
  buildChannel({
    id: "billing-renewals",
    name: "billing-renewals",
    health: "attention",
    messageCount: 212,
    lastActivity: hoursAgo(1),
    sparklineData: [0.59, 0.58, 0.55, 0.49, 0.46, 0.44, 0.47, 0.45],
    healthCounts: buildHealthCounts({
      openAlertCount: 3,
      highSeverityAlertCount: 1,
      automationIncidentCount: 1,
      automationIncident24hCount: 1,
      humanRiskSignalCount: 6,
      requestSignalCount: 4,
      decisionSignalCount: 1,
      resolutionSignalCount: 1,
      flaggedMessageCount: 7,
      highRiskMessageCount: 2,
      attentionThreadCount: 3,
      blockedThreadCount: 1,
      escalatedThreadCount: 1,
      riskyThreadCount: 2,
      totalMessageCount: 126,
      skippedMessageCount: 34,
      contextOnlyMessageCount: 22,
      ignoredMessageCount: 12,
      inflightMessageCount: 2,
    }),
  }),
  buildChannel({
    id: "launch-ops",
    name: "launch-ops",
    health: "healthy",
    conversationType: "private_channel",
    messageCount: 89,
    lastActivity: hoursAgo(4),
    sparklineData: [0.66, 0.67, 0.68, 0.7, 0.69, 0.71, 0.73, 0.72],
  }),
  buildChannel({
    id: "partner-success",
    name: "partner-success",
    health: "at-risk",
    messageCount: 301,
    lastActivity: hoursAgo(3),
    sparklineData: [0.38, 0.36, 0.34, 0.31, 0.33, 0.29, 0.27, 0.25],
    healthCounts: buildHealthCounts({
      openAlertCount: 6,
      highSeverityAlertCount: 3,
      automationIncidentCount: 2,
      criticalAutomationIncidentCount: 1,
      automationIncident24hCount: 2,
      criticalAutomationIncident24hCount: 1,
      humanRiskSignalCount: 11,
      requestSignalCount: 7,
      decisionSignalCount: 2,
      resolutionSignalCount: 1,
      flaggedMessageCount: 19,
      highRiskMessageCount: 7,
      attentionThreadCount: 5,
      blockedThreadCount: 2,
      escalatedThreadCount: 1,
      riskyThreadCount: 4,
      totalMessageCount: 164,
      skippedMessageCount: 40,
      contextOnlyMessageCount: 28,
      ignoredMessageCount: 12,
      inflightMessageCount: 3,
    }),
  }),
  buildChannel({
    id: "customer-escalations",
    name: "customer-escalations",
    status: "initializing",
    health: "attention",
    messageCount: 12,
    lastActivity: hoursAgo(12),
    sparklineData: [],
  }),
  buildChannel({
    id: "design-critique",
    name: "design-critique",
    status: "failed",
    health: "healthy",
    conversationType: "group_dm",
    messageCount: 0,
    lastActivity: hoursAgo(24),
    sparklineData: [],
  }),
  buildChannel({
    id: "ops-infra",
    name: "ops-infra",
    status: "removed",
    health: "healthy",
    messageCount: 0,
    lastActivity: hoursAgo(72),
    sparklineData: [],
  }),
  buildChannel({
    id: "customer-onboarding",
    name: "customer-onboarding",
    health: "healthy",
    messageCount: 178,
    lastActivity: hoursAgo(5),
    sparklineData: [0.58, 0.59, 0.61, 0.62, 0.64, 0.65, 0.66, 0.68],
  }),
  buildChannel({
    id: "renewals-emea",
    name: "renewals-emea",
    health: "attention",
    messageCount: 144,
    lastActivity: hoursAgo(7),
    sparklineData: [0.51, 0.5, 0.48, 0.47, 0.46, 0.45, 0.47, 0.46],
  }),
  buildChannel({
    id: "cs-queue",
    name: "cs-queue",
    health: "healthy",
    messageCount: 256,
    lastActivity: hoursAgo(6),
    sparklineData: [0.62, 0.63, 0.64, 0.65, 0.66, 0.67, 0.69, 0.7],
  }),
  buildChannel({
    id: "sales-handoff",
    name: "sales-handoff",
    health: "at-risk",
    messageCount: 198,
    lastActivity: hoursAgo(9),
    sparklineData: [0.4, 0.39, 0.37, 0.35, 0.33, 0.34, 0.32, 0.31],
  }),
  buildChannel({
    id: "product-feedback",
    name: "product-feedback",
    health: "healthy",
    messageCount: 67,
    lastActivity: hoursAgo(8),
    sparklineData: [0.55, 0.56, 0.57, 0.58, 0.59, 0.61, 0.6, 0.62],
  }),
  buildChannel({
    id: "vendor-partnerships",
    name: "vendor-partnerships",
    health: "attention",
    messageCount: 103,
    lastActivity: hoursAgo(10),
    sparklineData: [0.54, 0.53, 0.51, 0.49, 0.48, 0.47, 0.46, 0.45],
  }),
];

export const Default: Story = {
  args: {
    channels,
    isLoading: false,
  },
};
