const DEFAULT_DEV_APP_URL = "http://localhost:3001";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getAppBaseUrl(fallbackOrigin?: string): string {
  const requestOrigin = fallbackOrigin?.trim();
  if (requestOrigin) {
    return requestOrigin;
  }

  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured;
  }

  if (isProduction()) {
    throw new Error("NEXT_PUBLIC_APP_URL is required in production");
  }

  return fallbackOrigin ?? DEFAULT_DEV_APP_URL;
}

export function getRequiredSlackClientId(): string {
  const clientId = process.env.SLACK_CLIENT_ID?.trim();
  if (clientId) {
    return clientId;
  }

  throw new Error("SLACK_CLIENT_ID is required");
}

export function getRequiredSlackClientSecret(): string {
  const clientSecret = process.env.SLACK_CLIENT_SECRET?.trim();
  if (clientSecret) {
    return clientSecret;
  }

  throw new Error("SLACK_CLIENT_SECRET is required");
}

export function getSlackRedirectUri(
  callbackPath: string,
  fallbackOrigin?: string,
): string {
  const configured = process.env.SLACK_REDIRECT_URI?.trim();
  if (configured) {
    return configured;
  }

  return `${getAppBaseUrl(fallbackOrigin)}${callbackPath}`;
}
