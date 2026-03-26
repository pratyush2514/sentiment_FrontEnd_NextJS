/**
 * Server-side utility for proxying API requests to the backend service.
 * Used exclusively inside Next.js API route handlers — never imported client-side.
 */
import { extractApiErrorMessage } from "./errors";

export class BackendError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "BackendError";
  }
}

interface BackendFetchOptions {
  token?: string | null;
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
  workspaceId?: string | null;
  headers?: Record<string, string>;
}

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";
const BACKEND_API_TOKEN = process.env.BACKEND_API_TOKEN ?? "";

if (process.env.NODE_ENV === "production") {
  if (!process.env.BACKEND_URL) {
    throw new Error("BACKEND_URL is required in production");
  }
  if (!process.env.BACKEND_API_TOKEN) {
    throw new Error("BACKEND_API_TOKEN is required in production");
  }
}

function buildBackendUrl(path: string, workspaceId?: string | null): string {
  const normalizedBase = BACKEND_URL.endsWith("/")
    ? BACKEND_URL
    : `${BACKEND_URL}/`;
  const normalizedPath = path.startsWith("/")
    ? path.slice(1)
    : path;
  const url = new URL(normalizedPath, normalizedBase);

  if (workspaceId) {
    url.searchParams.set("workspace_id", workspaceId);
  }

  return url.toString();
}

export async function backendFetch<T>(
  path: string,
  options?: BackendFetchOptions,
): Promise<T> {
  const token = options?.token || BACKEND_API_TOKEN;
  const url = buildBackendUrl(path, options?.workspaceId);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: options?.method ?? "GET",
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    signal: options?.signal,
  });

  if (!res.ok) {
    let code = "backend_error";
    let message = `Backend returned ${res.status}`;
    try {
      const err = (await res.json()) as Record<string, unknown>;
      if (typeof err.error === "string") code = err.error;
      message = extractApiErrorMessage(err, message);
    } catch {
      // response body was not JSON
    }
    throw new BackendError(res.status, code, message);
  }

  return (await res.json()) as T;
}

/**
 * Open a streaming fetch to the backend (for SSE proxy).
 * Returns the raw Response so the caller can pipe the body stream.
 */
export async function backendStream(
  path: string,
  options?: { token?: string | null; signal?: AbortSignal; workspaceId?: string | null },
): Promise<Response> {
  const token = options?.token || BACKEND_API_TOKEN;
  const url = buildBackendUrl(path, options?.workspaceId);

  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    headers,
    signal: options?.signal,
  });
}
