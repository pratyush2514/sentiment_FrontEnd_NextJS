"use client";

import { useMemo, useState } from "react";
import { IconFilter, IconInbox } from "@tabler/icons-react";
import { useInbox, useSession } from "@/lib/hooks";
import { FilterPill, FilterBar, Select } from "@/components/primitives";
import {
  toDashboardQueryConfig,
  useFollowUpActions,
  useRealtimeRefreshPolicy,
} from "@/features/dashboard";
import { AttentionCard } from "./AttentionCard";
import { Skeleton } from "@/components/ui";
import type {
  AttentionGroup,
  AttentionItem,
  AttentionSeverity,
  ChannelCardData,
} from "@/lib/types";

const GROUP_ORDER: { key: AttentionGroup; label: string; description: string }[] = [
  { key: "needs_reply", label: "Needs reply", description: "Fresh asks that still need a first substantive response." },
  { key: "acknowledged", label: "Acknowledged", description: "Someone engaged, but the work is not complete yet." },
  { key: "escalated", label: "Escalated", description: "Primary coverage missed the reply window and senior attention is now needed." },
  { key: "sentiment_risk", label: "Sentiment risk", description: "Conversation tone or escalation risk needs human review." },
  { key: "resolved_recently", label: "Resolved recently", description: "Recently closed loops for accountability context." },
];

const SEVERITY_FILTERS: { label: string; value: AttentionSeverity | "all" }[] = [
  { label: "All", value: "all" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

interface ActionInboxSectionProps {
  channels: ChannelCardData[] | undefined;
}

export function ActionInboxSection({ channels }: ActionInboxSectionProps) {
  const { data: session } = useSession();
  const [groupFilter, setGroupFilter] = useState<AttentionGroup | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<AttentionSeverity | "all">("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [mineOnly, setMineOnly] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const refreshPolicy = useRealtimeRefreshPolicy("inbox");
  const queryConfig = toDashboardQueryConfig(refreshPolicy);
  const followUpActions = useFollowUpActions();

  const { data: inbox, isLoading: inboxLoading, error: inboxError } = useInbox({
    limit: 120,
    group: groupFilter,
    severity: severityFilter,
    channelId: channelFilter === "all" ? null : channelFilter,
    assigneeUserId: mineOnly ? session?.userId ?? null : null,
    swr: queryConfig,
  });

  const groupedItems = useMemo(() => {
    const itemsByGroup = new Map<AttentionGroup, AttentionItem[]>();
    for (const item of inbox ?? []) {
      const current = itemsByGroup.get(item.group) ?? [];
      current.push(item);
      itemsByGroup.set(item.group, current);
    }
    return GROUP_ORDER.map((section) => ({
      ...section,
      items: itemsByGroup.get(section.key) ?? [],
    })).filter((section) => {
      if (groupFilter !== "all") return section.key === groupFilter;
      return section.items.length > 0;
    });
  }, [groupFilter, inbox]);

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
      // Errors are surfaced through the shared follow-up hook state.
    }
  }

  const channelOptions = [
    { label: "All channels", value: "all" },
    ...(channels ?? []).map((ch) => ({
      label: `${ch.conversationType === "private_channel" ? "🔒 " : "# "}${ch.name}`,
      value: ch.id,
    })),
  ];

  return (
    <section className="space-y-4 pt-1">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
            <IconInbox size={14} className="text-accent" />
          </div>
          <div>
            <h2 className="font-sans text-sm font-semibold tracking-tight text-text-primary">Action Inbox</h2>
            <p className="font-body text-caption text-text-tertiary">Follow-up queue</p>
          </div>
        </div>
        {!inboxLoading && inbox && inbox.length > 0 && (
          <span className="font-mono text-badge text-text-tertiary">
            {inbox.length} item{inbox.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* Filter bar */}
      <FilterBar label="Filters" icon={<IconFilter size={10} />}>
        {GROUP_ORDER.map((section) => (
          <FilterPill
            key={section.key}
            label={section.label}
            active={groupFilter === section.key}
            onClick={() => setGroupFilter((c) => (c === section.key ? "all" : section.key))}
          />
        ))}
        <span className="mx-1 h-4 w-px bg-border-subtle" />
        {SEVERITY_FILTERS.map((item) => (
          <FilterPill
            key={item.value}
            label={item.label}
            active={severityFilter === item.value}
            onClick={() => setSeverityFilter(item.value)}
          />
        ))}
        <span className="mx-1 h-4 w-px bg-border-subtle" />
        <Select
          value={channelFilter}
          onChange={setChannelFilter}
          options={channelOptions}
          label="Filter by channel"
        />
        <FilterPill
          label="My queue"
          active={mineOnly}
          onClick={() => setMineOnly((c) => !c)}
        />
      </FilterBar>
      {followUpActions.error ? (
        <p className="font-body text-body-sm text-anger">
          {followUpActions.error}
        </p>
      ) : null}

      {/* Grouped inbox items */}
      {inboxLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : inboxError ? (
        <div className="rounded-xl border border-warning/25 bg-warning/8 px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 border border-warning/25">
            <IconInbox size={18} className="text-warning" />
          </div>
          <h3 className="font-sans text-sm font-semibold text-text-primary">Inbox data unavailable</h3>
          <p className="mt-1 font-body text-xs text-text-tertiary">
            PulseBoard could not verify the current follow-up queue. Refresh once the backend is responding again.
          </p>
        </div>
      ) : groupedItems.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-bg-secondary/30 px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary border border-border-subtle">
            <IconInbox size={18} className="text-text-tertiary" />
          </div>
          <h3 className="font-sans text-sm font-semibold text-text-primary">Inbox is quiet</h3>
          <p className="mt-1 font-body text-xs text-text-tertiary">
            No active follow-ups or risk items match the current filters.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedItems.map((section) => (
            <section key={section.key} className="space-y-2.5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="font-sans text-sm font-semibold text-text-primary">{section.label}</h3>
                  <p className="mt-0.5 font-body text-caption text-text-secondary">{section.description}</p>
                </div>
                <span className="font-mono text-badge uppercase tracking-wider text-text-tertiary shrink-0">
                  {section.items.length} item{section.items.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="space-y-2.5">
                {section.items.map((item) => (
                  <AttentionCard
                    key={item.id}
                    item={item}
                    isOpen={openItemId === item.id}
                    isMutating={followUpActions.mutatingItemId === item.id}
                    onToggleContext={(id) => setOpenItemId((c) => (c === id ? null : id))}
                    onFollowUpAction={handleFollowUpAction}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
