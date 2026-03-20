"use client";

import { useState } from "react";
import { IconBrandSlack, IconLoader2 } from "@tabler/icons-react";
import { Tooltip } from "@/components/ui";

interface OpenInSlackButtonProps {
  channelId: string;
  messageTs: string;
  className?: string;
  label?: string;
}

export function OpenInSlackButton({
  channelId,
  messageTs,
  className = "",
  label = "Open in Slack",
}: OpenInSlackButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        channelId,
        messageTs,
      });
      const response = await fetch(`/api/slack/permalink?${params.toString()}`);
      const json = await response.json();

      if (!response.ok || !json?.data?.permalink) {
        throw new Error(json?.error ?? "Unable to open Slack message");
      }

      window.open(json.data.permalink as string, "_blank", "noopener,noreferrer");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={[
        "flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] transition-colors",
        "text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/50",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      ].join(" ")}
    >
      <Tooltip content={label}>
        <span className="flex items-center gap-1">
          {isLoading ? <IconLoader2 size={11} className="animate-spin" /> : <IconBrandSlack size={11} />}
          <span className="hidden sm:inline">{label}</span>
        </span>
      </Tooltip>
    </button>
  );
}
