import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";

interface RollupRequestBody {
  mode?: "channel" | "thread" | "backfill";
  threadTs?: string;
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

  let body: RollupRequestBody = {};
  try {
    body = (await request.json()) as RollupRequestBody;
  } catch {
    body = {};
  }

  try {
    const result = await backendFetch<{ status: string; jobId?: string }>(
      `/api/channels/${encodeURIComponent(id)}/rollup`,
      {
        method: "POST",
        body: {
          mode: body.mode ?? "channel",
          threadTs: body.threadTs,
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
      { error: "Failed to queue rollup", ok: false },
      { status: 500 },
    );
  }
}
