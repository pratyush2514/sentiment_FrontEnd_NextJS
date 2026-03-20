import { NextRequest, NextResponse } from "next/server";
import { buildSlackAuthUrl } from "@/lib/slack";
import { ROUTES, OAUTH_STATE_COOKIE_NAME, SLACK_BOT_INSTALL_SCOPES } from "@/lib/constants";
import { getAppBaseUrl } from "@/lib/runtimeEnv";

/**
 * Login route — uses OAuth v2 with bot scopes so the bot installs
 * to the workspace automatically when the user authenticates.
 */
export async function GET(request: NextRequest) {
  const isMockMode = process.env.MOCK_AUTH === "true";
  const state = crypto.randomUUID();
  const appUrl = getAppBaseUrl(request.nextUrl.origin);

  if (isMockMode && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL(`${ROUTES.CONNECT}?error=mock_auth_disabled`, appUrl));
  }

  if (isMockMode) {
    const callbackUrl = new URL(ROUTES.API_SLACK_LOGIN_CALLBACK, appUrl);
    callbackUrl.searchParams.set("code", "mock_code");
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

  // Use OAuth v2 with bot scopes — this installs the bot on auth
  const authUrl = buildSlackAuthUrl({
    state,
    baseUrl: appUrl,
    scopes: SLACK_BOT_INSTALL_SCOPES,
    redirectPath: ROUTES.API_SLACK_LOGIN_CALLBACK,
  });

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
