import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import type { WorkspaceStatusResponse } from "@/lib/types/api";

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const status = await backendFetch<WorkspaceStatusResponse>(
      `/api/auth/workspace-status`,
      { workspaceId: auth.session.workspaceId },
    );
    return NextResponse.json({ data: status, ok: true });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(
        {
          error: "workspace_status_unavailable",
          message: error.message,
          ok: false,
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "workspace_status_unavailable",
        message: "PulseBoard could not verify the Slack workspace status.",
        ok: false,
      },
      { status: 503 },
    );
  }
}
