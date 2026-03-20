import { ROUTES, SLACK_SCOPES } from "./constants";
import {
  getAppBaseUrl,
  getRequiredSlackClientId,
  getRequiredSlackClientSecret,
  getSlackRedirectUri,
} from "./runtimeEnv";

const SLACK_AUTHORIZE_URL = "https://slack.com/oauth/v2/authorize";
const SLACK_TOKEN_URL = "https://slack.com/api/oauth.v2.access";

export interface SlackTokenResponse {
  ok: boolean;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  bot_user_id?: string;
  scope?: string;
  team?: { id: string; name: string };
  authed_user?: { id: string };
  error?: string;
}

export interface SlackBotInstallPayload {
  workspaceId: string;
  teamName: string;
  botToken: string;
  botUserId: string | null;
  installedBy: string | null;
  scopes: string[];
  refreshToken?: string;
  expiresInSeconds?: number;
  accessTokenExpiresAt?: string;
  tokenType?: string;
}

interface BuildSlackAuthUrlOptions {
  state: string;
  baseUrl?: string;
  scopes?: readonly string[];
  redirectPath?: string;
}

export function buildSlackAuthUrl(opts: BuildSlackAuthUrlOptions): string;
/** @deprecated Use the options object overload */
export function buildSlackAuthUrl(state: string, baseUrl?: string): string;
export function buildSlackAuthUrl(
  stateOrOpts: string | BuildSlackAuthUrlOptions,
  baseUrl?: string,
): string {
  const opts: BuildSlackAuthUrlOptions =
    typeof stateOrOpts === "string"
      ? { state: stateOrOpts, baseUrl }
      : stateOrOpts;

  const clientId = getRequiredSlackClientId();
  const callbackPath = opts.redirectPath ?? ROUTES.API_SLACK_INSTALL_CALLBACK;
  const redirectUri = getSlackRedirectUri(callbackPath, opts.baseUrl);

  const scopes = opts.scopes ?? SLACK_SCOPES;

  const params = new URLSearchParams({
    client_id: clientId,
    scope: scopes.join(","),
    redirect_uri: redirectUri,
    state: opts.state,
  });

  return `${SLACK_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri?: string,
): Promise<SlackTokenResponse> {
  const clientId = getRequiredSlackClientId();
  const clientSecret = getRequiredSlackClientSecret();
  const finalRedirectUri =
    redirectUri || getSlackRedirectUri(ROUTES.API_SLACK_INSTALL_CALLBACK, getAppBaseUrl());

  const response = await fetch(SLACK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: finalRedirectUri,
    }),
  });

  return response.json() as Promise<SlackTokenResponse>;
}

export function buildSlackBotInstallPayload(input: {
  workspaceId: string;
  teamName: string;
  botUserId?: string | null;
  installedBy?: string | null;
  scopes?: readonly string[];
  tokenResponse: SlackTokenResponse;
}): SlackBotInstallPayload {
  const expiresInSeconds =
    typeof input.tokenResponse.expires_in === "number" &&
    Number.isFinite(input.tokenResponse.expires_in)
      ? Math.max(0, Math.floor(input.tokenResponse.expires_in))
      : undefined;

  const accessTokenExpiresAt =
    expiresInSeconds !== undefined
      ? new Date(Date.now() + expiresInSeconds * 1000).toISOString()
      : undefined;

  return {
    workspaceId: input.workspaceId,
    teamName: input.teamName,
    botToken: input.tokenResponse.access_token ?? "",
    botUserId: input.botUserId ?? null,
    installedBy: input.installedBy ?? null,
    scopes: Array.from(new Set(input.scopes ?? [])),
    ...(input.tokenResponse.refresh_token
      ? { refreshToken: input.tokenResponse.refresh_token }
      : {}),
    ...(expiresInSeconds !== undefined ? { expiresInSeconds } : {}),
    ...(accessTokenExpiresAt ? { accessTokenExpiresAt } : {}),
    ...(input.tokenResponse.token_type
      ? { tokenType: input.tokenResponse.token_type }
      : {}),
  };
}
