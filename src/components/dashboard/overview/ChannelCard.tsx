"use client";

import Link from "next/link";
import { MiniSparkline } from "@/components/charts/MiniSparkline";
import { getHealthColor, getChannelDotColor } from "@/lib/utils/emotionColor";
import { shortNumber, relativeTime } from "@/lib/utils/formatters";
import { ChannelPrefix } from "@/components/ui";
import type { ChannelCardData } from "@/lib/types";

interface ChannelCardProps {
  channel: ChannelCardData;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const isReady = channel.status === "ready";
  const hasSparkline = channel.sparklineData.length > 1;
  const isFailed = channel.status === "failed";
  const isRemoved = channel.status === "removed";
  const sparkColor = isReady ? getHealthColor(channel.health) : "var(--theme-status-neutral)";
  const dotColor = isFailed ? "var(--color-error)" : getChannelDotColor(channel.status, channel.health);
  const isInitializing = channel.status === "initializing";

  return (
    <Link
      href={`/dashboard/channels/${channel.id}`}
      aria-label={`Channel ${channel.name}, ${isReady ? channel.health : channel.status}`}
      className="group flex flex-col rounded-xl border border-border-subtle bg-bg-secondary/40 px-4 py-3 transition-all duration-200 hover:border-border-hover hover:bg-bg-secondary/70"
    >
      {/* Channel name */}
      <div className="mb-2.5 flex items-center gap-1.5">
        <span
          className={[
            "h-1.5 w-1.5 rounded-full flex-shrink-0",
            isInitializing ? "animate-pulse" : "",
          ].join(" ")}
          style={{ backgroundColor: dotColor }}
        />
        <span className="font-mono text-[11px] font-medium text-text-primary truncate flex items-center gap-0.5">
          <ChannelPrefix type={channel.conversationType} size={10} />
          {channel.name}
        </span>
      </div>

      {/* Sparkline fills the bottom portion */}
      {isReady && hasSparkline ? (
        <MiniSparkline
          data={channel.sparklineData}
          color={sparkColor}
          width={120}
          height={36}
          className="w-full"
        />
      ) : isReady ? (
        <div className="h-9 flex items-center">
          <span className="font-mono text-[9px] text-text-tertiary">
            {channel.messageCount > 0 ? "Ready - trend still forming" : "Ready - no messages ingested yet"}
          </span>
        </div>
      ) : isInitializing ? (
        <div className="h-9 flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-bg-tertiary/60 overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-accent/40 animate-pulse" />
          </div>
          <span className="font-mono text-[9px] text-text-tertiary shrink-0">
            Backfilling...
          </span>
        </div>
      ) : isFailed ? (
        <div className="h-9 flex items-center">
          <span className="font-mono text-[9px] text-anger">
            Backfill failed — will retry
          </span>
        </div>
      ) : isRemoved ? (
        <div className="h-9 flex items-center">
          <span className="font-mono text-[9px] text-text-tertiary">
            Bot removed from Slack
          </span>
        </div>
      ) : (
        <div className="h-9 flex items-center">
          <span className="font-mono text-[9px] text-text-tertiary animate-pulse">
            Queued...
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-1.5 flex items-center justify-between gap-1">
        <p className="font-mono text-[9px] text-text-tertiary truncate">
          {isReady
            ? `${shortNumber(channel.messageCount)} msgs`
            : isFailed
              ? "Failed"
              : isRemoved
                ? "Removed"
              : isInitializing
                ? "Backfilling"
                : "Queued"}
        </p>
        {channel.lastActivity && (
          <p className="font-mono text-[9px] text-text-tertiary shrink-0">
            {relativeTime(channel.lastActivity)}
          </p>
        )}
      </div>
    </Link>
  );
}
