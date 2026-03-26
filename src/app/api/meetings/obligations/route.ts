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
    const ownerUserId = url.searchParams.get("owner_user_id") ?? undefined;
    const limit = url.searchParams.get("limit") ?? "50";
    const offset = url.searchParams.get("offset") ?? "0";

    const params = new URLSearchParams({ limit, offset });
    if (channelId) params.set("channel_id", channelId);
    if (status) params.set("status", status);
    if (ownerUserId) params.set("owner_user_id", ownerUserId);

    const data = await backendFetch(`/api/meetings/obligations/list?${params.toString()}`, {
      workspaceId: auth.session.workspaceId,
    });

    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message, ok: false }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to fetch obligations", ok: false }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    if (!body.obligation_id || !body.status) {
      return NextResponse.json(
        { error: "obligation_id and status are required", ok: false },
        { status: 400 },
      );
    }
    const data = await backendFetch(`/api/meetings/obligations/${body.obligation_id}`, {
      workspaceId: auth.session.workspaceId,
      method: "PATCH",
      body,
    });

    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message, ok: false }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to update obligation", ok: false }, { status: 500 });
  }
}
