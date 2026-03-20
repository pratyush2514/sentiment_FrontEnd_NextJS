"use client";

import type { CSSProperties } from "react";
import {
  IconActivity,
  IconAlertTriangle,
  IconHeartbeat,
  IconMoodSmile,
} from "@tabler/icons-react";

import { WorkspaceSentimentChart } from "@/components/dashboard/overview/WorkspaceSentimentChart";
import { Card, Logo, MiniSparkline, StatCard } from "@/components/primitives";
import { dashboardOverviewFixture } from "@/features/dashboard";

const healthToneMap = {
  healthy: "var(--theme-status-success)",
  attention: "var(--theme-status-warning)",
  "at-risk": "var(--theme-status-error)",
} as const;

const heroPreviewShellStyle: CSSProperties = {
  boxShadow: "var(--theme-shadow-panel)",
  background:
    "linear-gradient(180deg, color-mix(in srgb, var(--theme-surface) 98%, transparent) 0%, color-mix(in srgb, var(--theme-surface-secondary) 100%, transparent) 100%)",
};

const heroPreviewSidebarStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, color-mix(in srgb, var(--theme-bg-tertiary) 92%, var(--theme-accent) 8%) 0%, color-mix(in srgb, var(--theme-bg-tertiary) 96%, transparent) 100%)",
  boxShadow: "inset -1px 0 0 color-mix(in srgb, var(--theme-border-default) 55%, transparent)",
};

const statCards = [
  {
    label: "Active Channels",
    value: String(dashboardOverviewFixture.overview.activeChannels),
    icon: IconActivity,
    iconColor: "var(--theme-accent)",
  },
  {
    label: "Avg. Sentiment",
    value: dashboardOverviewFixture.overview.avgSentiment.toFixed(2),
    icon: IconMoodSmile,
    iconColor: "var(--theme-status-success)",
  },
  {
    label: "Escalation Alerts",
    value: String(dashboardOverviewFixture.overview.alerts24h),
    icon: IconAlertTriangle,
    iconColor: "var(--theme-status-warning)",
  },
  {
    label: "Team Health",
    value: `${dashboardOverviewFixture.overview.teamHealth}%`,
    icon: IconHeartbeat,
    iconColor: "var(--theme-accent)",
  },
] as const;

export function HeroDashboard() {
  const channels = dashboardOverviewFixture.channels;
  const alerts = dashboardOverviewFixture.alerts.slice(0, 2);

  return (
    <div
      className="overflow-hidden rounded-2xl bg-bg-secondary"
      style={heroPreviewShellStyle}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 border-b border-border-subtle bg-bg-tertiary/65 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
        </div>
        <Logo className="pointer-events-none ml-1" />
        <div className="ml-auto hidden items-center rounded-radius-full border border-border-subtle bg-bg-primary/65 px-3 py-1.5 sm:flex">
          <span className="font-mono text-[10px] text-text-tertiary">
            Search channels...
          </span>
        </div>
        <div className="h-8 w-8 rounded-full border border-border-subtle bg-bg-primary/80" />
      </div>

      <div className="flex">
        <aside
          className="hidden w-[220px] shrink-0 px-3 py-4 md:block"
          style={heroPreviewSidebarStyle}
        >
          <p className="px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
            Live channels
          </p>
          <div className="mt-3 space-y-1.5">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={[
                  "flex items-center gap-2 rounded-radius-md px-2 py-2",
                  channel.health === "at-risk" ? "bg-bg-primary/55" : "bg-transparent",
                ].join(" ")}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: healthToneMap[channel.health] }}
                />
                <span className="truncate font-body text-sm text-text-secondary">
                  #{channel.name}
                </span>
              </div>
            ))}
          </div>

          <Card elevation="flat" padding="compact" className="mt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
              Attention
            </p>
            <div className="mt-3 space-y-2.5">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-radius-md border border-anger/15 bg-anger/8 px-3 py-2"
                >
                  <p className="font-mono text-[10px] uppercase tracking-wide text-anger">
                    {alert.severity} priority
                  </p>
                  <p className="mt-1 font-body text-[11px] leading-relaxed text-text-secondary">
                    {alert.title}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </aside>

        <div className="min-w-0 flex-1 p-4 md:p-5">
          <div
            className="overflow-hidden rounded-radius-lg border border-border-subtle"
            style={{ background: "var(--color-border-subtle)" }}
          >
            <div className="grid grid-cols-2 gap-px md:grid-cols-4">
              {statCards.map((stat) => (
                <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  iconColor={stat.iconColor}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_320px]">
            <WorkspaceSentimentChart
              data={dashboardOverviewFixture.trends}
              isLoading={false}
            />
            <Card elevation="flat" padding="default" className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans text-heading-sm font-semibold text-text-primary">
                    Flagged Messages
                  </h3>
                  <p className="mt-1 font-body text-caption text-text-tertiary">
                    Recent signals that need human review.
                  </p>
                </div>
                <span className="rounded-radius-full bg-anger/12 px-2 py-1 font-mono text-badge text-anger">
                  {alerts.length}
                </span>
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-radius-md border border-border-subtle bg-bg-primary/55 px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-badge text-text-tertiary">
                          {alert.channelName}
                        </p>
                        <p className="mt-1 font-sans text-sm font-semibold text-text-primary">
                          {alert.title}
                        </p>
                      </div>
                      <span
                        className="rounded-radius-full px-2 py-1 font-mono text-badge"
                        style={{
                          color:
                            alert.severity === "high"
                              ? "var(--theme-status-error)"
                              : "var(--theme-status-warning)",
                          backgroundColor:
                            alert.severity === "high"
                              ? "color-mix(in srgb, var(--theme-status-error) 12%, transparent)"
                              : "color-mix(in srgb, var(--theme-status-warning) 14%, transparent)",
                        }}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <p className="mt-2 font-body text-[11px] leading-relaxed text-text-secondary">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card elevation="flat" padding="default" className="mt-4">
            <div className="mb-group flex items-end justify-between gap-4">
              <div>
                <h3 className="font-sans text-heading-sm font-semibold text-text-primary">
                  Channel Health
                </h3>
                <p className="mt-1 font-body text-caption text-text-tertiary">
                  A compact operational snapshot built from the same dashboard data.
                </p>
              </div>
              <span className="font-mono text-badge uppercase tracking-wider text-text-tertiary">
                Top channels
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between gap-3 rounded-radius-md border border-border-subtle bg-bg-primary/45 px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: healthToneMap[channel.health] }}
                      />
                      <p className="truncate font-body text-sm font-semibold text-text-primary">
                        #{channel.name}
                      </p>
                    </div>
                    <p className="mt-1 font-mono text-badge text-text-tertiary">
                      {channel.messageCount} msgs
                    </p>
                  </div>
                  <MiniSparkline
                    data={channel.sparklineData ?? [0, 0]}
                    color={healthToneMap[channel.health]}
                    width={74}
                    height={24}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
