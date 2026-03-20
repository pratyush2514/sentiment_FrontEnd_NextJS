import { NextRequest, NextResponse } from "next/server";
import { requireAppSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAppSession(request);

  if ("response" in auth) {
    return auth.response;
  }

  return NextResponse.json({ data: auth.session, ok: true });
}
