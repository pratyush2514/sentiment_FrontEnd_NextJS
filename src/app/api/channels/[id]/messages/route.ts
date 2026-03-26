import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import { transformMessages, type BackendChannelAnalyticsResponse } from "@/lib/transforms";

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

  const risk = searchParams.get("risk") ?? undefined;
  const scope = searchParams.get("scope") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = Math.max(1, parseInt(searchParams.get("per_page") ?? "20", 10));
  const offset = (page - 1) * perPage;

  try {
    const query = new URLSearchParams();
    query.set("limit", String(perPage));
    query.set("offset", String(offset));
    if (risk) {
      query.set("risk", risk);
    }
    if (scope) {
      query.set("scope", scope);
    }

    const raw = await backendFetch<BackendChannelAnalyticsResponse>(
      `/api/channels/${encodeURIComponent(id)}/analytics?${query.toString()}`,
      { workspaceId: auth.session.workspaceId },
    );
    const result = transformMessages(raw, { channelId: id, page, perPage });
    return NextResponse.json({ ...result, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch messages", ok: false },
      { status: 500 },
    );
  }
}
