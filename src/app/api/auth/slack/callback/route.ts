import { type NextRequest, NextResponse } from "next/server";
import { ROUTES, OAUTH_STATE_COOKIE_NAME } from "@/lib/constants";
import { getAppBaseUrl } from "@/lib/runtimeEnv";

export async function GET(request: NextRequest) {
  const baseUrl = getAppBaseUrl(request.nextUrl.origin);
  const response = NextResponse.redirect(
    new URL(`${ROUTES.CONNECT}?error=deprecated_auth_callback`, baseUrl),
  );
  response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
  return response;
}
