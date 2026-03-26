"use client";

import { useState } from "react";
import Link from "next/link";
import { IconChevronDown, IconChevronRight, IconChecklist, IconExternalLink } from "@tabler/icons-react";
import { EmptyState, FilterPill } from "@/components/primitives";
import { Skeleton } from "@/components/ui";
import { MeetingObligationRow } from "@/components/dashboard/meetings/MeetingObligationRow";
import type { MeetingObligation } from "@/lib/hooks";

const TYPE_FILTERS = [
  { label: "All", value: "" },
  { label: "Actions", value: "action_item" },
  { label: "Decisions", value: "decision" },
  { label: "Commitments", value: "commitment" },
  { label: "Risks", value: "risk" },
];

interface ObligationGroup {
  meetingId: string;
  obligations: MeetingObligation[];
}

function groupByMeeting(obligations: MeetingObligation[]): ObligationGroup[] {
  const map = new Map<string, ObligationGroup>();
  for (const ob of obligations) {
    const existing = map.get(ob.meeting_id);
    if (existing) {
      existing.obligations.push(ob);
    } else {
      map.set(ob.meeting_id, { meetingId: ob.meeting_id, obligations: [ob] });
    }
  }
  return [...map.values()];
}

function MeetingGroup({ group }: { group: ObligationGroup }) {
  const [open, setOpen] = useState(true);

  const overdueCount = group.obligations.filter(
    (o) => o.due_date && new Date(o.due_date) < new Date() && o.status !== "completed" && o.status !== "dismissed",
  ).length;

  const firstOb = group.obligations[0];
  const title = firstOb?.meeting_title || `Meeting · ${group.meetingId.slice(0, 8)}…`;
  const shareUrl = firstOb?.meeting_share_url;

  return (
    <div className="rounded-radius-md border border-border-subtle bg-bg-secondary/30 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-element px-4 py-3 hover:bg-bg-tertiary/30 transition-colors duration-fast text-left"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <IconChevronDown size={14} className="flex-shrink-0 text-text-tertiary" />
        ) : (
          <IconChevronRight size={14} className="flex-shrink-0 text-text-tertiary" />
        )}
        <Link
          href={`/dashboard/meetings/${group.meetingId}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 font-sans text-body-sm font-semibold text-text-primary truncate hover:text-accent transition-colors"
        >
          {title}
        </Link>
        {shareUrl && (
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 p-0.5 text-text-tertiary hover:text-accent transition-colors"
            aria-label="Open in Fathom"
          >
            <IconExternalLink size={12} />
          </a>
        )}
        <span className="font-mono text-badge text-text-tertiary">
          {group.obligations.length} item{group.obligations.length !== 1 ? "s" : ""}
        </span>
        {overdueCount > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded-radius-full px-1.5 py-0.5 font-mono text-[9px] font-medium"
            style={{
              color: "var(--theme-status-error)",
              backgroundColor: "color-mix(in srgb, var(--theme-status-error) 10%, transparent)",
            }}
          >
            {overdueCount} overdue
          </span>
        )}
      </button>

      {open && (
        <div className="border-t border-border-subtle divide-y divide-border-subtle px-4">
          {group.obligations.map((ob) => (
            <MeetingObligationRow key={ob.id} obligation={ob} />
          ))}
        </div>
      )}
    </div>
  );
}

export interface CommitmentsListProps {
  obligations: MeetingObligation[];
  total: number;
  isLoading: boolean;
}

export function CommitmentsList({ obligations, total, isLoading }: CommitmentsListProps) {
  const [typeFilter, setTypeFilter] = useState("");

  const filtered = typeFilter
    ? obligations.filter((o) => o.obligation_type === typeFilter)
    : obligations;

  const groups = groupByMeeting(filtered);

  if (isLoading) {
    return (
      <div className="space-y-group">
        <Skeleton className="h-10 w-full rounded-radius-md" />
        <Skeleton className="h-32 w-full rounded-radius-md" />
        <Skeleton className="h-24 w-full rounded-radius-md" />
        <Skeleton className="h-24 w-3/4 rounded-radius-md" />
      </div>
    );
  }

  if (obligations.length === 0) {
    return (
      <EmptyState
        icon={<IconChecklist size={20} />}
        title="No commitments found"
        description="Action items, decisions, and commitments from Fathom meetings will appear here once meetings are recorded."
        action={
          <Link
            href="/dashboard/settings#fathom"
            className="font-mono text-badge text-accent hover:text-accent-hover transition-colors"
          >
            Connect Fathom in Settings &rarr;
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-group">
      {/* Type filter bar */}
      <div className="flex items-center gap-1">
        {TYPE_FILTERS.map((f) => (
          <FilterPill
            key={f.value}
            label={f.label}
            active={typeFilter === f.value}
            onClick={() => setTypeFilter(f.value)}
          />
        ))}
        {total > obligations.length && (
          <span className="ml-auto font-mono text-badge text-text-tertiary">
            Showing {obligations.length} of {total}
          </span>
        )}
      </div>

      {/* Meeting-grouped list */}
      {groups.length === 0 ? (
        <p className="py-6 text-center font-mono text-badge text-text-tertiary">
          No {typeFilter.replace("_", " ")} items found.
        </p>
      ) : (
        <div className="space-y-element">
          {groups.map((group) => (
            <MeetingGroup key={group.meetingId} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
