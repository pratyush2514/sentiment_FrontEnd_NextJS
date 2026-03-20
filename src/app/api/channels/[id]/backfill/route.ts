import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";

interface BackfillRequestBody {
  reason?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAppSession(request);

  if ("response" in auth) {
    return auth.response;
  }

  let body: BackfillRequestBody = {};
  try {
    body = (await request.json()) as BackfillRequestBody;
  } catch {
    body = {};
  }

  try {
    const result = await backendFetch<{ status: string; jobId?: string }>(
      `/api/channels/${encodeURIComponent(id)}/backfill`,
      {
        method: "POST",
        body: {
          reason: body.reason ?? "manual_retry",
        },
        workspaceId: auth.session.workspaceId,
      },
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { error: err.message, ok: false },
        { status: err.status },
      );
    }

    return NextResponse.json(
      { error: "Failed to queue backfill", ok: false },
      { status: 500 },
    );
  }
}
