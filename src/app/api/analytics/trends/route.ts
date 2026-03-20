import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";

interface BackendTrendBucket {
  bucket: string;
  total: number;
  emotions: Record<string, number>;
  avgConfidence: number;
  highRiskCount: number;
}

interface BackendTrendsResponse {
  granularity: string;
  total: number;
  buckets: BackendTrendBucket[];
}

export interface TrendPoint {
  timestamp: string;
  positive: number;
  neutral: number;
  negative: number;
  highRisk: number;
  total: number;
}

function transformTrends(raw: BackendTrendsResponse): TrendPoint[] {
  return raw.buckets.map((b) => {
    const emotions = b.emotions ?? {};
    const positive = emotions.joy ?? 0;
    const negative =
      (emotions.anger ?? 0) +
      (emotions.disgust ?? 0) +
      (emotions.sadness ?? 0) +
      (emotions.fear ?? 0);
    const neutral = (emotions.neutral ?? 0) + (emotions.surprise ?? 0);
    const total = positive + negative + neutral || 1;

    return {
      timestamp: b.bucket,
      positive: positive / total,
      neutral: neutral / total,
      negative: negative / total,
      highRisk: b.highRiskCount ?? 0,
      total: Object.values(emotions).reduce((s, v) => s + v, 0),
    };
  });
}

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const granularity = request.nextUrl.searchParams.get("granularity") ?? "daily";
  const limit = request.nextUrl.searchParams.get("limit") ?? "14";

  try {
    const raw = await backendFetch<BackendTrendsResponse>(
      `/api/analytics/sentiment-trends?granularity=${granularity}&limit=${limit}`,
      { workspaceId: auth.session.workspaceId },
    );
    const data = transformTrends(raw);
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch sentiment trends", ok: false },
      { status: 500 },
    );
  }
}
