"use client";

import Link from "next/link";
import { MiniSparkline } from "@/components/charts/MiniSparkline";
import { getHealthColor, getChannelDotColor } from "@/lib/utils/emotionColor";
import { shortNumber, relativeTime } from "@/lib/utils/formatters";
import { ChannelPrefix } from "@/components/ui";
import type { ChannelCardData } from "@/lib/types";

const TYPE_BADGE_CONFIG: Record<string, { label: string; color: string }> = {
  client_delivery: { label: "Client", color: "var(--color-accent)" },
  client_support: { label: "Support", color: "var(--theme-status-warning)" },
  internal_engineering: { label: "Eng", color: "var(--theme-text-tertiary)" },
  internal_operations: { label: "Ops", color: "var(--theme-text-tertiary)" },
  internal_social: { label: "Social", color: "var(--theme-text-tertiary)" },
  automated: { label: "Auto", color: "var(--theme-text-tertiary)" },
};

interface ChannelCardProps {
  channel: ChannelCardData;
}

function formatCompactCount(count: number, noun: string): string {
  return `${shortNumber(count)} ${noun}${count === 1 ? "" : "s"}`;
}

function getActiveMessageCount(channel: ChannelCardData): number {
  return channel.activeMessageCount ?? channel.messageCount;
}

function getTotalImportedMessageCount(channel: ChannelCardData): number {
  return channel.totalImportedMessageCount ?? channel.messageCount;
}

function getReadyStatusCopy(channel: ChannelCardData): string {
  const activeMessageCount = getActiveMessageCount(channel);
  const totalImportedMessageCount = getTotalImportedMessageCount(channel);
  const activeWindowDays = channel.activeWindowDays ?? 7;
  const hasIncompleteBootstrap =
    totalImportedMessageCount > 0 && (
      channel.ingestReadiness === "not_started" ||
      channel.ingestReadiness === "hydrating" ||
      (
        channel.intelligenceReadiness === "missing" &&
        channel.latestSummaryCompleteness == null
      )
    );

  if (hasIncompleteBootstrap) {
    return "Setup still syncing";
  }

  if (channel.intelligenceReadiness === "bootstrap") {
    return "Calibrating — building intelligence";
  }

  if (channel.messageDispositionCounts.inFlight > 0) {
    return `Analyzing ${formatCompactCount(channel.messageDispositionCounts.inFlight, "msg")}`;
  }

  if (
    channel.intelligenceReadiness === "partial" ||
    channel.latestSummaryCompleteness === "partial" ||
    channel.hasActiveDegradations
  ) {
    return "Building full history — dashboard active";
  }

  if (channel.sparklineData.length === 1 && channel.sentimentSnapshot.totalAnalyzed > 0) {
    return "Trend baseline captured";
  }

  if (channel.sentimentSnapshot.totalAnalyzed > 0) {
    return `Tracking ${formatCompactCount(channel.sentimentSnapshot.totalAnalyzed, "analysis")}`;
  }

  if (activeMessageCount > 0) {
    return `Monitoring ${formatCompactCount(activeMessageCount, "recent msg")}`;
  }

  if (totalImportedMessageCount > 0) {
    return `No recent messages in the last ${activeWindowDays}d`;
  }

  return "No messages ingested yet";
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const isReady = channel.status === "ready";
  const hasSparkline = channel.sparklineData.length > 1;
  const isFailed = channel.status === "failed";
  const isRemoved = channel.status === "removed";
  const sparkColor = isReady ? getHealthColor(channel.health) : "var(--theme-status-neutral)";
  const dotColor = isFailed ? "var(--color-error)" : getChannelDotColor(channel.status, channel.health);
  const isInitializing = channel.status === "initializing";
  const readyStatusCopy = getReadyStatusCopy(channel);

  return (
    <Link
      href={`/dashboard/channels/${channel.id}`}
      aria-label={`Channel ${channel.name}, ${isReady ? channel.health : channel.status}`}
      className="group flex flex-col rounded-xl border border-border-subtle bg-bg-secondary/40 px-4 py-4 transition-all duration-200 hover:border-border-hover hover:bg-bg-secondary/70 hover:shadow-md"
    >
      {/* Channel name */}
      <div className="mb-3 flex items-center gap-1.5">
        <span
          className={[
            "h-2 w-2 rounded-full flex-shrink-0",
            isInitializing ? "animate-pulse" : "",
          ].join(" ")}
          style={{ backgroundColor: dotColor }}
        />
        <span className="font-mono text-xs font-medium text-text-primary truncate flex items-center gap-0.5">
          <ChannelPrefix type={channel.conversationType} size={11} />
          {channel.name}
        </span>
        {isReady && (
          <span
            className="ml-auto flex-shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
            style={{
              color: getHealthColor(channel.health),
              backgroundColor: `color-mix(in srgb, ${getHealthColor(channel.health)} 12%, transparent)`,
            }}
          >
            {channel.health === "at-risk" ? "Risk" : channel.health === "attention" ? "Watch" : "OK"}
          </span>
        )}
        {!isReady && channel.channelType && channel.channelType !== "unclassified" && TYPE_BADGE_CONFIG[channel.channelType] && (
          <span
            className="ml-auto flex-shrink-0 rounded-radius-full px-1.5 py-0.5 font-mono text-[9px] font-medium"
            style={{
              color: TYPE_BADGE_CONFIG[channel.channelType].color,
              backgroundColor: `color-mix(in srgb, ${TYPE_BADGE_CONFIG[channel.channelType].color} 10%, transparent)`,
              border: (channel.classificationConfidence ?? 0) < 0.5 ? "1px dashed currentColor" : "none",
            }}
          >
            {TYPE_BADGE_CONFIG[channel.channelType].label}
          </span>
        )}
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
            {readyStatusCopy}
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
      <div className="mt-2 flex items-center justify-between gap-1">
        <p className="font-mono text-[10px] text-text-tertiary truncate">
          {isReady
            ? getActiveMessageCount(channel) > 0
              ? `${shortNumber(getActiveMessageCount(channel))} recent msgs`
              : getTotalImportedMessageCount(channel) > 0
                ? "No recent msgs"
                : "No msgs yet"
            : isFailed
              ? "Failed"
              : isRemoved
                ? "Removed"
              : isInitializing
                ? "Backfilling"
                : "Queued"}
        </p>
        {channel.lastActivity && (
          <p className="font-mono text-[10px] text-text-tertiary shrink-0">
            {relativeTime(channel.lastActivity)}
          </p>
        )}
      </div>
    </Link>
  );
}
