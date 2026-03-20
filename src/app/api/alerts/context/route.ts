import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import { transformAlertContext } from "@/lib/transforms";
import type { AlertContext } from "@/lib/types";
import type { BackendMessagesResponse } from "@/lib/transforms";

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);

  if ("response" in auth) {
    return auth.response;
  }

  const channelId = request.nextUrl.searchParams.get("channelId");
  const sourceMessageTs = request.nextUrl.searchParams.get("sourceMessageTs");
  const threadTs = request.nextUrl.searchParams.get("threadTs");

  if (!channelId || !sourceMessageTs) {
    return NextResponse.json(
      { error: "channelId and sourceMessageTs are required", ok: false },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    workspace_id: auth.session.workspaceId,
    channel_id: channelId,
    source_message_ts: sourceMessageTs,
  });
  if (threadTs) {
    params.set("thread_ts", threadTs);
  }

  try {
    const raw = await backendFetch<BackendMessagesResponse>(`/api/alerts/context?${params.toString()}`);
    const data: AlertContext = transformAlertContext(raw);
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message, ok: false }, { status: err.status });
    }

    return NextResponse.json(
      { error: "Failed to fetch alert context", ok: false },
      { status: 500 },
    );
  }
}
