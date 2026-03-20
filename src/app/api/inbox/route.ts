import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";
import type { AttentionItem } from "@/lib/types";

interface BackendInboxResponse {
  total: number;
  items: AttentionItem[];
}

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const params = new URLSearchParams();
  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    if (value) {
      params.set(key, value);
    }
  }

  const path = params.toString() ? `/api/inbox?${params.toString()}` : "/api/inbox";

  try {
    const raw = await backendFetch<BackendInboxResponse>(path, {
      workspaceId: auth.session.workspaceId,
    });
    return NextResponse.json({ data: raw.items, ok: true });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch inbox items", ok: false },
      { status: 500 },
    );
  }
}
