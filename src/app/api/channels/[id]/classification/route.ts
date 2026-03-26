import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const { id } = await params;
    const data = await backendFetch(`/api/channels/${id}/classification`, {
      workspaceId: auth.session.workspaceId,
    });
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to get classification" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = await backendFetch(`/api/channels/${id}/classification`, {
      workspaceId: auth.session.workspaceId,
      method: "PUT",
      body: { ...body, workspace_id: auth.session.workspaceId },
    });
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to override classification" }, { status: 500 });
  }
}
