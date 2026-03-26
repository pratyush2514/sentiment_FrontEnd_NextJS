import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> },
) {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const { linkId } = await params;
    const data = await backendFetch(`/api/meetings/channel-links/${linkId}`, {
      workspaceId: auth.session.workspaceId,
      method: "DELETE",
    });
    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message, ok: false }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to delete channel link", ok: false }, { status: 500 });
  }
}
