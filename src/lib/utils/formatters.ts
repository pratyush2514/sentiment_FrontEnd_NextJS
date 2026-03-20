// ─── Formatters ──────────────────────────────────────────────────────────

/**
 * Relative time string (e.g., "2 hours ago", "3 days ago")
 */
export function parseDateValue(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;

  const direct = new Date(dateStr).getTime();
  if (Number.isFinite(direct)) {
    return direct;
  }

  // Slack timestamps are typically "<seconds>.<micros>" and need manual parsing.
  if (/^\d+(\.\d+)?$/.test(dateStr)) {
    const slackSeconds = Number.parseFloat(dateStr);
    if (Number.isFinite(slackSeconds)) {
      return Math.round(slackSeconds * 1000);
    }
  }

  return null;
}

export function relativeTime(dateStr: string | null | undefined): string {
  const now = Date.now();
  const then = parseDateValue(dateStr);
  if (then === null) return "recently";
  const diffMs = now - then;
  if (!Number.isFinite(diffMs) || diffMs < 0) return "recently";
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return `${Math.floor(diffDay / 30)}mo ago`;
}

/**
 * Compute a human-friendly overdue duration from a dueAt ISO timestamp.
 * Returns "" if not yet overdue, otherwise "2d 5h overdue", "3h overdue", "45m overdue".
 */
export function formatOverdueDuration(dueAtStr: string | null | undefined): string {
  const dueAt = parseDateValue(dueAtStr);
  if (dueAt === null) return "";
  const now = Date.now();
  const overdueMs = now - dueAt;
  if (overdueMs <= 0) return "";

  const totalHours = Math.floor(overdueMs / (60 * 60 * 1000));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days >= 1) return `${days}d ${hours}h overdue`;
  if (totalHours >= 1) return `${totalHours}h overdue`;

  const mins = Math.floor(overdueMs / (60 * 1000));
  return mins > 0 ? `${mins}m overdue` : "just now overdue";
}

export function formatAbsoluteDateTime(dateStr: string | null | undefined): string | null {
  const value = parseDateValue(dateStr);
  if (value === null) return null;

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Short number format (e.g., 1234 → "1.2k")
 */
export function shortNumber(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  if (n < 1000000) return `${Math.floor(n / 1000)}k`;
  return `${(n / 1000000).toFixed(1)}M`;
}

/**
 * Percentage format (e.g., 0.82 → "82%")
 */
export function percentFormat(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * Format a number with commas (e.g., 12345 → "12,345")
 */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}
