import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const data = await backendFetch("/api/fathom/connection", {
      workspaceId: auth.session.workspaceId,
    });
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message, ok: false }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to get connection", ok: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const data = await backendFetch("/api/fathom/connection", {
      workspaceId: auth.session.workspaceId,
      method: "POST",
      body,
    });
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message, ok: false }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to connect Fathom", ok: false }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const data = await backendFetch("/api/fathom/connection", {
      workspaceId: auth.session.workspaceId,
      method: "PATCH",
      body,
    });
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message, ok: false }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to update connection", ok: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const data = await backendFetch("/api/fathom/connection", {
      workspaceId: auth.session.workspaceId,
      method: "DELETE",
    });
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message, ok: false }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to disconnect Fathom", ok: false }, { status: 500 });
  }
}
