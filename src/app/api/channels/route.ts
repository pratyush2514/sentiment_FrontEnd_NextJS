import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import { transformChannelsList, type BackendChannelsResponse } from "@/lib/transforms";

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const raw = await backendFetch<BackendChannelsResponse>("/api/channels/", {
      workspaceId: auth.session.workspaceId,
    });
    const data = transformChannelsList(raw);

    return NextResponse.json({ data, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch channels", ok: false },
      { status: 500 },
    );
  }
}
