"use client";

import { useMemo, useState } from "react";
import { IconBell } from "@tabler/icons-react";
import { useChannels, useInbox } from "@/lib/hooks";
import { AttentionCard } from "@/components/dashboard/attention/AttentionCard";
import { Skeleton, ChannelPrefix } from "@/components/ui";
import {
  EmptyState,
  FilterBar,
  FilterPill,
  PageHeader,
  Select,
} from "@/components/primitives";
import {
  toDashboardQueryConfig,
  useFollowUpActions,
  useRealtimeRefreshPolicy,
} from "@/features/dashboard";
import type { AttentionItem, ConversationType } from "@/lib/types";

const FILTERS = [
  { key: "all", label: "Action Queue" },
  { key: "follow_up", label: "Needs reply" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "sentiment", label: "Sentiment risk" },
  { key: "history", label: "History" },
] as const;

type AlertFilter = (typeof FILTERS)[number]["key"];

export default function AlertsPage() {
  const refreshPolicy = useRealtimeRefreshPolicy("inbox");
  const queryConfig = toDashboardQueryConfig(refreshPolicy);
  const { data: channels } = useChannels(queryConfig);
  const { data: items, isLoading } = useInbox({
    limit: 120,
    includeHistory: true,
    swr: queryConfig,
  });
  const followUpActions = useFollowUpActions();
  const [filter, setFilter] = useState<AlertFilter>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return (items ?? []).filter((item) => {
      if (channelFilter !== "all" && item.channelId !== channelFilter) {
        return false;
      }

      switch (filter) {
        case "follow_up":
          return item.group === "needs_reply" || item.group === "escalated";
        case "acknowledged":
          return item.group === "acknowledged";
        case "sentiment":
          return item.group === "sentiment_risk";
        case "history":
          return item.group === "resolved_recently";
        default:
          return true;
      }
    });
  }, [channelFilter, filter, items]);

  const channelSections = useMemo(() => {
    const grouped = new Map<string, { channelId: string; channelName: string; conversationType: ConversationType; items: AttentionItem[] }>();
    for (const item of filteredItems) {
      const current = grouped.get(item.channelId);
      if (current) {
        current.items.push(item);
      } else {
        grouped.set(item.channelId, {
          channelId: item.channelId,
          channelName: item.channelName,
          conversationType: item.conversationType,
          items: [item],
        });
      }
    }

    return [...grouped.values()].sort((left, right) => {
      if (right.items.length !== left.items.length) {
        return right.items.length - left.items.length;
      }
      return left.channelName.localeCompare(right.channelName);
    });
  }, [filteredItems]);

  async function handleFollowUpAction(
    item: AttentionItem,
    action: "resolve" | "dismiss" | "snooze" | "acknowledge_waiting" | "reopen",
  ) {
    try {
      await followUpActions.executeFollowUpAction(item, action, {
        snoozeHours: action === "snooze" ? 24 : undefined,
      });
      setOpenItemId((current) => (current === item.id ? null : current));
    } catch {
      // Shared hook owns the error state.
    }
  }

  return (
    <div className="space-y-section">
      <PageHeader
        eyebrow="Operational queue"
        title="Follow-up alerts"
        description="Review reply work, acknowledgments, escalations, and sentiment risk in the channel context they belong to."
        action={
          <FilterBar label="Views" icon={<IconBell size={10} />}>
            {FILTERS.map((item) => (
              <FilterPill
                key={item.key}
                label={item.label}
                active={filter === item.key}
                onClick={() => setFilter(item.key)}
              />
            ))}
          </FilterBar>
        }
      />

      <div className="rounded-radius-lg border border-border-subtle bg-bg-secondary/45 p-panel">
        <FilterBar label="Channel scope">
          <Select
            value={channelFilter}
            onChange={setChannelFilter}
            options={[
              { label: "All channels", value: "all" },
              ...(channels ?? []).map((channel) => ({
                label: `${channel.conversationType === "private_channel" ? "Private " : "# "}${channel.name}`,
                value: channel.id,
              })),
            ]}
            label="Filter by channel"
            className="w-full lg:max-w-sm"
          />
        </FilterBar>
      </div>
      {followUpActions.error ? (
        <p className="font-body text-body-sm text-anger">
          {followUpActions.error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-card">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-44 rounded-radius-lg" />
          ))}
        </div>
      ) : channelSections.length === 0 ? (
        <EmptyState
          icon={<IconBell size={18} />}
          title="No alerts match the current view"
          description="Try another channel or alert type to inspect a different queue."
        />
      ) : (
        <div className="space-y-section">
          {channelSections.map((section) => (
            <section key={section.channelId} className="space-y-card">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-1 font-sans text-heading font-semibold text-text-primary">
                    <ChannelPrefix type={section.conversationType} size={14} />{section.channelName}
                  </h2>
                  <p className="mt-1 font-body text-body-sm text-text-secondary">
                    {section.items.length} work item{section.items.length === 1 ? "" : "s"} in this conversation.
                  </p>
                </div>
              </div>

              <div className="space-y-card">
                {section.items.map((item) => (
                  <AttentionCard
                    key={item.id}
                    item={item}
                    isOpen={openItemId === item.id}
                    isMutating={followUpActions.mutatingItemId === item.id}
                    onToggleContext={(id) => setOpenItemId((current) => (current === id ? null : id))}
                    onFollowUpAction={handleFollowUpAction}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
