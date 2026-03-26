import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const data = await backendFetch("/api/channels/classifications/list", {
      workspaceId: auth.session.workspaceId,
    });
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to list classifications" }, { status: 500 });
  }
}
