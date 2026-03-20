import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import {
  transformThreadConversation,
  type BackendMessagesResponse,
} from "@/lib/transforms";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ts: string }> },
) {
  const { ts } = await params;
  const channelId = request.nextUrl.searchParams.get("channelId");
  const auth = await requireAppSession(request);

  if ("response" in auth) {
    return auth.response;
  }

  if (!channelId) {
    return NextResponse.json(
      { error: "channelId query parameter is required", ok: false },
      { status: 400 },
    );
  }

  try {
    const query = new URLSearchParams({
      threadTs: ts,
      limit: "50",
    });

    const raw = await backendFetch<BackendMessagesResponse>(
      `/api/channels/${encodeURIComponent(channelId)}/messages?${query.toString()}`,
      { workspaceId: auth.session.workspaceId },
    );
    const data = transformThreadConversation(raw);
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch thread messages", ok: false },
      { status: 500 },
    );
  }
}
