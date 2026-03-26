import { type NextRequest, NextResponse } from "next/server";
import { buildSlackBotInstallPayload, exchangeCodeForToken } from "@/lib/slack";
import { setSessionCookie, getSessionFromRequest } from "@/lib/auth";
import { backendFetch } from "@/lib/backendClient";
import { ROUTES, OAUTH_STATE_COOKIE_NAME } from "@/lib/constants";
import { getAppBaseUrl } from "@/lib/runtimeEnv";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;
  const baseUrl = getAppBaseUrl(request.nextUrl.origin);

  // Validate CSRF state
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL(`${ROUTES.SETUP}?error=invalid_state`, baseUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL(`${ROUTES.SETUP}?error=install_failed`, baseUrl));
  }

  const isMockMode = process.env.MOCK_AUTH === "true";

  if (isMockMode && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL(`${ROUTES.CONNECT}?error=mock_auth_disabled`, baseUrl));
  }

  if (isMockMode) {
    // In mock mode, simulate a successful install and create a session
    const response = NextResponse.redirect(new URL(ROUTES.SETUP, baseUrl));
    await setSessionCookie(response, {
      workspaceId: "default",
      workspaceName: "Local Workspace",
      userId: "mock-user",
      userName: "Local Admin",
      authMode: "mock",
    });
    response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
    return response;
  }

  // Build the redirect URI that was used during the install initiation
  const installRedirectUri =
    `${baseUrl}${ROUTES.API_SLACK_INSTALL_CALLBACK}`;

  // Exchange authorization code for bot token
  const tokenResponse = await exchangeCodeForToken(code, installRedirectUri);

  if (!tokenResponse.ok || !tokenResponse.access_token) {
    return NextResponse.redirect(
      new URL(`${ROUTES.SETUP}?error=token_exchange_failed`, baseUrl),
    );
  }

  // Extract workspace identity from the token response
  const workspaceId = tokenResponse.team?.id;
  const workspaceName = tokenResponse.team?.name;
  const installerUserId = tokenResponse.authed_user?.id;

  if (!workspaceId) {
    return NextResponse.redirect(
      new URL(`${ROUTES.CONNECT}?error=missing_workspace`, baseUrl),
    );
  }

  // Use existing session if available (e.g. user logged in then installed)
  const existingSession = await getSessionFromRequest(request);

  // Send bot credentials to the backend for encrypted storage
  try {
    const installPayload = buildSlackBotInstallPayload({
      workspaceId,
      teamName: workspaceName ?? existingSession?.workspaceName ?? workspaceId,
      botUserId: tokenResponse.bot_user_id ?? null,
      installedBy: installerUserId ?? existingSession?.userId ?? null,
      scopes: tokenResponse.scope
        ? tokenResponse.scope.split(",").map((scope) => scope.trim()).filter(Boolean)
        : [],
      tokenResponse,
    });

    await backendFetch<{ ok: boolean }>("/api/auth/install", {
      method: "POST",
      workspaceId,
      body: installPayload,
    });
  } catch {
    return NextResponse.redirect(
      new URL(`${ROUTES.SETUP}?error=install_failed`, baseUrl),
    );
  }

  // Success — create session and redirect to setup
  const response = NextResponse.redirect(new URL(`${ROUTES.SETUP}?installed=true`, baseUrl));
  await setSessionCookie(response, {
    workspaceId,
    workspaceName: workspaceName ?? workspaceId,
    userId: installerUserId ?? existingSession?.userId ?? null,
    userName: existingSession?.userName ?? null,
    authMode: "slack",
  });
  response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
  return response;
}
