import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import type { RoleDirectoryEntry } from "@/lib/types";

interface BackendRolesResponse {
  total: number;
  roles: RoleDirectoryEntry[];
}

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const raw = await backendFetch<BackendRolesResponse>("/api/roles", {
      workspaceId: auth.session.workspaceId,
    });
    return NextResponse.json({ data: raw.roles, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch role directory", ok: false },
      { status: 500 },
    );
  }
}
