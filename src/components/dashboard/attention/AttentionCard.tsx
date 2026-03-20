"use client";

import {
  IconAlertTriangle,
  IconClockHour4,
  IconClockPause,
  IconMessageCircle2,
  IconShieldExclamation,
} from "@tabler/icons-react";
import { AlertContextPanel } from "@/components/dashboard/alerts/AlertContextPanel";
import { useRelativeTime, useOverdueDuration } from "@/lib/hooks";
import { formatAbsoluteDateTime } from "@/lib/utils/formatters";
import { AttentionBadgeRow } from "./AttentionBadgeRow";
import { AttentionResponders } from "./AttentionResponders";
import { AttentionWorkflowNotes } from "./AttentionWorkflowNotes";
import { AttentionActions } from "./AttentionActions";
import type { AttentionGroup, AttentionItem } from "@/lib/types";

function groupLabel(group: AttentionGroup): string {
  switch (group) {
    case "needs_reply": return "Needs reply";
    case "acknowledged": return "Acknowledged";
    case "escalated": return "Escalated";
    case "sentiment_risk": return "Sentiment risk";
    case "resolved_recently": return "Resolved recently";
  }
}

function renderGroupIcon(group: AttentionGroup) {
  switch (group) {
    case "acknowledged": return <IconClockPause size={11} />;
    case "escalated": return <IconClockHour4 size={11} />;
    case "sentiment_risk": return <IconAlertTriangle size={11} />;
    case "resolved_recently": return <IconShieldExclamation size={11} />;
    default: return <IconMessageCircle2 size={11} />;
  }
}

interface AttentionCardProps {
  item: AttentionItem;
  isOpen: boolean;
  isMutating: boolean;
  onToggleContext: (id: string) => void;
  onFollowUpAction: (
    item: AttentionItem,
    action: "resolve" | "dismiss" | "snooze" | "acknowledge_waiting" | "reopen",
  ) => Promise<void>;
}

export function AttentionCard({ item, isOpen, isMutating, onToggleContext, onFollowUpAction }: AttentionCardProps) {
  const liveCreatedAt = useRelativeTime(item.createdAt);
  const overdueLabel = useOverdueDuration(item.dueAt);
  const exactDueAt = formatAbsoluteDateTime(item.dueAt);

  return (
    <div className="rounded-radius-lg border border-border-subtle bg-bg-secondary/55 p-panel">
      <AttentionBadgeRow item={item} relativeTime={liveCreatedAt} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {/* Group + actor + due date */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-bg-primary/60 px-2 py-1 font-mono text-badge text-text-secondary">
              {renderGroupIcon(item.group)}
              {groupLabel(item.group)}
            </span>
            {item.actorName && (
              <span className="font-mono text-badge text-text-tertiary">from {item.actorName}</span>
            )}
            {item.dueAt && (
              <span
                className={`font-mono text-badge ${overdueLabel ? "text-anger" : "text-text-tertiary"}`}
                title={exactDueAt ? `Due ${exactDueAt}` : undefined}
              >
                {overdueLabel || (exactDueAt ? `due ${exactDueAt}` : "due soon")}
              </span>
            )}
          </div>

          {/* Title + message */}
          <h2 className="mt-3 font-sans text-base font-semibold text-text-primary">{item.title}</h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-text-secondary">{item.message}</p>

          {/* Why this matters */}
          <div className="mt-3 rounded-xl border border-border-subtle/70 bg-bg-primary/45 p-3">
            <p className="font-mono text-badge uppercase tracking-wider text-text-tertiary">Why this matters</p>
            <p className="mt-2 font-body text-sm leading-relaxed text-text-primary/90">{item.whyThisMatters}</p>
          </div>

          <AttentionResponders item={item} />
          <AttentionWorkflowNotes item={item} />
        </div>

        <AttentionActions
          item={item}
          isOpen={isOpen}
          isMutating={isMutating}
          onToggleContext={onToggleContext}
          onFollowUpAction={onFollowUpAction}
        />
      </div>

      {isOpen && <AlertContextPanel alert={item} />}
    </div>
  );
}
