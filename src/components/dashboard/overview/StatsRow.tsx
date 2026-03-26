"use client";

import {
  IconActivity,
  IconMoodSmile,
  IconAlertTriangle,
  IconHeartbeat,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui";
import type { WorkspaceOverview } from "@/lib/types";

interface StatsRowProps {
  data: WorkspaceOverview | undefined;
  isLoading: boolean;
}

const STAT_CONFIGS = [
  {
    key: "activeChannels" as const,
    label: "Active Channels",
    subtitle: "Being monitored",
    icon: IconActivity,
    iconColor: "var(--theme-accent)",
    format: (v: number) => v.toString(),
  },
  {
    key: "avgSentiment" as const,
    label: "Avg. Sentiment",
    subtitle: "Across all channels",
    icon: IconMoodSmile,
    iconColor: "var(--theme-status-success)",
    format: (v: number) => v.toFixed(2),
  },
  {
    key: "alerts24h" as const,
    label: "Escalation Alerts",
    subtitle: "In the last 24h",
    icon: IconAlertTriangle,
    iconColor: "var(--theme-status-warning)",
    format: (v: number) => v.toString(),
  },
  {
    key: "teamHealth" as const,
    label: "Team Health",
    subtitle: "Overall score",
    icon: IconHeartbeat,
    iconColor: "var(--theme-accent)",
    format: (v: number) => `${v}%`,
  },
];

export function StatsRow({ data, isLoading }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-px md:grid-cols-4 rounded-xl overflow-hidden border border-border-subtle" style={{ background: "var(--color-border-subtle)" }}>
      {STAT_CONFIGS.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.key}
            className="relative bg-bg-primary px-5 py-5 flex flex-col gap-2"
          >
            {/* Label + icon */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-text-secondary leading-none font-medium">
                  {stat.label}
                </span>
                <p className="font-body text-[11px] text-text-tertiary mt-0.5">
                  {stat.subtitle}
                </p>
              </div>
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ backgroundColor: `color-mix(in srgb, ${stat.iconColor} 16%, transparent)` }}
              >
                <Icon size={14} style={{ color: stat.iconColor }} />
              </div>
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-2">
              {isLoading || !data ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <span className="font-sans text-[32px] font-black tracking-tight text-text-primary leading-none">
                  {stat.format(data[stat.key])}
                </span>
              )}
            </div>

            {/* Bottom accent line */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[2px] opacity-25"
              style={{ background: `linear-gradient(to right, transparent, ${stat.iconColor}, transparent)` }}
            />
          </div>
        );
      })}
    </div>
  );
}
