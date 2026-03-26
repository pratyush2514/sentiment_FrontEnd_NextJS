import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const data = await backendFetch("/api/meetings/channel-links/list", {
      workspaceId: auth.session.workspaceId,
    });
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message, ok: false }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to fetch channel links", ok: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const data = await backendFetch("/api/meetings/channel-links", {
      workspaceId: auth.session.workspaceId,
      method: "POST",
      body,
    });
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message, ok: false }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to create channel link", ok: false }, { status: 500 });
  }
}
