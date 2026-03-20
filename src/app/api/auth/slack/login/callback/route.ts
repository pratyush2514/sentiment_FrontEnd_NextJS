import { type NextRequest, NextResponse } from "next/server";
import { buildSlackBotInstallPayload, exchangeCodeForToken } from "@/lib/slack";
import { setSessionCookie } from "@/lib/auth";
import { backendFetch } from "@/lib/backendClient";
import { ROUTES, OAUTH_STATE_COOKIE_NAME } from "@/lib/constants";
import { getAppBaseUrl } from "@/lib/runtimeEnv";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;
  const baseUrl = getAppBaseUrl(request.nextUrl.origin);
  const isMockMode = process.env.MOCK_AUTH === "true";

  if (isMockMode && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL(`${ROUTES.CONNECT}?error=mock_auth_disabled`, baseUrl));
  }

  // Validate CSRF state
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL(`${ROUTES.CONNECT}?error=invalid_state`, baseUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL(`${ROUTES.CONNECT}?error=auth_failed`, baseUrl));
  }

  // Mock mode
  if (isMockMode) {
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

  // Build the redirect URI that was used during the login initiation
  const redirectUri = `${baseUrl}${ROUTES.API_SLACK_LOGIN_CALLBACK}`;

  // Exchange code for OAuth v2 bot token (this also installs the bot)
  const tokenResponse = await exchangeCodeForToken(code, redirectUri);

  if (!tokenResponse.ok || !tokenResponse.access_token) {
    console.error("[login-callback] Slack token exchange failed:", tokenResponse.error);
    return NextResponse.redirect(new URL(`${ROUTES.CONNECT}?error=auth_failed`, baseUrl));
  }

  // Extract workspace + user identity from the token response
  const workspaceId = tokenResponse.team?.id;
  const workspaceName = tokenResponse.team?.name;
  const installerUserId = tokenResponse.authed_user?.id;

  if (!workspaceId) {
    console.error("[login-callback] No team_id in token response");
    return NextResponse.redirect(new URL(`${ROUTES.CONNECT}?error=missing_workspace`, baseUrl));
  }

  // Install bot credentials to the backend (encrypted storage)
  try {
    const installPayload = buildSlackBotInstallPayload({
      workspaceId,
      teamName: workspaceName ?? workspaceId,
      botUserId: tokenResponse.bot_user_id ?? null,
      installedBy: installerUserId ?? null,
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
  } catch (err) {
    console.error("[login-callback] Backend install failed:", err);
    return NextResponse.redirect(
      new URL(`${ROUTES.SETUP}?error=install_failed`, baseUrl),
    );
  }

  // Determine redirect: dashboard if channels exist, setup otherwise
  const redirectUrl = new URL(ROUTES.SETUP, baseUrl);
  try {
    const channelsList = await backendFetch<{ total: number; channels: unknown[] }>(
      `/api/channels?workspace_id=${encodeURIComponent(workspaceId)}`,
    );
    if (channelsList.channels.length > 0) {
      redirectUrl.pathname = ROUTES.DASHBOARD;
    }
  } catch {
    // Default to setup if channel check fails
  }

  // Fire-and-forget: discover channels
  backendFetch("/api/channels/sync", {
    method: "POST",
    workspaceId,
  }).catch(() => {});

  // Create session and redirect
  const response = NextResponse.redirect(redirectUrl);
  await setSessionCookie(response, {
    workspaceId,
    workspaceName: workspaceName ?? workspaceId,
    userId: installerUserId ?? null,
    userName: null,
    authMode: "slack",
  });
  response.cookies.delete(OAUTH_STATE_COOKIE_NAME);

  return response;
}
