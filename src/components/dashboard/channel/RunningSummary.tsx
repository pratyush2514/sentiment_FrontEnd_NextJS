"use client";

import { useState } from "react";
import {
  IconShieldCheck,
  IconAlertTriangle,
  IconAlertOctagon,
  IconChevronDown,
  IconUser,
  IconTrendingUp,
  IconFlame,
  IconMoodNeutral,
} from "@tabler/icons-react";
import { Skeleton, HighlightedText, Tooltip } from "@/components/ui";
import { relativeTime } from "@/lib/utils/formatters";
import { isPlaceholderSummary } from "@/lib/utils/summary";
import type {
  ChannelState,
  ChannelSignal,
  ChannelInsight,
  ThreadInsight,
} from "@/lib/types";

interface RunningSummaryProps {
  state: ChannelState | undefined;
  isLoading: boolean;
  threadInsights?: ThreadInsight[];
}

const SIGNAL_CONFIG: Record<
  ChannelSignal,
  { label: string; tip: string; color: string; bg: string; border: string; icon: typeof IconShieldCheck }
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

const INSIGHT_ICONS: Record<ChannelInsight["type"], typeof IconFlame> = {
  concern: IconFlame,
  tension: IconAlertTriangle,
  trend: IconTrendingUp,
  actor: IconUser,
  neutral: IconMoodNeutral,
};

const THREAD_INSIGHT_ICONS: Record<ThreadInsight["type"], typeof IconFlame> = {
  concern: IconFlame,
  tension: IconAlertTriangle,
  trend: IconTrendingUp,
  actor: IconUser,
  neutral: IconMoodNeutral,
  crucial: IconFlame,
};

const numberFormatter = new Intl.NumberFormat("en-US");

export function RunningSummary({ state, isLoading, threadInsights = [] }: RunningSummaryProps) {
  const [showNarrative, setShowNarrative] = useState(false);

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
      <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-5">
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
  const hasNarrative = !isRiskOnlyChannel && !isPlaceholderSummary(state.runningSummary);
  const pendingWindowCount = state.messageDispositionCounts.inFlight;
  const storedWithoutDeepAnalysisCount =
    state.messageDispositionCounts.storedWithoutDeepAnalysis;
  const contextOnlyCount = state.messageDispositionCounts.contextOnly;
  const ignoredCount = state.messageDispositionCounts.routineAcknowledgments;
  const heuristicIncidentCount =
    state.messageDispositionCounts.heuristicIncidentSignals;
  const relatedIncidents = state.relatedIncidents ?? [];
  const firstRelatedIncident = relatedIncidents[0];
  const relatedIncidentInsight =
    firstRelatedIncident
      ? {
          label: "Related incident context",
          value:
            relatedIncidents.length === 1
              ? `A related incident from #${firstRelatedIncident.sourceChannelName} was mentioned in this channel${firstRelatedIncident.blocksLocalWork ? " and may affect local work." : "."}`
              : `${numberFormatter.format(relatedIncidents.length)} related incidents were referenced from other channels in this window.`,
          type: "neutral" as const,
        }
      : null;
  const baseInsights = state.insights.length > 0
    ? state.insights
    : [
        {
          label: "Intelligence status",
          value: isRiskOnlyChannel
            ? "Risk-only monitoring is active here. PulseBoard will stay quiet unless severe escalation or policy-risk appears."
            : hasNarrative
            ? state.signal === "stable"
              ? "Conversation summary is available and no meaningful active risk is present right now."
              : "Conversation summary is available and recent activity still needs attention."
            : "AI is building a fuller summary from the channel history. Recent sentiment and decisions will appear here shortly.",
          type: "neutral" as const,
        },
      ];
  const insights = relatedIncidentInsight
    ? [relatedIncidentInsight, ...baseInsights]
    : baseInsights;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 overflow-hidden">
      {/* Signal bar — the 5-second answer */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-3"
        style={{ backgroundColor: signal.bg, borderBottom: `1px solid ${signal.border}` }}
      >
        <Tooltip content={signal.tip} side="bottom">
          <div className="flex items-center gap-2.5">
            <SignalIcon size={16} style={{ color: signal.color }} />
            <span className="font-sans text-sm font-semibold" style={{ color: signal.color }}>
              {signal.label}
            </span>
            <span className="font-mono text-[10px] text-text-secondary">
              {Math.round(state.signalConfidence * 100)}% confidence
            </span>
          </div>
        </Tooltip>
        <span className="font-mono text-[10px] text-text-secondary">
          {state.lastEventAt ? `Updated ${relativeTime(state.lastEventAt)}` : "Awaiting recent activity"}
        </span>
      </div>

      {/* Structured insights */}
      <div className="px-5 py-4 space-y-3">
        <h2 className="font-sans text-xs font-semibold text-text-primary uppercase tracking-wider">
          Channel Intelligence
        </h2>
        <div className="space-y-2.5">
          {insights.map((insight, i) => {
            const Icon = INSIGHT_ICONS[insight.type];
            const isWarning = insight.type === "concern" || insight.type === "tension";
            return (
              <div key={i} className="flex gap-2.5">
                <Icon
                  size={13}
                  className="mt-0.5 shrink-0"
                  style={{ color: isWarning ? signal.color : "var(--theme-text-tertiary)" }}
                />
                <div className="min-w-0">
                  <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                    {insight.label}
                  </p>
                  <HighlightedText
                    text={insight.value}
                    className="block font-body text-xs leading-relaxed text-text-secondary"
                    userMap={userMap}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {state.windowStats ? (
          <div className="rounded-lg border border-border-subtle/70 bg-bg-primary/35 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                Coverage window
              </p>
              <span className="font-mono text-[10px] text-text-tertiary">
                Rolling {state.windowStats.analysisWindowDays} day{state.windowStats.analysisWindowDays === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-md border border-border-subtle/60 bg-bg-secondary/40 px-3 py-2.5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                  Imported history
                </p>
                <p className="mt-1 font-sans text-sm font-semibold text-text-primary">
                  {numberFormatter.format(state.messageCount)}
                </p>
              </div>
              <div className="rounded-md border border-border-subtle/60 bg-bg-secondary/40 px-3 py-2.5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                  Messages in window
                </p>
                <p className="mt-1 font-sans text-sm font-semibold text-text-primary">
                  {numberFormatter.format(state.windowStats.messageCountInWindow)}
                </p>
              </div>
              <div className="rounded-md border border-border-subtle/60 bg-bg-secondary/40 px-3 py-2.5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                  Deep AI analyzed
                </p>
                <p className="mt-1 font-sans text-sm font-semibold text-text-primary">
                  {numberFormatter.format(state.messageDispositionCounts.deepAiAnalyzed)}
                </p>
              </div>
              <div className="rounded-md border border-border-subtle/60 bg-bg-secondary/40 px-3 py-2.5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                  Stored without deep analysis
                </p>
                <p className="mt-1 font-sans text-sm font-semibold text-text-primary">
                  {numberFormatter.format(storedWithoutDeepAnalysisCount)}
                </p>
              </div>
            </div>
            <p className="mt-3 font-body text-xs leading-relaxed text-text-secondary">
              Imported history shows everything PulseBoard has loaded for this channel. The rolling window is the recent slice used for current intelligence, and messages stored without deep analysis still contribute thread and summary context without forcing one-by-one AI sentiment calls.
            </p>
            {storedWithoutDeepAnalysisCount > 0 ? (
              <p className="mt-2 font-body text-xs leading-relaxed text-text-secondary">
                Breakdown: {numberFormatter.format(contextOnlyCount)} context signal
                {contextOnlyCount === 1 ? "" : "s"}, {numberFormatter.format(ignoredCount)} routine/acknowledgment
                {ignoredCount === 1 ? "" : "s"}
                {heuristicIncidentCount > 0
                  ? `, ${numberFormatter.format(heuristicIncidentCount)} heuristic incident signal${heuristicIncidentCount === 1 ? "" : "s"}`
                  : ""}.
              </p>
            ) : null}
            {pendingWindowCount > 0 ? (
              <p className="mt-2 font-body text-xs leading-relaxed text-text-secondary">
                {numberFormatter.format(pendingWindowCount)} message{pendingWindowCount === 1 ? "" : "s"} in the current window are still processing and may update this summary shortly.
              </p>
            ) : null}
          </div>
        ) : null}

        {threadInsights.length > 0 ? (
          <div className="rounded-lg border border-border-subtle/70 bg-bg-primary/35 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                Surfaced threads
              </p>
              <span className="font-mono text-[10px] text-text-tertiary">
                {threadInsights.length} surfaced
              </span>
            </div>
            <div className="space-y-2">
              {threadInsights.slice(0, 4).map((insight, index) => {
                const Icon = THREAD_INSIGHT_ICONS[insight.type];
                const isCritical = insight.type === "crucial";
                return (
                  <div key={`${insight.label}-${index}`} className="flex gap-2.5">
                    <Icon
                      size={13}
                      className="mt-0.5 shrink-0"
                      style={{ color: isCritical ? "var(--theme-status-error)" : "var(--theme-text-tertiary)" }}
                    />
                    <div className="min-w-0">
                      <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                        {insight.label}
                      </p>
                      <HighlightedText
                        text={insight.value}
                        className="block font-body text-xs leading-relaxed text-text-secondary"
                        userMap={userMap}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Collapsible full narrative */}
        {hasNarrative ? (
          <>
            <button
              onClick={() => setShowNarrative(!showNarrative)}
              className="flex items-center gap-1 pt-1 font-mono text-[10px] font-medium text-text-secondary hover:text-text-primary transition-colors"
              aria-expanded={showNarrative}
            >
              <IconChevronDown
                size={11}
                className={`transition-transform duration-200 ${showNarrative ? "rotate-180" : ""}`}
              />
              {showNarrative ? "Hide full summary" : "View full summary"}
            </button>
            {showNarrative && (
              <div className="mt-1 rounded-md border border-border-subtle/70 bg-bg-tertiary/25 p-3.5">
                <HighlightedText
                  text={state.runningSummary}
                  className="font-body text-sm leading-7 text-text-primary"
                  userMap={userMap}
                />
              </div>
            )}
          </>
        ) : isRiskOnlyChannel ? (
          <div className="rounded-md border border-border-subtle/70 bg-bg-tertiary/25 p-3.5 mt-1">
            <p className="font-body text-sm leading-7 text-text-secondary">
              {state.runningSummary}
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-border-subtle/70 bg-bg-tertiary/25 p-3.5 mt-1">
            <p className="font-body text-sm leading-7 text-text-secondary">
              Building an AI summary from the channel history. The live timeline and flagged messages will update automatically as analysis completes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
