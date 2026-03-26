"use client";

import { useSSEConnectionState } from "@/lib/hooks/useSSE";
import type { SSEConnectionState } from "@/lib/hooks/useSSE";
import { Tooltip } from "@/components/ui";

const colors: Record<SSEConnectionState, string> = {
  connected: "bg-joy",
  reconnecting: "bg-warning",
  disconnected: "bg-text-tertiary",
};

const labels: Record<SSEConnectionState, string> = {
  connected: "Connected",
  reconnecting: "Reconnecting...",
  disconnected: "Offline",
};

export function SSEIndicator() {
  const state = useSSEConnectionState();

  return (
    <Tooltip content={labels[state]}>
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${colors[state]} ${state === "connected" ? "animate-pulse" : ""}`}
        />
        <span className="hidden sm:inline font-mono text-[10px] text-text-tertiary">
          {labels[state]}
        </span>
      </div>
    </Tooltip>
  );
}
