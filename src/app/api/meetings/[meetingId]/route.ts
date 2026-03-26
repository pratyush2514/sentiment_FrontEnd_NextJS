import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> },
) {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const { meetingId } = await params;
    const data = await backendFetch(`/api/meetings/${meetingId}`, {
      workspaceId: auth.session.workspaceId,
    });
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message, ok: false }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to fetch meeting", ok: false }, { status: 500 });
  }
}
