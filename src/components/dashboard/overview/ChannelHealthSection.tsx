"use client";

import { useMemo, useState } from "react";
import { SearchInput, FilterPill, Select } from "@/components/primitives";
import { ChannelGrid } from "@/components/dashboard/overview/ChannelGrid";
import { SyncChannelsButton } from "@/components/dashboard/common/SyncChannelsButton";
import { Skeleton } from "@/components/ui";
import { parseDateValue } from "@/lib/utils/formatters";
import type { ChannelCardData, ChannelHealth } from "@/lib/types";

type ChannelSort = "activity" | "risk" | "alpha" | "messages";

const HEALTH_FILTERS: { label: string; value: ChannelHealth | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Healthy", value: "healthy" },
  { label: "Attention", value: "attention" },
  { label: "At Risk", value: "at-risk" },
];

const CHANNEL_SORTS: { label: string; value: string }[] = [
  { label: "Last activity", value: "activity" },
  { label: "Risk level", value: "risk" },
  { label: "Alphabetical", value: "alpha" },
  { label: "Recent messages", value: "messages" },
];

const HEALTH_RISK_ORDER: Record<ChannelHealth, number> = {
  "at-risk": 0,
  attention: 1,
  healthy: 2,
};

function sortChannels(channels: ChannelCardData[], sort: ChannelSort): ChannelCardData[] {
  return [...channels].sort((a, b) => {
    switch (sort) {
      case "activity":
        return (parseDateValue(b.lastActivity) ?? 0) - (parseDateValue(a.lastActivity) ?? 0);
      case "risk":
        return (HEALTH_RISK_ORDER[a.health] ?? 2) - (HEALTH_RISK_ORDER[b.health] ?? 2);
      case "alpha":
        return a.name.localeCompare(b.name);
      case "messages":
        return (b.activeMessageCount ?? b.messageCount) - (a.activeMessageCount ?? a.messageCount);
      default:
        return 0;
    }
  });
}

interface ChannelHealthSectionProps {
  channels: ChannelCardData[] | undefined;
  isLoading: boolean;
  isUnavailable?: boolean;
}

export function ChannelHealthSection({
  channels,
  isLoading,
  isUnavailable = false,
}: ChannelHealthSectionProps) {
  const [channelSearch, setChannelSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState<ChannelHealth | "all">("all");
  const [channelSort, setChannelSort] = useState<ChannelSort>("activity");
  const [showAllChannels, setShowAllChannels] = useState(false);

  const filteredChannels = useMemo(() => {
    if (!channels) return [];
    let result = channels;
    if (channelSearch.trim()) {
      const query = channelSearch.toLowerCase().trim();
      result = result.filter((ch) => ch.name.toLowerCase().includes(query));
    }
    if (healthFilter !== "all") {
      result = result.filter((ch) => ch.health === healthFilter);
    }
    return sortChannels(result, channelSort);
  }, [channels, channelSearch, healthFilter, channelSort]);

  const displayedChannels = showAllChannels ? filteredChannels : filteredChannels.slice(0, 10);
  const hasMoreChannels = filteredChannels.length > 10 && !showAllChannels;

  return (
    <section>
      {/* Header row */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-sans text-base font-semibold text-text-primary">
              Channel Health
            </h2>
            <p className="font-body text-xs text-text-tertiary mt-0.5">
              Monitor the health status of your connected Slack channels
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-3.5 w-20" />
          ) : (
            <span className="font-mono text-xs text-text-tertiary">
              {isUnavailable
                ? "Data unavailable"
                : `${filteredChannels.length} of ${channels?.length ?? 0} channel${channels?.length === 1 ? "" : "s"}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SyncChannelsButton variant="full" />
          <Select
            value={channelSort}
            onChange={(v: string) => setChannelSort(v as ChannelSort)}
            options={CHANNEL_SORTS}
            label="Sort channels"
          />
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchInput
          value={channelSearch}
          onChange={setChannelSearch}
          placeholder="Search channels..."
        />
        {HEALTH_FILTERS.map((item) => (
          <FilterPill
            key={item.value}
            label={item.label}
            active={healthFilter === item.value}
            onClick={() => setHealthFilter(item.value)}
          />
        ))}
      </div>

      <ChannelGrid
        channels={displayedChannels}
        isLoading={isLoading}
        isUnavailable={isUnavailable}
      />

      {hasMoreChannels && (
        <button
          type="button"
          onClick={() => setShowAllChannels(true)}
          className="mt-2 w-full rounded-lg border border-border-subtle bg-bg-secondary/30 py-2 font-mono text-badge text-text-tertiary transition-colors hover:bg-bg-secondary/50 hover:text-text-secondary"
        >
          Show all {filteredChannels.length} channels
        </button>
      )}
    </section>
  );
}
