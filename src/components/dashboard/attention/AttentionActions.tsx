"use client";

import Link from "next/link";
import {
  IconArrowRight,
  IconBellOff,
  IconCheck,
  IconClockPause,
  IconMessageCircle2,
} from "@tabler/icons-react";
import { OpenInSlackButton } from "@/components/dashboard/common/OpenInSlackButton";
import type { AttentionItem } from "@/lib/types";

interface AttentionActionsProps {
  item: AttentionItem;
  isOpen: boolean;
  isMutating: boolean;
  onToggleContext: (id: string) => void;
  onFollowUpAction: (
    item: AttentionItem,
    action: "resolve" | "dismiss" | "snooze" | "acknowledge_waiting" | "reopen",
  ) => Promise<void>;
}

const btnBase = "inline-flex items-center gap-1 rounded-md font-mono text-badge transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
const btnGhost = `${btnBase} border border-border-subtle/70 px-2.5 py-1.5 text-text-secondary hover:bg-bg-tertiary/40`;

export function AttentionActions({ item, isOpen, isMutating, onToggleContext, onFollowUpAction }: AttentionActionsProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 lg:max-w-[16rem] lg:justify-end">
      <button type="button" onClick={() => onToggleContext(item.id)} className={btnGhost}>
        <IconMessageCircle2 size={11} />
        {isOpen ? "Hide context" : "Open context"}
      </button>

      {item.followUpItemId && item.resolutionState !== "resolved" && (
        <>
          {item.workflowState !== "acknowledged_waiting" && (
            <button
              type="button"
              onClick={() => void onFollowUpAction(item, "acknowledge_waiting")}
              disabled={isMutating}
              className={`${btnBase} border border-warning/30 px-2.5 py-1.5 text-warning hover:bg-warning/10`}
            >
              <IconClockPause size={11} />
              {isMutating ? "Saving..." : "Mark waiting"}
            </button>
          )}
          <button
            type="button"
            onClick={() => void onFollowUpAction(item, "resolve")}
            disabled={isMutating}
            className={`${btnBase} border border-positive/30 px-2.5 py-1.5 text-positive hover:bg-positive/10`}
          >
            <IconCheck size={11} />
            {isMutating ? "Saving..." : "Resolve"}
          </button>
          {item.workflowState === "acknowledged_waiting" && (
            <button
              type="button"
              onClick={() => void onFollowUpAction(item, "reopen")}
              disabled={isMutating}
              className={`${btnBase} border border-accent/30 px-2.5 py-1.5 text-accent hover:bg-accent/10`}
            >
              <IconArrowRight size={11} />
              Reopen
            </button>
          )}
          <button
            type="button"
            onClick={() => void onFollowUpAction(item, "snooze")}
            disabled={isMutating}
            className={btnGhost}
          >
            <IconClockPause size={11} />
            Snooze
          </button>
          <button
            type="button"
            onClick={() => void onFollowUpAction(item, "dismiss")}
            disabled={isMutating}
            className={btnGhost}
          >
            <IconBellOff size={11} />
            Dismiss
          </button>
        </>
      )}

      <OpenInSlackButton channelId={item.channelId} messageTs={item.sourceMessageTs} />
      <Link
        href={item.contextHref}
        className={`${btnBase} px-2.5 py-1.5 text-accent hover:bg-accent/10 hover:text-accent-hover`}
      >
        Investigate
        <IconArrowRight size={10} />
      </Link>
    </div>
  );
}
