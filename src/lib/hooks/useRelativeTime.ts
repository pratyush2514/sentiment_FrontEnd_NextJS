"use client";

import { useState, useEffect } from "react";
import { relativeTime, formatOverdueDuration } from "@/lib/utils/formatters";

/**
 * Live-updating relative time string that re-renders every `intervalMs`.
 * Keeps timestamps like "5m ago" fresh without manual revalidation.
 */
export function useRelativeTime(
  dateStr: string | null | undefined,
  intervalMs = 30_000,
): string {
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return relativeTime(dateStr);
}

/**
 * Live-updating overdue duration string (e.g., "2d 5h overdue").
 * Returns "" if not yet overdue or no dueAt provided.
 */
export function useOverdueDuration(
  dueAtStr: string | null | undefined,
  intervalMs = 30_000,
): string {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!dueAtStr) return;
    const timer = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(timer);
  }, [dueAtStr, intervalMs]);
  if (!dueAtStr) return "";
  return formatOverdueDuration(dueAtStr);
}
