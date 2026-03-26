import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import { transformTimeline, type BackendTimelineResponse } from "@/lib/transforms";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = request.nextUrl;
  const auth = await requireAppSession(request);

  if ("response" in auth) {
    return auth.response;
  }

  const hours = Math.max(1, parseInt(searchParams.get("hours") ?? "168", 10));
  const scope = searchParams.get("scope");

  try {
    const now = new Date();
    const from = new Date(now.getTime() - hours * 60 * 60 * 1000);
    const query = new URLSearchParams({
      granularity: hours <= 72 ? "hourly" : "daily",
      limit: String(hours <= 72 ? hours : Math.max(7, Math.ceil(hours / 24))),
      from: from.toISOString(),
      to: now.toISOString(),
    });
    if (scope) {
      query.set("scope", scope);
    }

    const raw = await backendFetch<BackendTimelineResponse>(
      `/api/channels/${encodeURIComponent(id)}/timeline?${query.toString()}`,
      { workspaceId: auth.session.workspaceId },
    );
    const data = transformTimeline(raw);
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch timeline", ok: false },
      { status: 500 },
    );
  }
}
