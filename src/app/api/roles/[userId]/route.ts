import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import type { RoleDirectoryEntry, UserRole } from "@/lib/types";

interface ReviewRoleBody {
  action?: "confirm" | "reject" | "clear";
  role?: UserRole;
  displayLabel?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const auth = await requireAppSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { userId } = await params;

  let body: ReviewRoleBody = {};
  try {
    body = (await request.json()) as ReviewRoleBody;
  } catch {
    body = {};
  }

  if (!body.action) {
    return NextResponse.json(
      { error: "Missing review action", ok: false },
      { status: 400 },
    );
  }

  if (body.action !== "clear" && !body.role) {
    return NextResponse.json(
      { error: "Missing role", ok: false },
      { status: 400 },
    );
  }

  try {
    const raw = await backendFetch<{
      userId: string;
      updated: RoleDirectoryEntry | null;
    }>(`/api/roles/${encodeURIComponent(userId)}`, {
      method: "PUT",
      body,
      workspaceId: auth.session.workspaceId,
    });
    return NextResponse.json({ data: raw, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }

    return NextResponse.json(
      { error: "Failed to update role assignment", ok: false },
      { status: 500 },
    );
  }
}
