import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, getSessionFromRequest } from "@/lib/auth";
import { backendFetch } from "@/lib/backendClient";
import { ROUTES } from "@/lib/constants";
import { getAppBaseUrl } from "@/lib/runtimeEnv";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionFromRequest(request);

  // Fire-and-forget: cancel pending queue jobs for this workspace
  if (session?.workspaceId) {
    backendFetch("/api/auth/logout", {
      method: "POST",
      workspaceId: session.workspaceId,
    }).catch(() => {});
  }

  const response = NextResponse.redirect(
    new URL(ROUTES.CONNECT, getAppBaseUrl(request.nextUrl.origin)),
  );
  clearAuthCookie(response);
  return response;
}
