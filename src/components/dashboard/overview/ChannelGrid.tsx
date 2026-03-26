"use client";

import { ChannelCard } from "./ChannelCard";
import { Skeleton } from "@/components/ui";
import type { ChannelCardData } from "@/lib/types";

interface ChannelGridProps {
  channels: ChannelCardData[] | undefined;
  isLoading: boolean;
  isUnavailable?: boolean;
}

export function ChannelGrid({
  channels,
  isLoading,
  isUnavailable = false,
}: ChannelGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (isUnavailable) {
    return (
      <div className="rounded-xl border border-warning/25 bg-warning/8 px-6 py-8 text-center">
        <p className="font-body text-xs text-text-tertiary">
          Channel-health data is temporarily unavailable. PulseBoard could not verify the current channel list from the backend.
        </p>
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-secondary/30 px-6 py-8 text-center">
        <p className="font-body text-xs text-text-tertiary">
          No channels connected yet. Invite the bot to a channel in Slack to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {channels.map((channel) => (
        <ChannelCard key={channel.id} channel={channel} />
      ))}
    </div>
  );
}
