import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { getAppBaseUrl } from "@/lib/runtimeEnv";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.redirect(
    new URL(ROUTES.CONNECT, getAppBaseUrl(request.nextUrl.origin)),
  );
  clearAuthCookie(response);
  return response;
}
