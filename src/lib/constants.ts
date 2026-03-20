export const ROUTES = {
  HOME: "/",
  CONNECT: "/connect",
  SETUP: "/setup",
  DASHBOARD: "/dashboard",
  CHANNEL_DETAIL: (id: string) => `/dashboard/channels/${id}` as const,
  THREAD_DETAIL: (channelId: string, ts: string) =>
    `/dashboard/channels/${channelId}/threads/${ts}` as const,
  SETTINGS: "/dashboard/settings",
  API_SLACK_AUTH: "/api/auth/slack",
  API_SLACK_CALLBACK: "/api/auth/slack/callback",
  API_SLACK_LOGIN: "/api/auth/slack/login",
  API_SLACK_LOGIN_CALLBACK: "/api/auth/slack/login/callback",
  API_SLACK_INSTALL: "/api/auth/slack/install",
  API_SLACK_INSTALL_CALLBACK: "/api/auth/slack/install/callback",
  API_CHANNELS: "/api/channels",
  API_CHANNEL_STATE: (id: string) => `/api/channels/${id}/state` as const,
  API_CHANNEL_MESSAGES: (id: string) => `/api/channels/${id}/messages` as const,
  API_CHANNEL_TIMELINE: (id: string) => `/api/channels/${id}/timeline` as const,
  API_OVERVIEW: "/api/analytics/overview",
  API_LOGOUT: "/api/auth/logout",
  API_EVENTS: "/api/events/stream",
} as const;

/** Bot scopes for workspace installation (OAuth v2) */
export const SLACK_SCOPES = [
  "channels:history",
  "channels:read",
  "groups:read",
  "groups:history",
  "users:read",
  "team:read",
] as const;

/** Extended bot scopes including chat:write for bot installation */
export const SLACK_BOT_INSTALL_SCOPES = [
  "channels:history",
  "channels:read",
  "groups:read",
  "groups:history",
  "users:read",
  "team:read",
  "chat:write",
  "im:write",
] as const;

/** OpenID Connect scopes for user sign-in (identity only) */
export const SLACK_OPENID_SCOPES = [
  "openid",
  "profile",
  "email",
] as const;

export const AUTH_COOKIE_NAME = "pb_session";
export const OAUTH_STATE_COOKIE_NAME = "pb_oauth_state";
