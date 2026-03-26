"use client";

import Link from "next/link";
import { IconExternalLink, IconVideo } from "@tabler/icons-react";
import { Panel, EmptyState } from "@/components/primitives";
import { Skeleton } from "@/components/ui";
import { useMeetings, useFathomConnection } from "@/lib/hooks";

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

interface ChannelMeetingsSectionProps {
  channelId: string;
}

export function ChannelMeetingsSection({ channelId }: ChannelMeetingsSectionProps) {
  const { data: connectionData } = useFathomConnection();
  const isConnected = connectionData?.connected ?? false;

  const { data, isLoading } = useMeetings({
    channelId,
  });

  // Don't render if Fathom is not connected
  if (!isConnected && !isLoading) return null;

  const meetings = data?.meetings ?? [];
  const total = data?.total ?? 0;

  if (isLoading) {
    return (
      <Panel title="Recent Meetings">
        <div className="space-y-element">
          <Skeleton className="h-12 w-full rounded-radius-md" />
          <Skeleton className="h-12 w-full rounded-radius-md" />
          <Skeleton className="h-12 w-3/4 rounded-radius-md" />
        </div>
      </Panel>
    );
  }

  if (meetings.length === 0) {
    return (
      <Panel title="Recent Meetings" count={0}>
        <EmptyState
          icon={<IconVideo size={18} />}
          title="No meetings linked"
          description="Fathom meetings routed to this channel will appear here."
        />
      </Panel>
    );
  }

  return (
    <Panel title="Recent Meetings" count={total}>
      <div className="divide-y divide-border-subtle">
        {meetings.slice(0, 5).map((meeting) => (
          <div key={meeting.id} className="flex items-center justify-between gap-group py-2.5">
            <div className="min-w-0 flex-1">
              <p className="font-body text-body-sm font-medium text-text-primary truncate">
                {meeting.title || "Untitled meeting"}
              </p>
              <p className="font-mono text-badge text-text-tertiary">
                {formatDate(meeting.started_at)}
                {meeting.participants_json.length > 0 && (
                  <span className="ml-element">
                    {meeting.participants_json.length} participant{meeting.participants_json.length !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-element flex-shrink-0">
              {/* Processing status badge */}
              {meeting.extraction_status === "completed" ? (
                <span
                  className="rounded-radius-full px-1.5 py-0.5 font-mono text-[9px]"
                  style={{
                    color: "var(--theme-status-success)",
                    backgroundColor: "color-mix(in srgb, var(--theme-status-success) 10%, transparent)",
                  }}
                >
                  extracted
                </span>
              ) : meeting.extraction_status === "pending" ? (
                <span className="rounded-radius-full border border-border-subtle px-1.5 py-0.5 font-mono text-[9px] text-text-tertiary">
                  processing
                </span>
              ) : null}

              {/* Fathom link */}
              {meeting.share_url && (
                <a
                  href={meeting.share_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-text-tertiary hover:text-accent transition-colors"
                  aria-label="Open in Fathom"
                >
                  <IconExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {total > 5 && (
        <div className="mt-group pt-group border-t border-border-subtle">
          <Link
            href={`/dashboard/commitments?channel=${channelId}`}
            className="font-mono text-badge text-accent hover:text-accent-hover transition-colors duration-fast"
          >
            View all {total} meetings &rarr;
          </Link>
        </div>
      )}
    </Panel>
  );
}
