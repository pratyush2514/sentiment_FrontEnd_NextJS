"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconVideo, IconExternalLink, IconAlertTriangle, IconCheck, IconLoader2, IconRefresh } from "@tabler/icons-react";
import { useSWRConfig } from "swr";
import { PageHeader, FilterPill, EmptyState, Button } from "@/components/primitives";
import { Skeleton } from "@/components/ui";
import { startFathomHistoricalSync, useMeetings, useFathomConnection, useChannels } from "@/lib/hooks";
import { toDisplayErrorMessage } from "@/lib/errors";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MeetingsPage() {
  const [filter, setFilter] = useState<"all" | "linked" | "unlinked">("all");
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { mutate } = useSWRConfig();
  const { data: connectionData } = useFathomConnection();
  const isConnected = connectionData?.connected ?? false;
  const historicalSync = connectionData?.historicalSync ?? null;
  const isHistoricalSyncActive =
    historicalSync?.status === "queued" || historicalSync?.status === "running";

  const { data, isLoading } = useMeetings({
    swr: {
      refreshInterval: isHistoricalSyncActive ? 5_000 : 60_000,
      revalidateOnFocus: false,
      refreshWhenHidden: false,
      keepPreviousData: true,
      dedupingInterval: isHistoricalSyncActive ? 2_000 : 5_000,
    },
  });
  const { data: channels } = useChannels();

  const meetings = data?.meetings ?? [];
  const total = data?.total ?? 0;

  const filtered =
    filter === "linked"
      ? meetings.filter((m) => m.channel_id)
      : filter === "unlinked"
        ? meetings.filter((m) => !m.channel_id)
        : meetings;

  const unlinkedCount = meetings.filter((m) => !m.channel_id).length;

  function channelName(channelId: string | null): string | null {
    if (!channelId) return null;
    return channels?.find((c) => c.id === channelId)?.name ?? null;
  }

  useEffect(() => {
    if (!isHistoricalSyncActive) {
      return;
    }

    const interval = window.setInterval(() => {
      void mutate("/api/fathom/connection");
      void mutate(
        (key: unknown) => typeof key === "string" && key.startsWith("/api/meetings"),
      );
    }, 5_000);

    return () => window.clearInterval(interval);
  }, [isHistoricalSyncActive, mutate]);

  async function handleSync() {
    setSyncError(null);
    setSyncing(true);
    try {
      const result = await startFathomHistoricalSync();
      await mutate(
        "/api/fathom/connection",
        (current: unknown) =>
          current && typeof current === "object"
            ? {
                ...(current as Record<string, unknown>),
                connected: result.connected,
                historicalSync: result.historicalSync ?? null,
              }
            : current,
        {
          populateCache: true,
          revalidate: false,
        },
      );
      void mutate("/api/fathom/connection");
      await mutate(
        (key: unknown) => typeof key === "string" && key.startsWith("/api/meetings"),
      );
    } catch (err) {
      setSyncError(
        toDisplayErrorMessage(
          err,
          "Couldn’t start the historical import. Please try again.",
        ),
      );
    } finally {
      setSyncing(false);
    }
  }

  function renderHistoricalSyncBanner() {
    if (!isConnected || !historicalSync) {
      return null;
    }

    const title =
      historicalSync.status === "completed"
        ? "Historical Fathom import complete"
        : historicalSync.status === "failed"
          ? "Historical Fathom import needs attention"
          : historicalSync.status === "queued" || historicalSync.status === "running"
            ? "Historical Fathom import in progress"
            : "Import recent Fathom history";

    const message =
      historicalSync.status === "completed"
        ? historicalSync.discoveredCount === 0
          ? `No meetings were found in the last ${historicalSync.windowDays} days.`
          : historicalSync.importedCount === 0
            ? `Checked ${historicalSync.discoveredCount} meeting${historicalSync.discoveredCount === 1 ? "" : "s"} from the last ${historicalSync.windowDays} days. Everything was already imported.`
            : `Imported ${historicalSync.importedCount} missing meeting${historicalSync.importedCount === 1 ? "" : "s"} from ${historicalSync.discoveredCount} meeting${historicalSync.discoveredCount === 1 ? "" : "s"} found in the last ${historicalSync.windowDays} days.`
        : historicalSync.status === "failed"
          ? historicalSync.lastError || "The last historical import could not be completed."
          : historicalSync.status === "queued"
            ? `Queued a historical import for the last ${historicalSync.windowDays} days of Fathom meetings.`
            : historicalSync.status === "running"
              ? `Importing missing Fathom meetings from the last ${historicalSync.windowDays} days.`
              : `Pull the last ${historicalSync.windowDays} days of recorded Fathom meetings so this page and channel summaries are populated immediately.`;

    const secondaryMeta =
      historicalSync.status === "completed"
        ? historicalSync.completedAt
          ? `Completed ${formatDate(historicalSync.completedAt)}`
          : null
        : historicalSync.status === "running" || historicalSync.status === "queued"
          ? historicalSync.startedAt
            ? `Started ${formatDate(historicalSync.startedAt)}`
            : "Refreshes automatically while syncing"
          : null;

    return (
      <div
        className={`rounded-2xl border px-4 py-3 ${
          historicalSync.status === "failed"
            ? "border-error/25 bg-error/8"
            : historicalSync.status === "completed"
              ? "border-positive/25 bg-positive/8"
              : "border-border-subtle bg-bg-secondary/55"
        }`}
      >
        <div className="flex items-start justify-between gap-group">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {historicalSync.status === "completed" ? (
                <IconCheck size={14} className="text-positive" />
              ) : historicalSync.status === "queued" || historicalSync.status === "running" || syncing ? (
                <IconLoader2 size={14} className="animate-spin text-accent" />
              ) : historicalSync.status === "failed" ? (
                <IconAlertTriangle size={14} className="text-error" />
              ) : (
                <IconRefresh size={14} className="text-accent" />
              )}
              <p className="font-mono text-body-sm text-text-primary">{title}</p>
            </div>
            <p className="font-body text-sm leading-relaxed text-text-secondary">{message}</p>
            {secondaryMeta && (
              <p className="font-mono text-badge text-text-tertiary">{secondaryMeta}</p>
            )}
            {syncError && (
              <p className="font-mono text-badge text-error">{syncError}</p>
            )}
          </div>
          <Button
            variant={historicalSync.status === "failed" ? "warning" : "secondary"}
            size="sm"
            icon={isHistoricalSyncActive || syncing ? <IconLoader2 size={12} className="animate-spin" /> : <IconRefresh size={12} />}
            loading={syncing}
            disabled={isHistoricalSyncActive}
            onClick={handleSync}
          >
            {historicalSync.status === "idle" ? "Import last 14 days" : "Re-sync last 14 days"}
          </Button>
        </div>
      </div>
    );
  }

  if (!isConnected && !isLoading) {
    return (
      <div className="space-y-section">
        <PageHeader title="Meetings" description="All recorded meetings from Fathom" />
        <EmptyState
          icon={<IconVideo size={20} />}
          title="Connect Fathom"
          description="Link your Fathom account to see meetings here."
          action={
            <Link
              href="/dashboard/settings#fathom"
              className="font-mono text-badge text-accent hover:text-accent-hover transition-colors"
            >
              Go to Settings &rarr;
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-section">
      <PageHeader
        title="Meetings"
        description={`${total} recorded meeting${total !== 1 ? "s" : ""} from Fathom`}
      />

      {renderHistoricalSyncBanner()}

      {/* Filters */}
      <div className="flex items-center gap-1">
        <FilterPill label="All" active={filter === "all"} onClick={() => setFilter("all")} />
        <FilterPill label="Linked" active={filter === "linked"} onClick={() => setFilter("linked")} />
        <FilterPill
          label={`Unlinked${unlinkedCount > 0 ? ` (${unlinkedCount})` : ""}`}
          active={filter === "unlinked"}
          onClick={() => setFilter("unlinked")}
        />
      </div>

      {isLoading ? (
        <div className="space-y-element">
          <Skeleton className="h-16 w-full rounded-radius-md" />
          <Skeleton className="h-16 w-full rounded-radius-md" />
          <Skeleton className="h-16 w-3/4 rounded-radius-md" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<IconVideo size={20} />}
          title={filter === "unlinked" ? "No unlinked meetings" : "No meetings yet"}
          description={
            filter === "unlinked"
              ? "All meetings are linked to channels."
              : "Meetings will appear here after Fathom records them."
          }
        />
      ) : (
        <div className="divide-y divide-border-subtle rounded-radius-md border border-border-subtle overflow-hidden">
          {filtered.map((meeting) => {
            const chName = channelName(meeting.channel_id);
            const fathomUrl = meeting.share_url;
            const durationMin = meeting.duration_seconds
              ? Math.round(meeting.duration_seconds / 60)
              : null;

            return (
              <Link
                key={meeting.id}
                href={`/dashboard/meetings/${meeting.id}`}
                className="flex items-center justify-between gap-group px-4 py-3 hover:bg-bg-tertiary/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-body text-body-sm font-medium text-text-primary truncate">
                    {meeting.title || "Untitled meeting"}
                  </p>
                  <div className="flex items-center gap-element font-mono text-badge text-text-tertiary mt-0.5">
                    <span>{formatDate(meeting.started_at)}</span>
                    {durationMin && <span>{durationMin} min</span>}
                    <span>
                      {meeting.participants_json.length} participant
                      {meeting.participants_json.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-element flex-shrink-0">
                  <span className="rounded-radius-full border border-border-subtle px-2 py-0.5 font-mono text-[9px] text-text-secondary">
                    {meeting.source === "shared_link" ? "Shared link" : "Fathom"}
                  </span>

                  {/* Channel badge or unlinked warning */}
                  {chName ? (
                    <span className="rounded-radius-full border border-border-subtle px-2 py-0.5 font-mono text-[9px] text-text-secondary">
                      #{chName}
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1 rounded-radius-full px-2 py-0.5 font-mono text-[9px]"
                      style={{
                        color: "var(--theme-status-warning)",
                        backgroundColor: "color-mix(in srgb, var(--theme-status-warning) 10%, transparent)",
                      }}
                    >
                      <IconAlertTriangle size={9} />
                      unlinked
                    </span>
                  )}

                  {/* Extraction status */}
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
                  ) : meeting.extraction_status !== "not_run" ? (
                    <span className="rounded-radius-full border border-border-subtle px-1.5 py-0.5 font-mono text-[9px] text-text-tertiary">
                      {meeting.extraction_status}
                    </span>
                  ) : null}

                  {/* Fathom link */}
                  {fathomUrl && (
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(fathomUrl, "_blank");
                      }}
                      className="p-1 text-text-tertiary hover:text-accent transition-colors cursor-pointer"
                    >
                      <IconExternalLink size={13} />
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
