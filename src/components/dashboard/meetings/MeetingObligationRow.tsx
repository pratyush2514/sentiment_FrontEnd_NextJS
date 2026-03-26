"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import type { MeetingObligation } from "@/lib/hooks";
import { updateObligationStatus } from "@/lib/hooks";
import { toDisplayErrorMessage } from "@/lib/errors";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  action_item: { label: "Action", color: "var(--color-accent)" },
  decision: { label: "Decision", color: "var(--theme-status-success)" },
  commitment: { label: "Commitment", color: "var(--theme-status-warning)" },
  question: { label: "Question", color: "var(--theme-text-tertiary)" },
  risk: { label: "Risk", color: "var(--theme-status-error)" },
  next_step: { label: "Next Step", color: "var(--color-accent)" },
};

const PRIORITY_CONFIG: Record<string, { color: string }> = {
  critical: { color: "var(--theme-status-error)" },
  high: { color: "var(--theme-status-error)" },
  medium: { color: "var(--theme-status-warning)" },
  low: { color: "var(--theme-text-tertiary)" },
};

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "completed" || status === "dismissed") return false;
  return new Date(dueDate) < new Date();
}

function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

interface MeetingObligationRowProps {
  obligation: MeetingObligation;
  compact?: boolean;
}

export function MeetingObligationRow({ obligation, compact = false }: MeetingObligationRowProps) {
  const { mutate } = useSWRConfig();
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // mountedRef pattern removed — React no longer warns on unmounted setState
  const typeConfig = TYPE_CONFIG[obligation.obligation_type] ?? { label: obligation.obligation_type, color: "var(--theme-text-tertiary)" };
  const priorityConfig = PRIORITY_CONFIG[obligation.priority] ?? { color: "var(--theme-text-tertiary)" };
  const overdue = isOverdue(obligation.due_date, obligation.status);
  const isDone = obligation.status === "completed" || obligation.status === "dismissed";

  async function handleStatusChange(newStatus: string) {
    setUpdating(true);
    setActionError(null);
    try {
      await updateObligationStatus(obligation.id, newStatus);
      await mutate(
        (key: unknown) => typeof key === "string" && key.startsWith("/api/meetings/obligations"),
        undefined,
        { revalidate: true },
      );
    } catch (err) {
      setActionError(
        toDisplayErrorMessage(
          err,
          "Couldn’t update this meeting item. Please try again.",
        ),
      );
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className={`${compact ? "" : "px-1"} ${updating ? "opacity-50" : ""}`}>
      <div className="group flex items-center justify-between gap-element py-1.5">
        <div className="flex items-center gap-element min-w-0 flex-1">
        {/* Status indicator — clickable to toggle done */}
        <button
          type="button"
          disabled={updating}
          onClick={() => handleStatusChange(isDone ? "open" : "completed")}
          className="flex-shrink-0 flex h-4 w-4 items-center justify-center rounded-radius-full border transition-colors hover:border-accent/50 disabled:pointer-events-none"
          style={{
            borderColor: isDone
              ? "var(--theme-status-success)"
              : overdue
                ? "var(--theme-status-error)"
                : "var(--theme-border-default)",
            backgroundColor: isDone
              ? "color-mix(in srgb, var(--theme-status-success) 15%, transparent)"
              : "transparent",
          }}
          aria-label={isDone ? "Mark as open" : "Mark as complete"}
        >
          {isDone && (
            <span className="text-[10px]" style={{ color: "var(--theme-status-success)" }}>&#10003;</span>
          )}
          {!isDone && overdue && (
            <span className="h-1.5 w-1.5 rounded-radius-full animate-[pulse-dot_2s_infinite]" style={{ backgroundColor: "var(--theme-status-error)" }} />
          )}
        </button>

        {/* Title */}
        <span className={`font-body text-body-sm truncate ${isDone ? "text-text-tertiary line-through" : "text-text-primary"}`}>
          {obligation.title}
        </span>

        {/* Type badge */}
        {!compact && (
          <span
            className="flex-shrink-0 inline-flex items-center rounded-radius-full px-1.5 py-0.5 font-mono text-[9px] font-medium"
            style={{
              color: typeConfig.color,
              backgroundColor: `color-mix(in srgb, ${typeConfig.color} 10%, transparent)`,
            }}
          >
            {typeConfig.label}
          </span>
        )}
        </div>

        <div className="flex items-center gap-element flex-shrink-0">
        {/* Owner */}
        {obligation.owner_name && (
          <span className="font-mono text-badge text-text-secondary truncate max-w-[100px]">
            {obligation.owner_name}
          </span>
        )}

        {/* Due date */}
        {obligation.due_date && (
          <span className={`font-mono text-badge ${overdue ? "text-error font-semibold" : "text-text-tertiary"}`}>
            {overdue ? "overdue " : ""}{formatShortDate(obligation.due_date)}
          </span>
        )}

        {/* Priority */}
        {!compact && obligation.priority !== "low" && (
          <span
            className="flex-shrink-0 inline-flex items-center gap-0.5 rounded-radius-full px-1.5 py-0.5 font-mono text-[9px] font-medium"
            style={{
              color: priorityConfig.color,
              backgroundColor: `color-mix(in srgb, ${priorityConfig.color} 10%, transparent)`,
            }}
          >
            <span className="h-1 w-1 rounded-radius-full" style={{ backgroundColor: priorityConfig.color }} />
            {obligation.priority}
          </span>
        )}

        {/* Dismiss button — visible on hover, only for non-compact and non-done items */}
        {!compact && !isDone && (
          <button
            type="button"
            disabled={updating}
            onClick={() => handleStatusChange("dismissed")}
            className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[9px] text-text-tertiary hover:text-error disabled:pointer-events-none"
            aria-label="Dismiss"
          >
            dismiss
          </button>
        )}
        </div>
      </div>
      {actionError && (
        <p className="mt-1 font-mono text-[10px] text-error">{actionError}</p>
      )}
    </div>
  );
}
