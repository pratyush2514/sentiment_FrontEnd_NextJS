import { NextRequest, NextResponse } from "next/server";
import { buildSlackAuthUrl } from "@/lib/slack";
import { ROUTES, SLACK_BOT_INSTALL_SCOPES, OAUTH_STATE_COOKIE_NAME } from "@/lib/constants";
import { getAppBaseUrl } from "@/lib/runtimeEnv";

export async function GET(request: NextRequest) {
  const baseUrl = getAppBaseUrl(request.nextUrl.origin);

  const isMockMode = process.env.MOCK_AUTH === "true";
  const state = crypto.randomUUID();

  if (isMockMode && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL(`${ROUTES.CONNECT}?error=mock_auth_disabled`, baseUrl));
  }

  if (isMockMode) {
    const callbackUrl = new URL(ROUTES.API_SLACK_INSTALL_CALLBACK, baseUrl);
    callbackUrl.searchParams.set("code", "mock_install_code");
    callbackUrl.searchParams.set("state", state);

    const response = NextResponse.redirect(callbackUrl);
    response.cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    });
    return response;
  }

  const installUrl = buildSlackAuthUrl({
    state,
    baseUrl,
    scopes: SLACK_BOT_INSTALL_SCOPES,
    redirectPath: ROUTES.API_SLACK_INSTALL_CALLBACK,
  });

  const response = NextResponse.redirect(installUrl);
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
