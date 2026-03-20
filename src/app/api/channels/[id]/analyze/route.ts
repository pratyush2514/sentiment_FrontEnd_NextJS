import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendFetch, BackendError } from "@/lib/backendClient";

interface AnalyzeRequestBody {
  mode?: "channel" | "thread" | "visible_messages" | "thread_messages";
  threadTs?: string;
  targetMessageTs?: string[];
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

  let body: AnalyzeRequestBody = {};
  try {
    body = (await request.json()) as AnalyzeRequestBody;
  } catch {
    body = {};
  }

  try {
    const result = await backendFetch<{ status: string; jobId?: string }>(
      `/api/channels/${encodeURIComponent(id)}/analyze`,
      {
        method: "POST",
        body: {
          mode: body.mode ?? "channel",
          threadTs: body.threadTs,
          targetMessageTs: body.targetMessageTs,
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
      { error: "Failed to queue analysis", ok: false },
      { status: 500 },
    );
  }
}
