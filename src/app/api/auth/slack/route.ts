import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "@/lib/constants";
import { getAppBaseUrl } from "@/lib/runtimeEnv";

export async function GET(request: NextRequest) {
  const baseUrl = getAppBaseUrl(request.nextUrl.origin);
  return NextResponse.redirect(new URL(ROUTES.API_SLACK_INSTALL, baseUrl), {
    status: 307,
  });
}
