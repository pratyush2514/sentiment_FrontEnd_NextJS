"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconAlertOctagon,
  IconAlertTriangle,
  IconChevronDown,
  IconFlame,
  IconMoodNeutral,
  IconShieldCheck,
  IconTrendingUp,
  IconUser,
} from "@tabler/icons-react";
import { HighlightedText, Skeleton, Tooltip } from "@/components/ui";
import { relativeTime } from "@/lib/utils/formatters";
import { isPlaceholderSummary } from "@/lib/utils/summary";
import type {
  ChannelSignal,
  ChannelLatestMeeting,
  ChannelState,
  SummaryEvidenceRef,
  ThreadInsight,
  UnifiedDriver,
} from "@/lib/types";

interface RunningSummaryProps {
  state: ChannelState | undefined;
  isLoading: boolean;
  threadInsights?: ThreadInsight[];
}

interface ImportantHighlight {
  id: string;
  title: string;
  source: string;
  level: UnifiedDriver["level"];
  text: string;
}

interface SummaryNarrativeItem {
  id: string;
  text: string;
  badge?: string | null;
  evidence?: SummaryEvidenceRef[];
}

const SIGNAL_CONFIG: Record<
  ChannelSignal,
  {
    label: string;
    tip: string;
    color: string;
    bg: string;
    border: string;
    icon: typeof IconShieldCheck;
  }
> = {
  stable: {
    label: "Stable",
    tip: "No active alerts, no meaningful surfaced thread pressure, and recent analyzed sentiment remains calm.",
    color: "var(--theme-status-success)",
    bg: "color-mix(in srgb, var(--theme-status-success) 10%, transparent)",
    border: "color-mix(in srgb, var(--theme-status-success) 24%, transparent)",
    icon: IconShieldCheck,
  },
  elevated: {
    label: "Elevated",
    tip: "Open alerts, surfaced thread pressure, recent flagged risk, or negative recent sentiment need attention.",
    color: "var(--theme-status-warning)",
    bg: "color-mix(in srgb, var(--theme-status-warning) 10%, transparent)",
    border: "color-mix(in srgb, var(--theme-status-warning) 24%, transparent)",
    icon: IconAlertTriangle,
  },
  escalating: {
    label: "Escalating",
    tip: "A high-severity alert, an escalated thread, a recent high-risk message, or multiple recent flagged risks are active.",
    color: "var(--theme-status-error)",
    bg: "color-mix(in srgb, var(--theme-status-error) 10%, transparent)",
    border: "color-mix(in srgb, var(--theme-status-error) 24%, transparent)",
    icon: IconAlertOctagon,
  },
};

const THREAD_INSIGHT_ICONS: Record<ThreadInsight["type"], typeof IconFlame> = {
  concern: IconFlame,
  tension: IconAlertTriangle,
  trend: IconTrendingUp,
  actor: IconUser,
  neutral: IconMoodNeutral,
  crucial: IconFlame,
};

const SURFACE_CLASS =
  "rounded-xl border border-border-subtle/85 bg-bg-primary shadow-[0_8px_24px_color-mix(in_srgb,var(--theme-bg-primary)_10%,transparent)]";

const numberFormatter = new Intl.NumberFormat("en-US");

function slackTsToIso(ts?: string | null): string | null {
  const parsed = Number.parseFloat(ts ?? "");
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return new Date(parsed * 1000).toISOString();
}

function isOlderThanHours(
  value: string | null | undefined,
  hours: number,
): boolean {
  if (!value) {
    return false;
  }

  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) {
    return false;
  }

  return Date.now() - time > hours * 3_600_000;
}

function evidenceTierLabel(tier?: "signal" | "pattern" | "confirmed"): string {
  switch (tier) {
    case "confirmed":
      return "Corroborated evidence";
    case "pattern":
      return "Pattern evidence";
    case "signal":
      return "Light evidence";
    default:
      return "Evidence building";
  }
}

function driverTone(level: UnifiedDriver["level"]): {
  color: string;
  bg: string;
  border: string;
  label: string;
} {
  switch (level) {
    case "critical":
      return {
        color: "var(--theme-status-error)",
        bg: "color-mix(in srgb, var(--theme-status-error) 10%, transparent)",
        border:
          "color-mix(in srgb, var(--theme-status-error) 24%, transparent)",
        label: "Critical",
      };
    case "warning":
      return {
        color: "var(--theme-status-warning)",
        bg: "color-mix(in srgb, var(--theme-status-warning) 10%, transparent)",
        border:
          "color-mix(in srgb, var(--theme-status-warning) 24%, transparent)",
        label: "Watch",
      };
    default:
      return {
        color: "var(--theme-status-success)",
        bg: "color-mix(in srgb, var(--theme-status-success) 10%, transparent)",
        border:
          "color-mix(in srgb, var(--theme-status-success) 24%, transparent)",
        label: "Healthy",
      };
  }
}

function sourceLabel(source: UnifiedDriver["source"]): string {
  switch (source) {
    case "combined":
      return "Slack + Fathom";
    case "fathom":
      return "Fathom";
    default:
      return "Slack";
  }
}

function formatMeetingSentiment(
  sentiment?: "positive" | "neutral" | "concerned" | "tense" | null,
): string | null {
  switch (sentiment) {
    case "positive":
      return "Positive";
    case "neutral":
      return "Neutral";
    case "concerned":
      return "Concerned";
    case "tense":
      return "Tense";
    default:
      return null;
  }
}

function formatMeetingSourceLabel(
  source: "api" | "webhook" | "shared_link",
): string {
  return source === "shared_link" ? "Shared link" : "Fathom";
}

function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return count === 1 ? singular : plural;
}

function normalizePoint(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/^[•\-–—:\s]+/g, "")
    .trim();
}

function splitSummaryIntoPoints(text?: string | null, maxPoints = 5): string[] {
  if (!text) {
    return [];
  }

  const normalized = text
    .replace(/\r/g, "\n")
    .replace(/[•]/g, "\n")
    .replace(/\s+-\s+/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const seen = new Set<string>();
  const points = normalized
    .split(/(?<=[.!?])\s+|\n+/)
    .map(normalizePoint)
    .filter((item) => item.length >= 12)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

  return points.slice(0, maxPoints);
}

function summaryFactBadge(kind: NonNullable<ChannelState["summaryArtifact"]>["summaryFacts"][number]["kind"]): string {
  switch (kind) {
    case "blocker":
      return "Blocker";
    case "resolution":
      return "Progress";
    case "decision":
      return "Decision";
    case "primary_issue":
      return "Primary issue";
    case "open_question":
      return "Open question";
    case "topic":
    default:
      return "Topic";
  }
}

function buildNarrativeItemsFromText(points: string[]): SummaryNarrativeItem[] {
  return points.map((point, index) => ({
    id: `point-${index}-${point.slice(0, 24)}`,
    text: point,
  }));
}

function buildNarrativeItemsFromSummaryFacts(
  summaryFacts: NonNullable<ChannelState["summaryArtifact"]>["summaryFacts"],
  maxItems = 5,
): SummaryNarrativeItem[] {
  return summaryFacts.slice(0, maxItems).map((fact, index) => ({
    id: `${fact.kind}-${index}-${fact.text.slice(0, 24)}`,
    text: fact.text,
    badge: summaryFactBadge(fact.kind),
    evidence: fact.evidence,
  }));
}

function buildEvidenceHref(
  channelId: string,
  evidence: SummaryEvidenceRef,
): string {
  if (evidence.threadTs && evidence.threadTs !== evidence.messageTs) {
    return `/dashboard/channels/${channelId}/threads/${evidence.threadTs}?messageTs=${evidence.messageTs}`;
  }

  return `/dashboard/channels/${channelId}?conversation=1&messageTs=${evidence.messageTs}`;
}

function fallbackUnifiedDrivers(state: ChannelState): UnifiedDriver[] {
  if (state.unifiedDrivers && state.unifiedDrivers.length > 0) {
    return state.unifiedDrivers;
  }

  if (state.riskDrivers.length > 0) {
    return state.riskDrivers.slice(0, 4).map((driver) => ({
      level:
        driver.severity === "high"
          ? "critical"
          : driver.severity === "medium"
            ? "warning"
            : "positive",
      source: "slack" as const,
      message: driver.message,
    }));
  }

  return [
    {
      level: "positive",
      source: "slack",
      message:
        "No strong cross-source pressure is active in this channel right now.",
    },
  ];
}

function buildImportantHighlights(input: {
  unifiedDrivers: UnifiedDriver[];
  meetingContext: ChannelState["meetingContext"];
  recentActivity: ChannelState["recentActivity"] | null;
  hasLiveSummary: boolean;
}): ImportantHighlight[] {
  const highlights: ImportantHighlight[] = [];
  const seen = new Set<string>();

  const pushHighlight = (highlight: ImportantHighlight) => {
    const key = highlight.text.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    highlights.push(highlight);
  };

  input.unifiedDrivers.slice(0, 3).forEach((driver, index) => {
    pushHighlight({
      id: `driver-${index}`,
      title: driverTone(driver.level).label,
      source: sourceLabel(driver.source),
      level: driver.level,
      text: driver.message,
    });
  });

  const latestMeeting = input.meetingContext?.latestMeeting ?? null;
  if (latestMeeting?.blockers[0]) {
    pushHighlight({
      id: "meeting-blocker",
      title: "Meeting blocker",
      source: "Fathom",
      level: latestMeeting.overdueObligations > 0 ? "critical" : "warning",
      text: latestMeeting.blockers[0],
    });
  } else if (latestMeeting?.nextSteps[0]) {
    pushHighlight({
      id: "meeting-next-step",
      title: "Next step",
      source: "Fathom",
      level: "positive",
      text: latestMeeting.nextSteps[0],
    });
  }

  if (
    input.recentActivity &&
    !input.hasLiveSummary &&
    input.recentActivity.messageCount > 0
  ) {
    pushHighlight({
      id: "recent-activity",
      title: "Recent activity",
      source: "Slack",
      level: input.recentActivity.openFollowUps > 0 ? "warning" : "positive",
      text:
        `${numberFormatter.format(input.recentActivity.messageCount)} message${input.recentActivity.messageCount === 1 ? "" : "s"}, ` +
        `${numberFormatter.format(input.recentActivity.activeThreads)} active ${pluralize(input.recentActivity.activeThreads, "thread")}, ` +
        `${numberFormatter.format(input.recentActivity.openFollowUps)} open follow-up${input.recentActivity.openFollowUps === 1 ? "" : "s"} in the last ${input.recentActivity.windowHours} hours.`,
    });
  }

  return highlights.slice(0, 4);
}

function buildExecutiveSummary(input: {
  healthSummary: string;
  latestMeeting: ChannelLatestMeeting | null;
  recentActivity: ChannelState["recentActivity"] | null;
  meetingPoints: string[];
  hasLiveSummary: boolean;
}): string {
  const segments = [input.healthSummary.trim()];
  const meetingLead =
    input.latestMeeting?.blockers[0] ??
    input.latestMeeting?.nextSteps[0] ??
    input.meetingPoints[0] ??
    null;

  if (meetingLead) {
    segments.push(`Latest meeting adds: ${meetingLead}`);
  } else if (input.recentActivity && !input.hasLiveSummary) {
    segments.push(
      `Slack stayed active with ${numberFormatter.format(input.recentActivity.messageCount)} recent message${input.recentActivity.messageCount === 1 ? "" : "s"} across ${numberFormatter.format(input.recentActivity.activeThreads)} ${pluralize(input.recentActivity.activeThreads, "thread")}.`,
    );
  }

  return segments.slice(0, 2).join(" ");
}

function buildCompactMetricItems(
  recentActivity: ChannelState["recentActivity"] | null,
): Array<{ label: string; value: string }> {
  if (!recentActivity) {
    return [];
  }

  return [
    {
      label: recentActivity.label,
      value: `${numberFormatter.format(recentActivity.messageCount)} ${pluralize(recentActivity.messageCount, "message")}`,
    },
    {
      label: "Active threads",
      value: numberFormatter.format(recentActivity.activeThreads),
    },
    {
      label: "Open follow-ups",
      value: numberFormatter.format(recentActivity.openFollowUps),
    },
    ...(recentActivity.resolvedFollowUps > 0
      ? [
          {
            label: "Recently resolved",
            value: numberFormatter.format(recentActivity.resolvedFollowUps),
          },
        ]
      : []),
  ];
}

function SectionHeader({
  title,
  subtitle,
  expanded,
  onToggle,
  meta,
  hideLabel,
  showLabel,
}: {
  title: string;
  subtitle?: string;
  expanded?: boolean;
  onToggle?: () => void;
  meta?: string | null;
  hideLabel?: string;
  showLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-primary font-semibold">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-1.5 font-body text-sm leading-relaxed text-text-tertiary">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {meta ? (
          <span className="font-mono text-xs text-text-tertiary">
            {meta}
          </span>
        ) : null}
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-secondary/60 px-3 py-1.5 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            aria-expanded={expanded}
          >
            <IconChevronDown
              size={12}
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
            {expanded ? (hideLabel ?? "Hide") : (showLabel ?? "Show")}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function EvidenceLinks({
  channelId,
  evidence,
}: {
  channelId?: string;
  evidence?: SummaryEvidenceRef[];
}) {
  if (!channelId || !evidence || evidence.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {evidence.slice(0, 3).map((item, index) => (
        <Link
          key={`${item.messageTs}-${index}`}
          href={buildEvidenceHref(channelId, item)}
          className="rounded-full border border-border-subtle bg-bg-primary px-2.5 py-1 font-mono text-[10px] text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          title={item.excerpt ?? "Open the cited Slack context"}
        >
          Source {index + 1}
        </Link>
      ))}
    </div>
  );
}

function SummaryNarrative({
  items,
  channelId,
  userMap,
  compact = false,
}: {
  items: SummaryNarrativeItem[];
  channelId?: string;
  userMap: Map<string, string>;
  compact?: boolean;
}) {
  if (items.length === 0) {
    return null;
  }

  const [lead, ...rest] = items;

  return (
    <div>
      {lead.badge ? (
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">
          {lead.badge}
        </p>
      ) : null}
      <HighlightedText
        text={lead.text}
        className={`block font-body ${compact ? "text-sm" : "text-[15px]"} leading-7 text-text-primary`}
        userMap={userMap}
      />
      <EvidenceLinks channelId={channelId} evidence={lead.evidence} />
      {rest.length > 0 ? (
        <div className="mt-3 space-y-2">
          {rest.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border-subtle/60 bg-bg-secondary/45 px-3 py-2"
            >
              {item.badge ? (
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">
                  {item.badge}
                </p>
              ) : null}
              <HighlightedText
                text={item.text}
                className="block font-body text-sm leading-6 text-text-secondary"
                userMap={userMap}
              />
              <EvidenceLinks channelId={channelId} evidence={item.evidence} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function RunningSummary({
  state,
  isLoading,
  threadInsights = [],
}: RunningSummaryProps) {
  const [showDetails, setShowDetails] = useState(true);
  const [showContext, setShowContext] = useState(true);
  const [showMeeting, setShowMeeting] = useState(true);

  const userMap = new Map<string, string>();
  if (state) {
    for (const participant of state.participants) {
      if (participant.displayName) {
        userMap.set(participant.userId, participant.displayName);
      }
    }
  }

  if (isLoading || !state) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-secondary/60 p-5">
        <Skeleton className="mb-3 h-5 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  const signal = SIGNAL_CONFIG[state.signal];
  const SignalIcon = signal.icon;
  const isRiskOnlyChannel = state.effectiveImportanceTier === "low_value";
  const activeSummary = state.activeWindowSummary || state.runningSummary;
  const hasNarrative =
    !isRiskOnlyChannel && !isPlaceholderSummary(activeSummary);
  const liveSummaryTimestamp =
    state.liveSummaryUpdatedAt ??
    slackTsToIso(state.liveSummaryCoverage?.endTs ?? null);
  const hasLiveSummary =
    !isRiskOnlyChannel &&
    Boolean(state.liveSummary?.trim()) &&
    !isOlderThanHours(liveSummaryTimestamp, state.liveWindowHours ?? 24);
  const healthSummary =
    state.attentionSummary.status === "clear"
      ? "Slack and meeting signals look steady right now."
      : state.attentionSummary.message;
  const recentActivity = state.recentActivity ?? null;
  const latestMeeting = state.meetingContext?.latestMeeting ?? null;
  const unifiedDrivers = fallbackUnifiedDrivers(state);
  const importantHighlights = buildImportantHighlights({
    unifiedDrivers,
    meetingContext: state.meetingContext,
    recentActivity,
    hasLiveSummary,
  });
  const artifactContextItems =
    hasNarrative && (state.summaryArtifact?.summaryFacts.length ?? 0) > 0
      ? buildNarrativeItemsFromSummaryFacts(
          state.summaryArtifact?.summaryFacts ?? [],
          5,
        )
      : [];
  const contextPoints = hasNarrative
    ? artifactContextItems.length > 0
      ? artifactContextItems.map((item) => item.text)
      : splitSummaryIntoPoints(activeSummary, 5)
    : [];
  const contextItems =
    artifactContextItems.length > 0
      ? artifactContextItems
      : buildNarrativeItemsFromText(contextPoints);
  const livePoints = hasLiveSummary
    ? splitSummaryIntoPoints(state.liveSummary ?? "", 4)
    : [];
  const liveItems = buildNarrativeItemsFromText(livePoints);
  const meetingPoints = splitSummaryIntoPoints(latestMeeting?.summary, 4);
  const meetingItems = buildNarrativeItemsFromText(meetingPoints);
  const executiveSummary = buildExecutiveSummary({
    healthSummary,
    latestMeeting,
    recentActivity,
    meetingPoints,
    hasLiveSummary,
  });
  const compactMetrics = buildCompactMetricItems(recentActivity);
  const collapsedPreview =
    contextItems[0]?.text ??
    liveItems[0]?.text ??
    importantHighlights[0]?.text ??
    executiveSummary;
  const showMeetingSection = Boolean(
    latestMeeting &&
    (meetingPoints.length > 0 ||
      latestMeeting.openObligations > 0 ||
      latestMeeting.blockers.length > 0 ||
      latestMeeting.decisions.length > 0 ||
      latestMeeting.nextSteps.length > 0),
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-bg-primary shadow-[0_18px_40px_color-mix(in_srgb,var(--theme-bg-primary)_12%,transparent)]">
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
        style={{
          backgroundColor: signal.bg,
          borderBottom: `1px solid ${signal.border}`,
        }}
      >
        <Tooltip content={signal.tip} side="bottom">
          <div className="flex items-center gap-2.5">
            <SignalIcon size={16} style={{ color: signal.color }} />
            <span
              className="font-sans text-sm font-semibold"
              style={{ color: signal.color }}
            >
              {signal.label}
            </span>
            <span className="font-mono text-[10px] text-text-secondary">
              {evidenceTierLabel(state.signalEvidenceTier)}
            </span>
          </div>
        </Tooltip>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-secondary">
            {state.lastEventAt
              ? `Updated ${relativeTime(state.lastEventAt)}`
              : "Awaiting recent activity"}
          </span>
          <button
            type="button"
            onClick={() => setShowDetails((current) => !current)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-secondary/70 px-3 py-1.5 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            aria-expanded={showDetails}
          >
            <IconChevronDown
              size={11}
              className={`transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`}
            />
            {showDetails ? "Hide details" : "Show details"}
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className={`${SURFACE_CLASS} p-4`}>
          <SectionHeader
            title="Health Now"
            subtitle="The fastest read on what changed, what matters, and whether this channel needs attention."
          />

          <p className="font-sans text-lg font-bold text-text-primary">
            {state.attentionSummary.title}
          </p>
          <HighlightedText
            text={executiveSummary}
            className="mt-2 block font-body text-base leading-7 text-text-secondary"
            userMap={userMap}
          />

          {compactMetrics.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {compactMetrics.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-border-subtle bg-bg-secondary/35 px-4 py-4"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-tertiary">
                    {item.label}
                  </p>
                  <p className="mt-1.5 font-sans text-base font-bold text-text-primary">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {importantHighlights.length > 0 ? (
          <div className={`${SURFACE_CLASS} p-4`}>
            <SectionHeader
              title="Important Highlights"
              subtitle="Start here. These are the few things most worth knowing before you inspect the deeper Slack context."
            />
            <div className="grid gap-2 xl:grid-cols-2">
              {importantHighlights.map((highlight) => {
                const tone = driverTone(highlight.level);
                return (
                  <div
                    key={highlight.id}
                    className="rounded-lg border px-3 py-3"
                    style={{
                      borderColor: tone.border,
                      backgroundColor: tone.bg,
                    }}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className="font-mono text-xs uppercase tracking-[0.2em] font-semibold"
                        style={{ color: tone.color }}
                      >
                        {highlight.title}
                      </span>
                      <span className="rounded-full border border-border-subtle bg-bg-secondary/65 px-2.5 py-0.5 font-mono text-[11px] text-text-secondary">
                        {highlight.source}
                      </span>
                    </div>
                    <HighlightedText
                      text={highlight.text}
                      className="block font-body text-base leading-7 text-text-primary"
                      userMap={userMap}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {showMeetingSection && latestMeeting ? (
          <div className={`${SURFACE_CLASS} p-4`}>
            <SectionHeader
              title="Latest Meeting"
              subtitle="Meeting context layered into the channel story. Open this only when you want the fuller notes."
              expanded={showMeeting}
              onToggle={() => setShowMeeting((current) => !current)}
              hideLabel="Hide meeting"
              showLabel="Show meeting"
            />

            <div className="flex flex-wrap items-center gap-2">
              <p className="font-sans text-base font-semibold text-text-primary">
                {latestMeeting.title}
              </p>
              <span className="rounded-full border border-border-subtle bg-bg-secondary/45 px-2 py-0.5 font-mono text-[10px] text-text-secondary">
                {formatMeetingSourceLabel(latestMeeting.source)}
              </span>
              <span className="rounded-full border border-border-subtle bg-bg-secondary/45 px-2 py-0.5 font-mono text-[10px] text-text-secondary">
                {latestMeeting.confidence === "medium"
                  ? "Medium confidence"
                  : "High confidence"}
              </span>
              {latestMeeting.meetingSentiment ? (
                <span className="rounded-full border border-border-subtle bg-bg-secondary/45 px-2 py-0.5 font-mono text-[10px] text-text-secondary">
                  {formatMeetingSentiment(latestMeeting.meetingSentiment)}
                </span>
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] text-text-tertiary">
              <span>{relativeTime(latestMeeting.startedAt)}</span>
              <span>·</span>
              <span>
                {latestMeeting.openObligations} open obligation
                {latestMeeting.openObligations === 1 ? "" : "s"}
              </span>
              <span>·</span>
              <span>{latestMeeting.overdueObligations} overdue</span>
            </div>

            {showMeeting ? (
              <>
                {meetingPoints.length > 0 ? (
                  <div className="mt-4">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">
                      Meeting highlights
                    </p>
                    <SummaryNarrative
                      items={meetingItems}
                      userMap={userMap}
                      compact
                    />
                  </div>
                ) : null}

                <div className="mt-4 grid gap-3 xl:grid-cols-3">
                  {latestMeeting.blockers.length > 0 ? (
                    <div className="rounded-lg border border-border-subtle/70 bg-bg-secondary/35 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">
                        Blockers
                      </p>
                      <div className="mt-2 space-y-2">
                        {latestMeeting.blockers.slice(0, 3).map((item) => (
                          <HighlightedText
                            key={item}
                            text={item}
                            className="block font-body text-sm leading-6 text-text-secondary"
                            userMap={userMap}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {latestMeeting.decisions.length > 0 ? (
                    <div className="rounded-lg border border-border-subtle/70 bg-bg-secondary/35 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">
                        Decisions
                      </p>
                      <div className="mt-2 space-y-2">
                        {latestMeeting.decisions.slice(0, 3).map((item) => (
                          <HighlightedText
                            key={item}
                            text={item}
                            className="block font-body text-sm leading-6 text-text-secondary"
                            userMap={userMap}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {latestMeeting.nextSteps.length > 0 ? (
                    <div className="rounded-lg border border-border-subtle/70 bg-bg-secondary/35 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-tertiary">
                        Next steps
                      </p>
                      <div className="mt-2 space-y-2">
                        {latestMeeting.nextSteps.slice(0, 3).map((item) => (
                          <HighlightedText
                            key={item}
                            text={item}
                            className="block font-body text-sm leading-6 text-text-secondary"
                            userMap={userMap}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="mt-3 rounded-lg border border-border-subtle/70 bg-bg-secondary/35 px-3 py-3">
                <HighlightedText
                  text={
                    latestMeeting.blockers[0] ??
                    latestMeeting.nextSteps[0] ??
                    meetingPoints[0] ??
                    "Meeting details are hidden. Open this section when you want the summary, blockers, and next steps."
                  }
                  className="block font-body text-sm leading-6 text-text-secondary"
                  userMap={userMap}
                />
              </div>
            )}
          </div>
        ) : null}

        {!showDetails ? (
          <div className={`${SURFACE_CLASS} p-4`}>
            <SectionHeader
              title="Summary Preview"
              subtitle="A compact preview stays visible while the deeper Slack and meeting sections are hidden."
            />
            <HighlightedText
              text={collapsedPreview}
              className="block font-body text-sm leading-7 text-text-secondary"
              userMap={userMap}
            />
          </div>
        ) : (
          <>
            {threadInsights.length > 0 ? (
              <div className={`${SURFACE_CLASS} p-4`}>
                <SectionHeader
                  title="Thread Signals"
                  subtitle="Surfaced thread pressure and notable moments worth checking before you read the full narrative."
                  meta={`${threadInsights.length} surfaced`}
                />
                <div className="space-y-2">
                  {threadInsights.slice(0, 4).map((insight, index) => {
                    const Icon = THREAD_INSIGHT_ICONS[insight.type];
                    const isCritical = insight.type === "crucial";

                    return (
                      <div
                        key={`${insight.label}-${index}`}
                        className="flex gap-2.5 rounded-lg border border-border-subtle/60 bg-bg-secondary/45 px-3 py-2.5"
                      >
                        <Icon
                          size={13}
                          className="mt-0.5 shrink-0"
                          style={{
                            color: isCritical
                              ? "var(--theme-status-error)"
                              : "var(--theme-text-tertiary)",
                          }}
                        />
                        <div className="min-w-0">
                          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.24em] text-text-secondary">
                            {insight.label}
                          </p>
                          <HighlightedText
                            text={insight.value}
                            className="block font-body text-sm leading-6 text-text-secondary"
                            userMap={userMap}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {hasNarrative ? (
              <div className={`${SURFACE_CLASS} p-4`}>
                <SectionHeader
                  title="Recent Context"
                  subtitle="Rolling Slack context from the default active window."
                  expanded={showContext}
                  onToggle={() => setShowContext((current) => !current)}
                  meta={
                    state.activeWindowSummaryUpdatedAt
                      ? `Updated ${relativeTime(state.activeWindowSummaryUpdatedAt)}`
                      : null
                  }
                  hideLabel="Hide context"
                  showLabel="Show context"
                />
                {showContext ? (
                  <SummaryNarrative
                    items={contextItems}
                    channelId={state.channelId}
                    userMap={userMap}
                  />
                ) : contextItems[0] ? (
                  <HighlightedText
                    text={contextItems[0].text}
                    className="block font-body text-sm leading-7 text-text-secondary"
                    userMap={userMap}
                  />
                ) : (
                  <p className="font-body text-sm leading-7 text-text-secondary">
                    Recent context is hidden.
                  </p>
                )}
              </div>
            ) : (
              <div className={`${SURFACE_CLASS} p-4`}>
                <SectionHeader
                  title="Recent Context"
                  subtitle="The rolling Slack context layer for this channel."
                />
                <p className="font-body text-sm leading-7 text-text-secondary">
                  {isRiskOnlyChannel
                    ? state.runningSummary
                    : "Building an AI summary from recent channel history. This area will fill in as more analyzed activity is available."}
                </p>
              </div>
            )}

            <div className={`${SURFACE_CLASS} p-4`}>
              <SectionHeader
                title="Live Conversation"
                subtitle={
                  hasLiveSummary
                    ? "The newest Slack movement after the main rolling summary."
                    : "No fresh live summary is available right now, so the recent-activity summary above carries the freshness story."
                }
                meta={
                  liveSummaryTimestamp
                    ? `Updated ${relativeTime(liveSummaryTimestamp)}`
                    : null
                }
              />
              {hasLiveSummary ? (
                <SummaryNarrative
                  items={liveItems}
                  userMap={userMap}
                  compact
                />
              ) : (
                <p className="font-body text-sm leading-7 text-text-secondary">
                  {recentActivity
                    ? `${numberFormatter.format(recentActivity.messageCount)} message${recentActivity.messageCount === 1 ? "" : "s"}, ${numberFormatter.format(recentActivity.activeThreads)} active ${pluralize(recentActivity.activeThreads, "thread")}, and ${numberFormatter.format(recentActivity.openFollowUps)} open follow-up${recentActivity.openFollowUps === 1 ? "" : "s"} were seen in the last ${recentActivity.windowHours} hours.`
                    : "Waiting for enough fresh Slack activity to build a compact live update."}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
