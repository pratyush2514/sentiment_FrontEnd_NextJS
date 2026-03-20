"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import {
  resolveDashboardQueryConfig,
  type DashboardQueryConfig,
} from "./queryConfig";

export interface TrendPoint {
  timestamp: string;
  positive: number;
  neutral: number;
  negative: number;
  highRisk: number;
  total: number;
}

export function useSentimentTrends(
  granularity: "daily" | "hourly" = "daily",
  limit = 14,
  options?: DashboardQueryConfig,
) {
  return useSWR<TrendPoint[]>(
    `/api/analytics/trends?granularity=${granularity}&limit=${limit}`,
    apiFetch,
    {
      ...resolveDashboardQueryConfig(
        {
          revalidateOnFocus: false,
          keepPreviousData: true,
          dedupingInterval: 10_000,
        },
        options,
      ),
    },
  );
}
