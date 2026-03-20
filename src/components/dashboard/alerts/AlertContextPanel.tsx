"use client";

import Link from "next/link";
import useSWR from "swr";
import { IconArrowRight, IconClockHour4, IconFlame } from "@tabler/icons-react";
import { MessageRichText } from "@/components/dashboard/common/MessageRichText";
import { OpenInSlackButton } from "@/components/dashboard/common/OpenInSlackButton";
import { Skeleton } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { relativeTime } from "@/lib/utils/formatters";
import type { AlertContext } from "@/lib/types";

export interface AlertContextTarget {
  channelId: string;
  sourceMessageTs: string;
  threadTs?: string | null;
  contextHref?: string;
}

function triageChipLabel(
  triage?: AlertContext["messages"][number]["triage"] | null,
) {
  if (triage?.relatedIncident) {
    return "Related incident";
  }

  if (triage?.signalType === "operational_incident") {
    return "Incident";
  }

  if (triage?.signalType === "human_risk") {
    return "Risk";
  }

  switch (triage?.candidateKind) {
    case "thread_turning_point":
      return "Turning point";
    case "resolution_signal":
      return "Resolution";
    case "context_only":
      return "Context";
    case "message_candidate":
      return "Candidate";
    default:
      return null;
  }
}

function statusLabel(status: AlertContext["messages"][number]["analysisStatus"]) {
  switch (status) {
    case "completed":
      return "Analyzed";
    case "processing":
      return "Analyzing";
    case "failed":
      return "Failed";
    case "skipped":
      return "Skipped";
    default:
      return "Pending";
  }
}

export function AlertContextPanel({ alert }: { alert: AlertContextTarget }) {
  const params = new URLSearchParams({
    channelId: alert.channelId,
    sourceMessageTs: alert.sourceMessageTs,
  });
  if (alert.threadTs) {
    params.set("threadTs", alert.threadTs);
  }

  const { data, isLoading } = useSWR<AlertContext>(
    `/api/alerts/context?${params.toString()}`,
    apiFetch,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 15_000,
    },
  );

  if (isLoading) {
    return (
      <div className="mt-3 space-y-2 rounded-xl border border-border-subtle/70 bg-bg-tertiary/15 p-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="mt-3 rounded-xl border border-border-subtle/70 bg-bg-tertiary/15 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-sans text-sm font-semibold text-text-primary">
            Related conversation
          </h4>
          <p className="mt-1 font-body text-xs text-text-tertiary">
            {data.threadTs
              ? "The original request and related replies in this thread."
              : "The source message with nearby channel context."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OpenInSlackButton
            channelId={alert.channelId}
            messageTs={alert.sourceMessageTs}
            label="Open in Slack"
          />
          <Link
            href={alert.contextHref ?? data.contextHref}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] text-accent transition-colors hover:bg-accent/10 hover:text-accent-hover"
          >
            View in dashboard
            <IconArrowRight size={10} />
          </Link>
        </div>
      </div>

      {(data.threadInsights && data.threadInsights.length > 0) || data.crucialMessage ? (
        <div className="mb-3 space-y-2 rounded-lg border border-border-subtle/70 bg-bg-primary/45 p-3">
          {data.crucialMessage ? (
            <div className="rounded-md border border-anger/20 bg-anger/6 p-2.5">
              <div className="flex items-center gap-1.5">
                <IconFlame size={10} className="text-anger" />
                <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-anger">
                  Crucial message surfaced
                </span>
              </div>
              <p className="mt-1.5 font-body text-xs leading-relaxed text-text-secondary">
                {data.crucialMessage.summary ?? data.crucialMessage.reason ?? "A crucial message was highlighted in this conversation."}
              </p>
            </div>
          ) : null}
          {data.threadInsights && data.threadInsights.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {data.threadInsights.slice(0, 4).map((insight, index) => (
                <span
                  key={`${insight.label}-${index}`}
                  className="inline-flex items-center gap-1 rounded-full bg-bg-secondary px-2 py-1 font-mono text-[10px] text-text-tertiary"
                >
                  <IconFlame
                    size={9}
                    className={insight.type === "crucial" ? "text-anger" : "text-text-tertiary"}
                  />
                  {insight.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2.5">
        {data.messages.map((message) => (
          <div
            key={message.id}
            className={[
              "rounded-lg border p-3",
              message.isSource
                ? "border-accent/40 bg-accent/8"
                : "border-border-subtle/60 bg-bg-secondary/20",
              message.isCrucial ? "ring-1 ring-anger/15" : "",
            ].join(" ")}
          >
            <div className="mb-1.5 flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-text-primary">
                  {message.userName}
                </span>
                <span className="font-mono text-[10px] text-text-tertiary">
                  {relativeTime(message.createdAt)}
                </span>
                {message.analysisStatus ? (
                  <span className="rounded-full bg-bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-text-tertiary">
                    {statusLabel(message.analysisStatus)}
                  </span>
                ) : null}
                {message.escalationRisk && message.escalationRisk !== "low" ? (
                  <span className="rounded-full bg-anger/10 px-1.5 py-0.5 font-mono text-[9px] text-anger">
                    {message.escalationRisk}
                  </span>
                ) : null}
                {message.isSource ? (
                  <span className="rounded-full bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] text-accent">
                    Source
                  </span>
                ) : null}
                {message.isCrucial ? (
                  <span className="rounded-full bg-anger/10 px-1.5 py-0.5 font-mono text-[9px] text-anger">
                    Crucial
                  </span>
                ) : null}
                {triageChipLabel(message.triage) ? (
                  <span className="rounded-full bg-bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-text-tertiary">
                    {triageChipLabel(message.triage)}
                  </span>
                ) : null}
              </div>
              <OpenInSlackButton
                channelId={alert.channelId}
                messageTs={message.ts}
                label={message.isSource ? "Open source" : "Open"}
                className="border border-border-subtle/60"
              />
            </div>
            <MessageRichText
              text={message.text}
              className="font-body text-sm leading-relaxed text-text-secondary"
              files={message.files}
            />
            {message.threadTs && message.threadTs !== message.ts ? (
              <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-text-tertiary">
                <IconClockHour4 size={10} />
                Reply in thread
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
