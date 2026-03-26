import { type NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import { requireAppSession } from "@/lib/auth";
import type { WorkspaceStatusResponse } from "@/lib/types/api";

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    const status = await backendFetch<
      WorkspaceStatusResponse & { installedBy?: string | null }
    >("/api/auth/workspace-status", {
      workspaceId: auth.session.workspaceId,
    });

    if (
      !auth.session.userId ||
      !status.installedBy ||
      auth.session.userId !== status.installedBy
    ) {
      return NextResponse.json(
        {
          error: "forbidden",
          message:
            "Only the Slack installer who connected this workspace can disconnect it.",
          ok: false,
        },
        { status: 403 },
      );
    }

    await backendFetch<{ ok: boolean }>("/api/auth/disconnect", {
      method: "DELETE",
      workspaceId: auth.session.workspaceId,
    });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(
        {
          error: "disconnect_failed",
          message: error.message,
          ok: false,
        },
        { status: error.status >= 400 && error.status < 600 ? error.status : 500 },
      );
    }

    return NextResponse.json(
      {
        error: "disconnect_failed",
        message: "Couldn’t disconnect right now. Please try again.",
        ok: false,
      },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookie(response);
  return response;
}
