import { type NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./constants";
import type { AppSession } from "./types";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

interface SessionInput {
  workspaceId: string;
  workspaceName: string;
  userId?: string | null;
  userName?: string | null;
  authMode: AppSession["authMode"];
}

function getSessionSecret(): string {
  const envSecret =
    process.env.SESSION_SECRET ?? process.env.APP_SESSION_SECRET ?? "";

  if (envSecret) return envSecret;

  if (process.env.NODE_ENV !== "production") {
    return "dev-session-secret-change-me";
  }

  throw new Error("SESSION_SECRET is required in production");
}

function bytesToBase64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64url"));
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}

async function signValue(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function isValidSession(value: unknown): value is AppSession {
  if (typeof value !== "object" || value === null) return false;

  const session = value as Partial<AppSession>;
  return (
    typeof session.workspaceId === "string" &&
    session.workspaceId.length > 0 &&
    typeof session.workspaceName === "string" &&
    session.workspaceName.length > 0 &&
    (typeof session.userId === "string" || session.userId === null) &&
    (typeof session.userName === "string" || session.userName === null) &&
    (session.authMode === "mock" || session.authMode === "slack" || session.authMode === "slack_openid") &&
    typeof session.issuedAt === "number" &&
    typeof session.expiresAt === "number"
  );
}

export async function createSessionToken(input: SessionInput): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const session: AppSession = {
    workspaceId: input.workspaceId,
    workspaceName: input.workspaceName,
    userId: input.userId ?? null,
    userName: input.userName ?? null,
    authMode: input.authMode,
    issuedAt,
    expiresAt: issuedAt + SESSION_MAX_AGE_SECONDS,
  };

  const payload = bytesToBase64Url(textEncoder.encode(JSON.stringify(session)));
  const signature = await signValue(payload);
  return `${payload}.${signature}`;
}

export async function setSessionCookie(
  response: NextResponse,
  input: SessionInput,
): Promise<void> {
  const token = await createSessionToken(input);

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function readSessionToken(token: string | null): Promise<AppSession | null> {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = await signValue(payload);
  if (!timingSafeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const session = JSON.parse(textDecoder.decode(base64UrlToBytes(payload))) as unknown;

    if (!isValidSession(session)) {
      return null;
    }

    if (session.expiresAt <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(
  request: NextRequest,
): Promise<AppSession | null> {
  return readSessionToken(request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null);
}

export async function requireAppSession(
  request: NextRequest,
): Promise<{ session: AppSession } | { response: NextResponse }> {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return {
      response: NextResponse.json(
        { error: "Unauthorized", ok: false },
        { status: 401 },
      ),
    };
  }

  return { session };
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.delete(AUTH_COOKIE_NAME);
}
