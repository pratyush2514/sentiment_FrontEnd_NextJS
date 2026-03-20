import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import {
  transformLiveMessages,
  type BackendLiveMessagesResponse,
} from "@/lib/transforms";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAppSession(request);

  if ("response" in auth) {
    return auth.response;
  }

  const limit = Math.max(
    1,
    Math.min(200, parseInt(request.nextUrl.searchParams.get("limit") ?? "40", 10)),
  );
  const participantId = request.nextUrl.searchParams.get("participantId");
  const group = request.nextUrl.searchParams.get("group") ?? "threaded";

  try {
    const query = new URLSearchParams();
    query.set("limit", String(limit));
    query.set("group", group);
    if (participantId) {
      query.set("participantId", participantId);
    }

    const raw = await backendFetch<BackendLiveMessagesResponse>(
      `/api/channels/${encodeURIComponent(id)}/live-messages?${query.toString()}`,
      { workspaceId: auth.session.workspaceId },
    );

    return NextResponse.json({
      data: transformLiveMessages(raw),
      ok: true,
    });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch live activity messages", ok: false },
      { status: 500 },
    );
  }
}
