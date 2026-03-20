const PLACEHOLDER_PATTERNS = [
  /^Backfilled \d+ human messages\./i,
  /^No summary yet\b/i,
];

export function isPlaceholderSummary(summary: string | null | undefined): boolean {
  const normalized = summary?.trim();
  if (!normalized) {
    return true;
  }

  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(normalized));
}
