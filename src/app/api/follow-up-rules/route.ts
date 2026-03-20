import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import type { FollowUpRuleConfig } from "@/lib/types";

interface BackendRulesResponse {
  total: number;
  rules: FollowUpRuleConfig[];
}

const DEFAULT_ANALYSIS_WINDOW_DAYS = 7;

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);

  if ("response" in auth) {
    return auth.response;
  }

  try {
    const raw = await backendFetch<BackendRulesResponse>(
      "/api/follow-up-rules",
      { workspaceId: auth.session.workspaceId },
    );
    return NextResponse.json({
      data: raw.rules.map((rule) => ({
        ...rule,
        analysisWindowDays: rule.analysisWindowDays ?? DEFAULT_ANALYSIS_WINDOW_DAYS,
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
      { error: "Failed to fetch follow-up rules", ok: false },
      { status: 500 },
    );
  }
}
