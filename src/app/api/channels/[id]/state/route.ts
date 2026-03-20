import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import { transformChannelState, type BackendChannelState } from "@/lib/transforms";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAppSession(request);

  if ("response" in auth) {
    return auth.response;
  }

  try {
    const raw = await backendFetch<BackendChannelState>(
      `/api/channels/${encodeURIComponent(id)}/state`,
      { workspaceId: auth.session.workspaceId },
    );
    const data = transformChannelState(raw);
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch channel state", ok: false },
      { status: 500 },
    );
  }
}
