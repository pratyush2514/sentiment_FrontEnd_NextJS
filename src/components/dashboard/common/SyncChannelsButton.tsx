"use client";

import { IconRefresh, IconPlus, IconLoader2 } from "@tabler/icons-react";
import { Tooltip } from "@/components/ui";
import { useSyncChannels } from "@/lib/hooks";

interface SyncChannelsButtonProps {
  variant?: "full" | "icon";
  collapsed?: boolean;
}

export function SyncChannelsButton({ variant = "full", collapsed = false }: SyncChannelsButtonProps) {
  const { syncChannels, isSyncing, lastResult, error } = useSyncChannels();

  if (variant === "icon") {
    return (
      <Tooltip content={isSyncing ? "Syncing..." : lastResult ? feedbackText(lastResult.newlyTracked) : "Sync channels from Slack"} side="bottom">
        <button
          type="button"
          onClick={() => void syncChannels()}
          disabled={isSyncing}
          className={[
            "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors duration-150",
            collapsed ? "justify-center" : "md:justify-center lg:justify-start",
            "text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/30 disabled:opacity-50",
          ].join(" ")}
        >
          {isSyncing ? (
            <IconLoader2 size={12} className="animate-spin flex-shrink-0" />
          ) : (
            <IconPlus size={12} className="flex-shrink-0" />
          )}
          <span className={collapsed ? "hidden" : "hidden lg:inline font-mono text-[11px] truncate"}>
            Add channels
          </span>
        </button>
      </Tooltip>
    );
  }

  // Full variant
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => void syncChannels()}
        disabled={isSyncing}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-2.5 py-1 font-mono text-[10px] text-text-secondary transition-colors hover:bg-bg-tertiary/50 hover:text-text-primary disabled:opacity-50"
      >
        {isSyncing ? (
          <IconLoader2 size={12} className="animate-spin" />
        ) : (
          <IconRefresh size={12} />
        )}
        {isSyncing ? "Syncing..." : "Sync Channels"}
      </button>
      {lastResult && (
        <span className={`font-mono text-[10px] animate-fade-in ${lastResult.newlyTracked > 0 ? "text-accent" : "text-text-tertiary"}`}>
          {feedbackText(lastResult.newlyTracked)}
        </span>
      )}
      {error && (
        <span className="font-mono text-[10px] text-anger animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
}

function feedbackText(newlyTracked: number): string {
  if (newlyTracked === 0) return "Up to date";
  return `${newlyTracked} new channel${newlyTracked === 1 ? "" : "s"} found`;
}
