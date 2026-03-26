"use client";

import { useMemo, useState } from "react";

import { useAlerts, useChannels, useOverview, useSentimentTrends } from "@/lib/hooks";

import { dashboardTrendRangeOptions } from "../fixtures";
import {
  groupAlertsByChannel,
  pickRecentAlerts,
  pickTopChannels,
  toDashboardQueryConfig,
} from "../utils";
import { useRealtimeRefreshPolicy } from "./useRealtimeRefreshPolicy";

import type {
  DashboardOverviewViewModel,
  DashboardTrendRange,
  UseDashboardOverviewModelOptions,
} from "../types";

export function useDashboardOverviewModel(
  options: UseDashboardOverviewModelOptions = {},
): DashboardOverviewViewModel {
  const [trendRange, setTrendRange] = useState<DashboardTrendRange>(
    options.initialTrendRange ?? 14,
  );

  const refreshPolicy = useRealtimeRefreshPolicy("overview");
  const queryConfig = toDashboardQueryConfig(refreshPolicy);
  const overviewQuery = useOverview(queryConfig);
  const channelsQuery = useChannels(queryConfig);
  const alertsQuery = useAlerts({ limit: 8, swr: queryConfig });
  const trendsQuery = useSentimentTrends("daily", trendRange, queryConfig);

  const topChannels = useMemo(
    () => pickTopChannels(channelsQuery.data ?? [], options.topChannelLimit ?? 8),
    [channelsQuery.data, options.topChannelLimit],
  );

  const recentAlerts = useMemo(
    () => pickRecentAlerts(alertsQuery.data ?? [], options.recentAlertLimit ?? 8),
    [alertsQuery.data, options.recentAlertLimit],
  );

  const alertGroups = useMemo(
    () => groupAlertsByChannel(recentAlerts),
    [recentAlerts],
  );
  const overviewUnavailable = Boolean(overviewQuery.error);
  const channelsUnavailable = Boolean(channelsQuery.error);
  const alertsUnavailable = Boolean(alertsQuery.error);
  const trendsUnavailable = Boolean(trendsQuery.error);
  const unavailableSections = [
    overviewUnavailable ? "workspace overview" : null,
    channelsUnavailable ? "channel health" : null,
    alertsUnavailable ? "flagged messages" : null,
    trendsUnavailable ? "sentiment trends" : null,
  ].filter((value): value is string => Boolean(value));

  return {
    overview: overviewQuery.data,
    channels: channelsQuery.data,
    alerts: alertsQuery.data,
    trends: trendsQuery.data,
    overviewLoading: overviewQuery.isLoading,
    channelsLoading: channelsQuery.isLoading,
    alertsLoading: alertsQuery.isLoading,
    trendsLoading: trendsQuery.isLoading,
    overviewUnavailable,
    channelsUnavailable,
    alertsUnavailable,
    trendsUnavailable,
    hasUnavailableData: unavailableSections.length > 0,
    unavailableSections,
    isLoading:
      overviewQuery.isLoading ||
      channelsQuery.isLoading ||
      alertsQuery.isLoading ||
      trendsQuery.isLoading,
    trendRange,
    setTrendRange,
    trendRangeOptions: options.trendRangeOptions ?? dashboardTrendRangeOptions,
    topChannels,
    recentAlerts,
    alertGroups,
    refreshPolicy,
  };
}
