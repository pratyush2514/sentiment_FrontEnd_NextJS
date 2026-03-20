import { type NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { backendFetch } from "@/lib/backendClient";
import { requireAppSession } from "@/lib/auth";

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAppSession(request);
  if ("response" in auth) return auth.response;

  try {
    await backendFetch<{ ok: boolean }>("/api/auth/disconnect", {
      method: "DELETE",
      workspaceId: auth.session.workspaceId,
    });
  } catch (err) {
    console.error("[disconnect] Backend disconnect failed:", err);
    return NextResponse.json(
      { error: "disconnect_failed", ok: false },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookie(response);
  return response;
}
