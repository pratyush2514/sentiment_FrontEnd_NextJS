import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import type { FollowUpRuleConfig } from "@/lib/types";

const DEFAULT_ANALYSIS_WINDOW_DAYS = 7;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> },
) {
  const auth = await requireAppSession(request);

  if ("response" in auth) {
    return auth.response;
  }

  const { channelId } = await params;
  const body = await request.json();
  const payload: FollowUpRuleConfig = {
    ...(body as FollowUpRuleConfig),
    analysisWindowDays:
      (body as FollowUpRuleConfig).analysisWindowDays ?? DEFAULT_ANALYSIS_WINDOW_DAYS,
  };

  try {
    const updated = await backendFetch<FollowUpRuleConfig>(
      `/api/follow-up-rules/${encodeURIComponent(channelId)}`,
      {
        method: "PUT",
        body: payload,
        workspaceId: auth.session.workspaceId,
      },
    );

    return NextResponse.json({
      data: {
        ...updated,
        analysisWindowDays: updated.analysisWindowDays ?? DEFAULT_ANALYSIS_WINDOW_DAYS,
      },
      ok: true,
    });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }

    return NextResponse.json(
      { error: "Failed to update follow-up rule", ok: false },
      { status: 500 },
    );
  }
}
