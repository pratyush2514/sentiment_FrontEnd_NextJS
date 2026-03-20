import { NextRequest } from "next/server";
import { requireAppSession } from "@/lib/auth";
import { backendStream } from "@/lib/backendClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);

  if ("response" in auth) {
    return auth.response;
  }

  let upstream: Response;
  try {
    upstream = await backendStream("/api/events/stream", {
      signal: request.signal,
      workspaceId: auth.session.workspaceId,
    });
  } catch {
    return new Response("Event stream unavailable", {
      status: 502,
    });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Failed to connect to event stream", {
      status: upstream.status,
    });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "X-PulseBoard-Stream-Mode": "proxied",
    },
  });
}
