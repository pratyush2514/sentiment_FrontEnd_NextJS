import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";

interface BackendPermalinkResponse {
  permalink: string;
}

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);

  if ("response" in auth) {
    return auth.response;
  }

  const channelId = request.nextUrl.searchParams.get("channelId");
  const messageTs = request.nextUrl.searchParams.get("messageTs");

  if (!channelId || !messageTs) {
    return NextResponse.json(
      { error: "channelId and messageTs are required", ok: false },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    channel_id: channelId,
    message_ts: messageTs,
    workspace_id: auth.session.workspaceId,
  });

  try {
    const data = await backendFetch<BackendPermalinkResponse>(`/api/slack/permalink?${params.toString()}`);
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message, ok: false }, { status: err.status });
    }

    return NextResponse.json(
      { error: "Failed to fetch Slack permalink", ok: false },
      { status: 500 },
    );
  }
}
