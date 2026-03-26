import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";

export async function POST(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const data = await backendFetch("/api/fathom/connection/sync", {
      workspaceId: auth.session.workspaceId,
      method: "POST",
    });
    return NextResponse.json({ data, ok: true }, { status: 202 });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message, ok: false }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to start Fathom sync", ok: false }, { status: 500 });
  }
}
