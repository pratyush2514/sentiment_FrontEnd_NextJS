import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch } from "@/lib/backendClient";

export async function POST(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const result = await backendFetch<{
      ok: boolean;
      discovered: number;
      totalVisible: number;
      alreadyTracked: number;
      newlyTracked: number;
      channels: Array<{ id: string; name: string; jobId: string | null }>;
    }>("/api/channels/sync", {
      method: "POST",
      workspaceId: auth.session.workspaceId,
    });
    return NextResponse.json({ data: result, ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message, ok: false }, { status: 500 });
  }
}
