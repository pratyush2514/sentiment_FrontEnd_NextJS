const ERROR_MESSAGE_BY_CODE: Record<string, string> = {
  internal_error: "Something went wrong on the server. Please try again.",
  public_base_url_not_configured:
    "Set PUBLIC_BASE_URL on the backend before connecting Fathom.",
  invalid_api_key:
    "That Fathom API key was rejected. Double-check it and try again.",
  fathom_unavailable:
    "Fathom is temporarily unavailable. Please try again in a moment.",
  fathom_not_connected:
    "Connect Fathom before starting a historical import.",
  historical_sync_enqueue_failed:
    "Couldn’t start the historical import. Please try again in a moment.",
  workspace_mismatch:
    "Your session is out of sync with the selected workspace. Refresh and try again.",
  disconnect_failed: "Couldn’t disconnect right now. Please try again.",
};

function sentenceCase(value: string): string {
  const normalized = value.trim().replace(/[_-]+/g, " ");
  if (!normalized) {
    return "Something went wrong. Please try again.";
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function humanizeErrorCode(code?: string | null): string {
  const normalized = code?.trim();
  if (!normalized) {
    return "Something went wrong. Please try again.";
  }

  return ERROR_MESSAGE_BY_CODE[normalized] ?? sentenceCase(normalized);
}

export function extractApiErrorMessage(
  payload: unknown,
  fallback: string,
): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }
  if (typeof record.error === "string" && record.error.trim()) {
    return humanizeErrorCode(record.error.trim());
  }

  return fallback;
}

export function toDisplayErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }
  return fallback;
}
