"use client";

import Link from "next/link";
import { IconChecklist, IconSettings } from "@tabler/icons-react";
import { Panel, EmptyState, Button } from "@/components/primitives";
import { Skeleton } from "@/components/ui";
import { useMeetingObligations, useFathomConnection } from "@/lib/hooks";
import { MeetingObligationRow } from "./MeetingObligationRow";

export function MeetingCommitmentsCard() {
  const { data: connectionData } = useFathomConnection();
  const isConnected = connectionData?.connected ?? false;

  const { data, isLoading } = useMeetingObligations({
    status: "open",
  });

  const obligations = data?.obligations ?? [];
  const total = data?.total ?? 0;
  const overdueCount = obligations.filter(
    (o) => o.due_date && new Date(o.due_date) < new Date(),
  ).length;

  // Don't show the card at all if Fathom isn't connected
  if (!isConnected && !isLoading) return null;

  if (isLoading) {
    return (
      <Panel title="Meeting Commitments">
        <div className="space-y-element">
          <Skeleton className="h-8 w-full rounded-radius-md" />
          <Skeleton className="h-8 w-full rounded-radius-md" />
          <Skeleton className="h-8 w-3/4 rounded-radius-md" />
        </div>
      </Panel>
    );
  }

  if (obligations.length === 0 && isConnected) {
    return (
      <Panel title="Meeting Commitments" count={0}>
        <EmptyState
          icon={<IconChecklist size={20} />}
          title="No open commitments"
          description="Action items and commitments from Fathom meetings will appear here."
        />
      </Panel>
    );
  }

  if (!isConnected) {
    return (
      <Panel title="Meeting Commitments">
        <EmptyState
          icon={<IconChecklist size={20} />}
          title="Connect Fathom"
          description="Link your Fathom account to track meeting commitments and post digests to Slack."
          action={
            <Link href="/dashboard/settings#fathom">
              <Button variant="secondary" size="sm" icon={<IconSettings size={14} />}>
                Go to Settings
              </Button>
            </Link>
          }
        />
      </Panel>
    );
  }

  return (
    <Panel
      title="Meeting Commitments"
      count={total}
      action={
        overdueCount > 0 ? (
          <span
            className="inline-flex items-center gap-1 rounded-radius-full px-2 py-0.5 font-mono text-[10px] font-medium"
            style={{
              color: "var(--theme-status-error)",
              backgroundColor: "color-mix(in srgb, var(--theme-status-error) 10%, transparent)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-radius-full animate-[pulse-dot_2s_infinite]" style={{ backgroundColor: "var(--theme-status-error)" }} />
            {overdueCount} overdue
          </span>
        ) : null
      }
    >
      <div className="divide-y divide-border-subtle">
        {obligations.slice(0, 5).map((ob) => (
          <MeetingObligationRow key={ob.id} obligation={ob} compact />
        ))}
      </div>

      {total > 5 && (
        <div className="mt-group pt-group border-t border-border-subtle">
          <Link
            href="/dashboard/commitments"
            className="font-mono text-badge text-accent hover:text-accent-hover transition-colors duration-fast"
          >
            View all {total} commitments &rarr;
          </Link>
        </div>
      )}
    </Panel>
  );
}
