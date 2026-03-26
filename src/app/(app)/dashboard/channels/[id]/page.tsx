"use client";

import { use } from "react";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";

import { ChannelAlerts } from "@/components/dashboard/channel/ChannelAlerts";
import { ActiveThreads } from "@/components/dashboard/channel/ActiveThreads";
import { ChannelHeader } from "@/components/dashboard/channel/ChannelHeader";
import { FlaggedMessages } from "@/components/dashboard/channel/FlaggedMessages";
import { KeyDecisions } from "@/components/dashboard/channel/KeyDecisions";
import { PeopleConversationPanel } from "@/components/dashboard/channel/PeopleConversationPanel";
import { RecentIncidents } from "@/components/dashboard/channel/RecentIncidents";
import { RunningSummary } from "@/components/dashboard/channel/RunningSummary";
import { SentimentTimeline } from "@/components/charts/SentimentTimeline";
import { ChannelMeetingsSection } from "@/components/dashboard/meetings/ChannelMeetingsSection";
import { Skeleton } from "@/components/ui";
import { useChannelDetailJobs, useChannelDetailModel } from "@/features/dashboard";
import type { ProductWindowScope } from "@/lib/types";

export default function ChannelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const openConversation = searchParams.get("conversation") === "1";
  const highlightedMessageTs = searchParams.get("messageTs");
  const scopeParam = searchParams.get("scope");
  const scope: ProductWindowScope =
    scopeParam === "archive" || scopeParam === "live" ? scopeParam : "active";
  const model = useChannelDetailModel(id, {
    openConversation,
    highlightedMessageTs,
    scope,
  });
  const jobs = useChannelDetailJobs({
    channelId: id,
    state: model.state,
    actionPlan: model.actionPlan,
  });

  const effectiveChannelStatus =
    jobs.queuedBackfillRetry && model.status === "failed"
      ? "pending"
      : model.status;
  const isChannelSettingUp =
    effectiveChannelStatus === "pending" ||
    effectiveChannelStatus === "initializing";
  const isChannelFailed = effectiveChannelStatus === "failed";
  const isChannelRemoved = effectiveChannelStatus === "removed";
  const isRiskOnlyChannel = model.state?.effectiveImportanceTier === "low_value";
  const shouldShowRecentThreadsFallback =
    model.activeThreads.length === 0 && model.recentThreads.length > 0;
  const shouldShowKeyDecisions = !isRiskOnlyChannel && (model.state?.keyDecisions.length ?? 0) > 0;
  const shouldShowTimeline =
    !isRiskOnlyChannel &&
    Boolean(
      model.state &&
        model.state.sentimentSnapshot.totalAnalyzed > 0 &&
        (model.state.signal !== "stable" || model.state.attentionSummary.status !== "clear"),
    );
  const shouldShowRecentIncidents =
    model.state?.effectiveChannelMode !== "collaboration" &&
    Boolean(
      model.state &&
        (
          model.state.messageDispositionCounts.heuristicIncidentSignals > 0 ||
          model.state.riskDrivers.some((driver) => driver.category === "operational")
        ),
    );
  const archiveHref = `/dashboard/channels/${id}?scope=archive`;
  const recentHref = `/dashboard/channels/${id}`;
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-secondary/50 px-3 py-2 font-sans text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/80 transition-all"
      >
        <IconArrowLeft size={14} />
        Back to overview
      </Link>

      {model.stateLoading && !model.state ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      ) : (
        <ChannelHeader
          name={model.channelName}
          status={effectiveChannelStatus}
          state={model.state}
          conversationType={model.conversationType}
        />
      )}

      {scope === "archive" ? (
        <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-secondary/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-text-secondary font-medium">
              Viewing older context
            </p>
            <p className="mt-1.5 font-body text-sm leading-relaxed text-text-tertiary">
              The summary and health state stay focused on the last 7 days. Threads and timeline below now include up to 30 days of archived Slack context.
            </p>
          </div>
          <Link
            href={recentHref}
            className="shrink-0 rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 font-sans text-xs text-text-secondary transition-all hover:text-text-primary hover:bg-bg-secondary/80 hover:shadow-sm"
          >
            Back to recent view
          </Link>
        </div>
      ) : (
        <div className="flex justify-end">
          <Link
            href={archiveHref}
            className="rounded-lg border border-border-subtle bg-bg-secondary/40 px-3 py-2 font-sans text-xs text-text-secondary transition-all hover:text-text-primary hover:bg-bg-secondary/80 hover:shadow-sm"
          >
            Show older context →
          </Link>
        </div>
      )}

      {(isChannelSettingUp || isChannelFailed || isChannelRemoved) && (
        <div
          className={[
            "rounded-2xl border px-5 py-4",
            isChannelFailed
              ? "border-anger/25 bg-anger/6"
              : isChannelRemoved
                ? "border-border-subtle bg-bg-secondary/50"
                : "border-accent/20 bg-accent/6",
          ].join(" ")}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-sans text-sm font-semibold text-text-primary">
                {isChannelRemoved
                  ? "Bot access was removed from this channel"
                  : isChannelFailed
                    ? "Channel import needs attention"
                    : jobs.queuedBackfillRetry
                      ? "Retry queued"
                      : effectiveChannelStatus === "initializing"
                        ? "Importing Slack history"
                        : "Preparing this channel"}
              </h2>
              <p className="mt-1 font-body text-sm leading-relaxed text-text-secondary">
                {isChannelRemoved
                  ? "PulseBoard is no longer a member of this Slack channel, so live activity and backfill will stop here until the bot is invited again."
                  : isChannelFailed
                    ? "The initial Slack backfill did not complete. New Slack messages can still show up in the live conversation panel below, but summaries and alerts may stay incomplete until the import is retried."
                    : jobs.queuedBackfillRetry
                      ? "A fresh backfill has been queued. Live Slack activity can still appear below while PulseBoard rebuilds the missing history."
                      : "PulseBoard is still importing this channel from Slack. New Slack messages can still appear in the live conversation panel while participants, summaries, and alerts catch up."}
              </p>
              {jobs.backfillError ? (
                <p className="mt-2 font-mono text-[11px] text-anger">
                  {jobs.backfillError}
                </p>
              ) : null}
            </div>
            {isChannelFailed ? (
              <button
                type="button"
                onClick={jobs.retryBackfill}
                disabled={jobs.isQueueingBackfill}
                className="shrink-0 rounded-lg border border-anger/25 bg-anger/8 px-3 py-2 font-mono text-[10px] text-anger transition-colors hover:bg-anger/12 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {jobs.isQueueingBackfill ? "Queueing retry..." : "Retry import"}
              </button>
            ) : null}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 lg:col-start-1">
        <RunningSummary
          state={model.state}
          isLoading={model.stateLoading}
          threadInsights={model.threadInsights}
        />
      </div>

        {model.state ? (
          <div className="space-y-4 lg:col-start-2 lg:row-start-1 lg:row-span-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
            <PeopleConversationPanel
              channelId={id}
              participants={model.state.participants}
              selectedParticipantId={model.selectedParticipantId}
              onSelectParticipant={model.setSelectedParticipantId}
              initialOpen={model.openConversation || effectiveChannelStatus !== "ready"}
              highlightedMessageTs={model.highlightedMessageTs}
            />
            <ActiveThreads
              channelId={id}
              threads={model.activeThreads}
              userMap={model.userMap}
              isRiskOnlyChannel={isRiskOnlyChannel}
              scope={scope}
            />
            {shouldShowRecentThreadsFallback ? (
              <ActiveThreads
                channelId={id}
                threads={model.recentThreads}
                userMap={model.userMap}
                title="Recent Threads"
                countLabel="recent"
                emptyStateMessage="No recent threads were found in the current window."
                scope={scope}
              />
            ) : null}
          </div>
        ) : model.stateLoading || model.threadsLoading ? (
          <div className="space-y-4 lg:col-start-2 lg:row-start-1 lg:row-span-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        ) : null}

        <div className="min-w-0 lg:col-start-1">
          <ChannelAlerts
            channelId={id}
            attentionSummary={model.state?.attentionSummary}
            relatedIncidents={model.state?.relatedIncidents}
          />
        </div>

        {shouldShowRecentIncidents ? (
          <div className="min-w-0 lg:col-start-1">
            <RecentIncidents channelId={id} userMap={model.userMap} />
          </div>
        ) : null}

        {shouldShowKeyDecisions ? (
          <div className="min-w-0 lg:col-start-1">
            <KeyDecisions
              channelId={id}
              decisions={model.state?.keyDecisions ?? []}
            />
          </div>
        ) : null}

        {shouldShowTimeline ? (
          <div className="min-w-0 lg:col-start-1">
            <SentimentTimeline
              data={model.timeline}
              isLoading={model.timelineLoading}
              healthCounts={model.state?.healthCounts}
            />
          </div>
        ) : null}

        {model.state ? (
          <div className="min-w-0 lg:col-start-1">
            <FlaggedMessages
              channelId={id}
              userMap={model.userMap}
              isRiskOnlyChannel={isRiskOnlyChannel}
              scope={scope}
            />
          </div>
        ) : null}

        <div className="min-w-0 lg:col-start-1">
          <ChannelMeetingsSection channelId={id} />
        </div>
      </div>
    </div>
  );
}
