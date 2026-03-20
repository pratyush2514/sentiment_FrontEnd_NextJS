import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import type { ConversationPolicy } from "@/lib/types";

interface BackendPoliciesResponse {
  total: number;
  policies: ConversationPolicy[];
}

const DEFAULT_ANALYSIS_WINDOW_DAYS = 7;

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const raw = await backendFetch<BackendPoliciesResponse>("/api/conversation-policies", {
      workspaceId: auth.session.workspaceId,
    });
    return NextResponse.json({
      data: raw.policies.map((policy) => ({
        ...policy,
        analysisWindowDays: policy.analysisWindowDays ?? DEFAULT_ANALYSIS_WINDOW_DAYS,
        importanceTierOverride: policy.importanceTierOverride ?? "auto",
        recommendedImportanceTier: policy.recommendedImportanceTier ?? "standard",
        effectiveImportanceTier: policy.effectiveImportanceTier ?? "standard",
        channelModeOverride: policy.channelModeOverride ?? "auto",
        recommendedChannelMode: policy.recommendedChannelMode ?? "collaboration",
        effectiveChannelMode: policy.effectiveChannelMode ?? "collaboration",
      })),
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
      { error: "Failed to fetch conversation policies", ok: false },
      { status: 500 },
    );
  }
}
