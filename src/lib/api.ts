export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    // Global session expiration handler: redirect to login on any 401
    if (res.status === 401 && typeof window !== "undefined" && !url.includes("/api/session")) {
      window.location.replace("/connect");
    }
    let message = `API error: ${res.status}`;
    try {
      const err = await res.json();
      if (typeof err.error === "string") message = err.error;
    } catch {
      // response body was not JSON
    }
    throw new ApiError(res.status, message);
  }
  const json = await res.json();
  if (json.ok === false) {
    throw new ApiError(res.status || 500, json.error ?? "Unknown API error");
  }
  return json.data as T;
}
