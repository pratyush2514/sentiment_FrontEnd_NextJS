"use client";

import { StatsRow } from "@/components/dashboard/overview/StatsRow";
import { WorkspaceSentimentChart } from "@/components/dashboard/overview/WorkspaceSentimentChart";
import { RecentAlerts } from "@/components/dashboard/overview/RecentAlerts";
import { ChannelHealthSection } from "@/components/dashboard/overview/ChannelHealthSection";
import { ActionInboxSection } from "@/components/dashboard/attention/ActionInboxSection";
import { WidgetErrorBoundary } from "@/components/dashboard/common/WidgetErrorBoundary";
import { MeetingCommitmentsCard } from "@/components/dashboard/meetings/MeetingCommitmentsCard";
import { useDashboardOverviewModel } from "@/features/dashboard";

export default function DashboardPage() {
  const model = useDashboardOverviewModel();

  return (
    <div className="space-y-section">
      {model.hasUnavailableData ? (
        <div className="rounded-xl border border-warning/25 bg-warning/8 px-4 py-3">
          <p className="font-body text-sm text-text-secondary">
            Some dashboard data is temporarily unavailable: {model.unavailableSections.join(", ")}.
            The visible cards may be stale until the backend responds again.
          </p>
        </div>
      ) : null}

      <WidgetErrorBoundary label="stats">
        <StatsRow data={model.overview} isLoading={model.overviewLoading} />
      </WidgetErrorBoundary>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
        <WidgetErrorBoundary label="sentiment timeline">
          <WorkspaceSentimentChart
            data={model.trends}
            isLoading={model.trendsLoading}
            trendRange={model.trendRange}
            onTrendRangeChange={(value) => model.setTrendRange(value as typeof model.trendRange)}
            trendRanges={model.trendRangeOptions}
          />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary label="flagged messages">
          <RecentAlerts
            alerts={model.recentAlerts}
            isLoading={model.alertsLoading}
            isUnavailable={model.alertsUnavailable}
          />
        </WidgetErrorBoundary>
      </div>

      <WidgetErrorBoundary label="channel health">
        <ChannelHealthSection
          channels={model.channels}
          isLoading={model.channelsLoading}
          isUnavailable={model.channelsUnavailable}
        />
      </WidgetErrorBoundary>

      <WidgetErrorBoundary label="meeting commitments">
        <MeetingCommitmentsCard />
      </WidgetErrorBoundary>

      <WidgetErrorBoundary label="action inbox">
        <ActionInboxSection channels={model.channels} />
      </WidgetErrorBoundary>
    </div>
  );
}
