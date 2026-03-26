import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const url = new URL(request.url);
    const channelId = url.searchParams.get("channel_id") ?? undefined;
    const status = url.searchParams.get("status") ?? undefined;
    const limit = url.searchParams.get("limit") ?? "20";
    const offset = url.searchParams.get("offset") ?? "0";

    const params = new URLSearchParams({ limit, offset });
    if (channelId) params.set("channel_id", channelId);
    if (status) params.set("status", status);

    const data = await backendFetch(`/api/meetings?${params.toString()}`, {
      workspaceId: auth.session.workspaceId,
    });

    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message, ok: false }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to fetch meetings", ok: false }, { status: 500 });
  }
}
