"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { IconChevronDown } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui";
import type { TimelineDataPoint, HealthCounts } from "@/lib/types";
import { parseDateValue } from "@/lib/utils/formatters";

interface SentimentTimelineProps {
  data: TimelineDataPoint[] | undefined;
  isLoading: boolean;
  healthCounts?: HealthCounts;
}

interface SimplifiedPoint {
  timestamp: string;
  positive: number;
  neutral: number;
  negative: number;
  escalation: number;
  activity: number;
  highRiskCount: number;
  avgConfidence: number;
}

const SIGNAL_LAYERS = [
  { key: "negative" as const, color: "var(--theme-chart-negative)", label: "Negative" },
  { key: "neutral" as const, color: "var(--theme-chart-neutral)", label: "Neutral" },
  { key: "positive" as const, color: "var(--theme-chart-positive)", label: "Positive" },
];

const subscribe = () => () => {};

function simplifyPoint(p: TimelineDataPoint): SimplifiedPoint {
  const positive = p.joy;
  const negative = p.anger + p.disgust + p.sadness + p.fear;
  const neutral = p.neutral + p.surprise;
  const total = positive + negative + neutral || 1;

  return {
    timestamp: p.timestamp,
    positive: positive / total,
    neutral: neutral / total,
    negative: negative / total,
    escalation: p.total > 0 ? p.highRiskCount / p.total : 0,
    activity: p.total,
    highRiskCount: p.highRiskCount,
    avgConfidence: p.avgConfidence,
  };
}

function formatXTick(ts: string): string {
  const parsed = parseDateValue(ts);
  if (parsed === null) return "";
  const d = new Date(parsed);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; payload: SimplifiedPoint }>;
  label?: string;
}) {
  if (!active || !payload || !label) return null;
  const parsed = parseDateValue(label);
  if (parsed === null) return null;
  const d = new Date(parsed);
  const dateStr = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
  });

  // Show stacked signals + escalation separately
  const stacked = payload.filter((e) => e.name !== "escalation");
  const esc = payload.find((e) => e.name === "escalation");
  const point = payload[0]?.payload;

  return (
    <div className="rounded-lg border border-border-default bg-bg-elevated p-3 shadow-lg">
      <p className="mb-2 font-mono text-[10px] text-text-secondary">{dateStr}</p>
      {point && (
        <div className="mb-2 space-y-1 border-b border-border-default/50 pb-2">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[10px] text-text-secondary">Analyzed messages</span>
            <span className="font-mono text-[10px] text-text-primary">{point.activity}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[10px] text-text-secondary">AI confidence</span>
            <span className="font-mono text-[10px] text-text-primary">
              {Math.round(point.avgConfidence * 100)}%
            </span>
          </div>
        </div>
      )}
      {stacked
        .slice()
        .reverse()
        .map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-mono text-[10px] text-text-secondary capitalize">{entry.name}</span>
            </div>
            <span className="font-mono text-[10px] text-text-primary">
              {Math.round(entry.value * 100)}%
            </span>
          </div>
        ))}
      {esc && (
        <div className="mt-1.5 pt-1.5 border-t border-border-default/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--theme-chart-escalation)" }} />
            <span className="font-mono text-[10px] text-text-secondary">Escalation Risk</span>
          </div>
          <span className="font-mono text-[10px] text-text-primary">
            {point ? `${point.highRiskCount}/${point.activity} high-risk` : `${Math.round(Number(esc.value) * 100)}%`}
          </span>
        </div>
      )}
    </div>
  );
}

function formatCompactPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function getDominantMood(
  data: TimelineDataPoint[],
  healthCounts?: HealthCounts,
): { label: string; tone: string } {
  const totals = data.reduce(
    (acc, point) => {
      acc.positive += point.joy;
      acc.neutral += point.neutral + point.surprise;
      acc.negative += point.anger + point.disgust + point.sadness + point.fear;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 },
  );

  // Alerts override mood assessment — if there are active high-severity alerts,
  // the channel needs attention regardless of emotion distribution
  const hc = healthCounts;
  if (hc && (hc.highSeverityAlertCount >= 1 || hc.highRiskMessageCount >= 1 || hc.flaggedMessageCount >= 5)) {
    return { label: "Escalating issues", tone: "Needs immediate attention" };
  }
  if (hc && (hc.openAlertCount >= 1 || hc.flaggedMessageCount >= 1)) {
    return { label: "Active alerts", tone: "Needs attention" };
  }

  if (totals.negative >= totals.positive && totals.negative >= totals.neutral) {
    return { label: "Mostly negative", tone: "Needs attention" };
  }
  if (totals.positive >= totals.neutral) {
    return { label: "Mostly positive", tone: "Healthy tone" };
  }
  return { label: "Mostly neutral", tone: "Steady tone" };
}

export function SentimentTimeline({ data, isLoading, healthCounts }: SentimentTimelineProps) {
  const [collapsed, setCollapsed] = useState(false);
  const canRenderChart = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const simplified = useMemo(() => {
    if (!data) return [];
    const step = Math.max(1, Math.floor(data.length / 48));
    return data.filter((_, i) => i % step === 0).map(simplifyPoint);
  }, [data]);

  const summary = useMemo(() => {
    if (!data || data.length === 0) return null;

    const totalMessages = data.reduce((sum, point) => sum + point.total, 0);
    const totalHighRisk = data.reduce((sum, point) => sum + point.highRiskCount, 0);
    const weightedConfidence = totalMessages === 0
      ? 0
      : data.reduce((sum, point) => sum + point.avgConfidence * point.total, 0) / totalMessages;
    const dominantMood = getDominantMood(data, healthCounts);

    // Include alert-sourced high-risk count for a more accurate picture
    const alertHighRisk = healthCounts?.highSeverityAlertCount ?? 0;
    const combinedHighRisk = totalHighRisk + alertHighRisk;

    return {
      totalMessages,
      totalHighRisk: combinedHighRisk,
      weightedConfidence,
      escalationShare: totalMessages === 0 ? 0 : combinedHighRisk / totalMessages,
      dominantMood,
    };
  }, [data, healthCounts]);

  if (isLoading || !data) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-5">
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="h-[150px] rounded-lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-5">
        <h2 className="mb-2 font-sans text-sm font-semibold text-text-primary">
          Sentiment Timeline
        </h2>
        <p className="font-body text-sm text-text-secondary">
          No analyzed activity yet. New Slack messages will appear here after AI analysis completes.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary/60">
      {/* Header with collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-5 py-4"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-3">
          <h2 className="font-sans text-sm font-semibold text-text-primary">
            Sentiment Timeline
          </h2>
          {/* Legend dots */}
          <div className="hidden sm:flex items-center gap-3">
            {SIGNAL_LAYERS.map((l) => (
              <div key={l.key} className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="font-mono text-[9px] text-text-secondary">{l.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--theme-chart-escalation)" }} />
              <span className="font-mono text-[9px] text-text-secondary">Escalation risk</span>
            </div>
          </div>
        </div>
        <IconChevronDown
          size={14}
          className={`text-text-tertiary transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
        />
      </button>

      {/* Chart body */}
      {!collapsed && (
        <div className="px-5 pb-4">
          {summary && (
            <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1">
              <span className="font-mono text-[10px] text-text-secondary">
                <span className="text-text-primary font-semibold">{summary.totalMessages}</span> msgs
              </span>
              <span className="font-mono text-[10px] text-text-secondary">
                <span className="text-text-primary font-semibold">{summary.totalHighRisk}</span> high-risk ({formatCompactPercent(summary.escalationShare)})
              </span>
              <span className="font-mono text-[10px] text-text-secondary">
                {summary.dominantMood.label} &middot; <span className="text-text-primary">{summary.dominantMood.tone}</span>
              </span>
              <span className="font-mono text-[10px] text-text-secondary">
                Confidence: <span className="text-text-primary font-semibold">{formatCompactPercent(summary.weightedConfidence)}</span>
              </span>
            </div>
          )}

          <div className="h-[150px]">
            {canRenderChart ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={150}>
                <AreaChart data={simplified} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatXTick}
                    tick={{ fontSize: 10, fill: "var(--theme-chart-axis)" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--theme-chart-axis)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                    domain={[0, 1]}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "var(--theme-chart-cursor)", strokeWidth: 1 }}
                  />
                  {SIGNAL_LAYERS.map((layer) => (
                    <Area
                      key={layer.key}
                      type="monotone"
                      dataKey={layer.key}
                      stackId="1"
                      stroke={layer.color}
                      fill={layer.color}
                      fillOpacity={0.5}
                      strokeWidth={0}
                    />
                  ))}
                  {/* Escalation risk overlay — separate from stack */}
                  <Area
                    type="monotone"
                    dataKey="escalation"
                    stroke="var(--theme-chart-escalation)"
                    fill="none"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-lg border border-border-subtle bg-bg-primary/20" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
