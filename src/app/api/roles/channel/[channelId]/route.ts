import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import type { ChannelMemberWithRole } from "@/lib/types";

interface BackendChannelMembersResponse {
  channelId: string;
  total: number;
  members: ChannelMemberWithRole[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> },
) {
  const auth = await requireAppSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { channelId } = await params;

  try {
    const raw = await backendFetch<BackendChannelMembersResponse>(
      `/api/roles/channel/${channelId}`,
      { workspaceId: auth.session.workspaceId },
    );
    return NextResponse.json({ data: raw.members, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch channel members", ok: false },
      { status: 500 },
    );
  }
}
