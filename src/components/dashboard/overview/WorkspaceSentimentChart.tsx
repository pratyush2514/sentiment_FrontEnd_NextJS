"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { Skeleton } from "@/components/ui";
import type { TrendPoint } from "@/lib/hooks/useSentimentTrends";

interface TrendRangeOption {
  label: string;
  value: number;
}

interface WorkspaceSentimentChartProps {
  data: TrendPoint[] | undefined;
  isLoading: boolean;
  trendRange?: number;
  onTrendRangeChange?: (range: number) => void;
  trendRanges?: readonly TrendRangeOption[];
}

const subscribe = () => () => {};

function formatXTick(ts: string): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; payload: TrendPoint & { score: number } }>;
  label?: string;
}) {
  if (!active || !payload || !label) return null;
  const d = new Date(label);
  if (isNaN(d.getTime())) return null;
  const dateStr = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const point = payload[0]?.payload;

  return (
    <div className="rounded-lg border border-border-default bg-bg-elevated px-3 py-2 shadow-xl shadow-black/40">
      <p className="mb-2 font-mono text-[10px] text-text-tertiary">{dateStr}</p>
      {point && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--theme-accent)" }} />
              <span className="font-mono text-[10px] text-text-secondary">Score</span>
            </span>
            <span className="font-mono text-[10px] font-semibold text-text-primary">
              {point.score?.toFixed(2) ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--theme-chart-positive)" }} />
              <span className="font-mono text-[10px] text-text-secondary">Positive</span>
            </span>
            <span className="font-mono text-[10px] text-text-primary">
              {Math.round(point.positive * 100)}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--theme-chart-neutral)" }} />
              <span className="font-mono text-[10px] text-text-secondary">Neutral</span>
            </span>
            <span className="font-mono text-[10px] text-text-primary">
              {Math.round(point.neutral * 100)}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--theme-chart-negative)" }} />
              <span className="font-mono text-[10px] text-text-secondary">Negative</span>
            </span>
            <span className="font-mono text-[10px] text-text-primary">
              {Math.round(point.negative * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkspaceSentimentChart({
  data,
  isLoading,
  trendRange,
  onTrendRangeChange,
  trendRanges,
}: WorkspaceSentimentChartProps) {
  const canRenderChart = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((p) => ({
      ...p,
      score: p.positive * 1.0 + p.neutral * 0.5 + p.negative * 0.0,
    }));
  }, [data]);

  // Find the alert zone ranges (consecutive points below 0.4)
  const alertZones = useMemo(() => {
    if (!chartData.length) return [];
    const zones: { x1: string; x2: string }[] = [];
    let zoneStart: string | null = null;

    for (let i = 0; i < chartData.length; i++) {
      const pt = chartData[i];
      if (pt.score < 0.4) {
        if (!zoneStart) zoneStart = pt.timestamp;
        if (i === chartData.length - 1) {
          zones.push({ x1: zoneStart, x2: pt.timestamp });
        }
      } else if (zoneStart) {
        zones.push({ x1: zoneStart, x2: chartData[i - 1].timestamp });
        zoneStart = null;
      }
    }
    return zones;
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-bg-secondary/50 border border-border-subtle p-5">
        <Skeleton className="mb-4 h-4 w-36" />
        <Skeleton className="h-[140px] rounded-lg" />
        <div className="mt-3 flex gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl bg-bg-secondary/50 border border-border-subtle p-5">
        <h3 className="font-sans text-sm font-semibold text-text-primary">
          Sentiment Timeline
        </h3>
        <p className="font-body text-xs text-text-tertiary mt-0.5 mb-4">
          Composite sentiment score over time across your workspace
        </p>
        <div className="flex h-[100px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-subtle bg-bg-primary/20">
          <p className="font-sans text-sm text-text-secondary">
            No trend data yet
          </p>
          <p className="font-body text-xs text-text-tertiary">
            Sentiment trends will appear here as messages are analyzed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-bg-secondary/50 border border-border-subtle p-4">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-sans text-sm font-semibold text-text-primary">
              Sentiment Timeline
            </h3>
            <p className="font-body text-xs text-text-tertiary mt-0.5">
              Composite sentiment score over time across your workspace
            </p>
          </div>
          {/* Time range selector */}
          {trendRanges && onTrendRangeChange && (
            <div className="flex items-center gap-0.5 rounded-lg bg-bg-tertiary/40 p-0.5">
              {trendRanges.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => onTrendRangeChange(r.value)}
                  aria-label={`Show ${r.label} trend`}
                  aria-pressed={trendRange === r.value}
                  className={[
                    "rounded-md px-2.5 py-1 font-mono text-xs transition-colors",
                    trendRange === r.value
                      ? "bg-bg-primary text-text-primary shadow-sm font-medium"
                      : "text-text-tertiary hover:text-text-secondary",
                  ].join(" ")}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="font-mono text-xs text-text-tertiary">Score</span>
          </span>
          {alertZones.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded" style={{ backgroundColor: "color-mix(in srgb, var(--theme-status-error) 35%, transparent)" }} />
              <span className="font-mono text-xs text-text-tertiary">Alert zone</span>
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[140px]" role="img" aria-label="Sentiment score timeline chart showing trend over time">
        {canRenderChart ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={140}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="sentimentFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--theme-accent)" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="var(--theme-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>

              {alertZones.map((zone, i) => (
                <ReferenceArea
                  key={i}
                  x1={zone.x1}
                  x2={zone.x2}
                  fill="var(--theme-chart-alert-fill)"
                  stroke="var(--theme-chart-alert-stroke)"
                  strokeWidth={1}
                  label={undefined}
                />
              ))}

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
                domain={[0, 1]}
                ticks={[0, 0.25, 0.5, 0.75, 1.0]}
                tickFormatter={(v: number) => v.toFixed(2)}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "var(--theme-chart-cursor)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--theme-accent)"
                fill="url(#sentimentFill)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "var(--theme-accent)", stroke: "var(--theme-bg-primary)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-lg border border-border-subtle bg-bg-primary/20" />
        )}
      </div>
    </div>
  );
}
