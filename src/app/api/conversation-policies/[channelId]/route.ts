import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import type { ConversationPolicy } from "@/lib/types";

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

  let body: ConversationPolicy;
  try {
    body = (await request.json()) as ConversationPolicy;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body", ok: false },
      { status: 400 },
    );
  }

  try {
    const payload: ConversationPolicy = {
      ...body,
      analysisWindowDays:
        body.analysisWindowDays ?? DEFAULT_ANALYSIS_WINDOW_DAYS,
      importanceTierOverride: body.importanceTierOverride ?? "auto",
      recommendedImportanceTier: body.recommendedImportanceTier ?? "standard",
      effectiveImportanceTier: body.effectiveImportanceTier ?? "standard",
      channelModeOverride: body.channelModeOverride ?? "auto",
      recommendedChannelMode: body.recommendedChannelMode ?? "collaboration",
      effectiveChannelMode: body.effectiveChannelMode ?? "collaboration",
    };

    const raw = await backendFetch<ConversationPolicy>(
      `/api/conversation-policies/${encodeURIComponent(channelId)}`,
      {
        method: "PUT",
        body: payload,
        workspaceId: auth.session.workspaceId,
      },
    );
    return NextResponse.json({
      data: {
        ...raw,
        analysisWindowDays: raw.analysisWindowDays ?? DEFAULT_ANALYSIS_WINDOW_DAYS,
        importanceTierOverride: raw.importanceTierOverride ?? "auto",
        recommendedImportanceTier: raw.recommendedImportanceTier ?? "standard",
        effectiveImportanceTier: raw.effectiveImportanceTier ?? "standard",
        channelModeOverride: raw.channelModeOverride ?? "auto",
        recommendedChannelMode: raw.recommendedChannelMode ?? "collaboration",
        effectiveChannelMode: raw.effectiveChannelMode ?? "collaboration",
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
      { error: "Failed to update conversation policy", ok: false },
      { status: 500 },
    );
  }
}
