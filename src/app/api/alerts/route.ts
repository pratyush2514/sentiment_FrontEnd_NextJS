import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import { transformAlerts, type BackendDashboardAlert } from "@/lib/transforms";
import type { DashboardAlert } from "@/lib/types";

interface BackendAlertsResponse {
  total: number;
  alerts: BackendDashboardAlert[];
}

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);

  if ("response" in auth) {
    return auth.response;
  }

  const limit = Math.max(
    1,
    Math.min(100, parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10)),
  );
  const channelId = request.nextUrl.searchParams.get("channel_id") ?? "";

  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (channelId) params.set("channel_id", channelId);

    const raw = await backendFetch<BackendAlertsResponse>(
      `/api/alerts?${params.toString()}`,
      { workspaceId: auth.session.workspaceId },
    );
    const data: DashboardAlert[] = transformAlerts(raw.alerts);
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch alerts", ok: false },
      { status: 500 },
    );
  }
}
