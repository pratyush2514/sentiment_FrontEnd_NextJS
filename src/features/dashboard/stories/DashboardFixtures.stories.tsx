import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  dashboardChannelDetailFixture,
  dashboardFollowUpActionFixtures,
  dashboardLandingAlignmentPreviewFixture,
  dashboardOverviewFixture,
} from "../fixtures";

function DashboardFixturesPreview() {
  const { overview, channels, alerts } = dashboardOverviewFixture;

  return (
    <div className="space-y-6 rounded-2xl border border-border-subtle bg-bg-primary p-6 text-text-primary">
      <header className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
          Dashboard fixture preview
        </p>
        <h1 className="font-sans text-xl font-semibold">
          {dashboardLandingAlignmentPreviewFixture.title}
        </h1>
        <p className="max-w-2xl font-body text-sm text-text-secondary">
          {dashboardLandingAlignmentPreviewFixture.subtitle}
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <Metric label="Active channels" value={overview.activeChannels} />
        <Metric label="Alerts 24h" value={overview.alerts24h} />
        <Metric label="Team health" value={`${overview.teamHealth}%`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Channels">
          <div className="space-y-2">
            {channels.map((channel) => (
              <Row key={channel.id}>
                <div className="min-w-0">
                  <p className="font-mono text-xs text-text-primary">{channel.name}</p>
                  <p className="font-mono text-[10px] text-text-tertiary">
                    {channel.conversationType} · {channel.health}
                  </p>
                </div>
                <p className="font-mono text-[10px] text-text-secondary">
                  {channel.messageCount} msgs
                </p>
              </Row>
            ))}
          </div>
        </Panel>

        <Panel title="Alerts">
          <div className="space-y-2">
            {alerts.map((alert) => (
              <Row key={alert.id}>
                <div className="min-w-0">
                  <p className="font-mono text-xs text-text-primary">{alert.title}</p>
                  <p className="line-clamp-2 font-body text-[11px] text-text-tertiary">
                    {alert.message}
                  </p>
                </div>
                <p className="font-mono text-[10px] text-text-secondary">
                  {alert.severity}
                </p>
              </Row>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Landing alignment">
          <p className="font-body text-sm text-text-secondary">
            {dashboardLandingAlignmentPreviewFixture.overview.activeChannels} active channels,
            {` `}{dashboardLandingAlignmentPreviewFixture.overview.alerts24h} alerts, and a
            shared dashboard vocabulary for marketing and product stories.
          </p>
        </Panel>

        <Panel title="Thread detail fixture">
          <p className="font-mono text-xs text-text-primary">
            {dashboardChannelDetailFixture.channel.name}
          </p>
          <p className="mt-1 font-body text-sm text-text-secondary">
            {dashboardChannelDetailFixture.state.runningSummary}
          </p>
          <p className="mt-2 font-mono text-[10px] text-text-tertiary">
            {dashboardChannelDetailFixture.threads.length} active threads ·{" "}
            {dashboardFollowUpActionFixtures.length} follow-up actions
          </p>
        </Panel>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
        {label}
      </p>
      <p className="mt-2 font-sans text-2xl font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border-subtle bg-bg-secondary/50 p-4">
      <h2 className="mb-3 font-sans text-sm font-semibold text-text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border-subtle/60 bg-bg-primary/50 px-3 py-2">
      {children}
    </div>
  );
}

const meta = {
  title: "Features/Dashboard/Fixtures",
  component: DashboardFixturesPreview,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof DashboardFixturesPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
