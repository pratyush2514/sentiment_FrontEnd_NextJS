"use client";

import { StatsRow } from "@/components/dashboard/overview/StatsRow";
import { WorkspaceSentimentChart } from "@/components/dashboard/overview/WorkspaceSentimentChart";
import { RecentAlerts } from "@/components/dashboard/overview/RecentAlerts";
import { ChannelHealthSection } from "@/components/dashboard/overview/ChannelHealthSection";
import { ActionInboxSection } from "@/components/dashboard/attention/ActionInboxSection";
import { WidgetErrorBoundary } from "@/components/dashboard/common/WidgetErrorBoundary";
import { useDashboardOverviewModel } from "@/features/dashboard";

export default function DashboardPage() {
  const model = useDashboardOverviewModel();

  return (
    <div className="space-y-section">
      <WidgetErrorBoundary label="stats">
        <StatsRow data={model.overview} isLoading={model.overviewLoading} />
      </WidgetErrorBoundary>

      <div className="grid gap-group lg:grid-cols-[1fr_320px] items-start">
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
          <RecentAlerts alerts={model.recentAlerts} isLoading={model.alertsLoading} />
        </WidgetErrorBoundary>
      </div>

      <WidgetErrorBoundary label="channel health">
        <ChannelHealthSection channels={model.channels} isLoading={model.channelsLoading} />
      </WidgetErrorBoundary>

      <WidgetErrorBoundary label="action inbox">
        <ActionInboxSection channels={model.channels} />
      </WidgetErrorBoundary>
    </div>
  );
}
