import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";

interface FollowUpActionBody {
  action?: "resolve" | "dismiss" | "snooze" | "acknowledge_waiting" | "reopen";
  snoozeHours?: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const auth = await requireAppSession(request);

  if ("response" in auth) {
    return auth.response;
  }

  const { itemId } = await params;

  let body: FollowUpActionBody = {};
  try {
    body = (await request.json()) as FollowUpActionBody;
  } catch {
    body = {};
  }

  if (!body.action) {
    return NextResponse.json(
      { error: "Missing follow-up action", ok: false },
      { status: 400 },
    );
  }

  try {
    const result = await backendFetch<{
      itemId: string;
      status: "open" | "resolved" | "dismissed";
      action: "resolve" | "dismiss" | "snooze" | "acknowledge_waiting" | "reopen";
    }>(
      `/api/alerts/follow-ups/${encodeURIComponent(itemId)}/action`,
      {
        method: "POST",
        body,
        workspaceId: auth.session.workspaceId,
      },
    );

    return NextResponse.json({ data: result, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }

    return NextResponse.json(
      { error: "Failed to update follow-up reminder", ok: false },
      { status: 500 },
    );
  }
}
