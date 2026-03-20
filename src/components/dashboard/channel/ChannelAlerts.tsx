"use client";

import Link from "next/link";
import { IconAlertTriangle, IconInfoCircle, IconShieldCheck } from "@tabler/icons-react";
import { Skeleton, AlertBadge, HighlightedText } from "@/components/ui";
import { useAlerts, useRelativeTime } from "@/lib/hooks";
import { getAlertBadge } from "@/lib/utils/alertBadge";
import type { AttentionSummary, DashboardAlert, RelatedIncident } from "@/lib/types";

interface ChannelAlertsProps {
  channelId: string;
  attentionSummary?: AttentionSummary;
  relatedIncidents?: RelatedIncident[];
}

export function ChannelAlerts({ channelId, attentionSummary, relatedIncidents }: ChannelAlertsProps) {
  const { data: alerts, isLoading } = useAlerts({ limit: 20, channelId });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-5">
        <Skeleton className="mb-3 h-4 w-40" />
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const items = alerts ?? [];
  const summary = attentionSummary ?? {
    status: "clear" as const,
    title: "Nothing needs attention",
    message: "Nothing needs attention in this channel right now.",
    driverKeys: [],
  };
  const relatedIncident = relatedIncidents?.[0] ?? null;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconAlertTriangle size={14} className="text-text-tertiary" />
          <h2 className="font-sans text-sm font-semibold text-text-primary">
            Needs Attention
            {items.length > 0 && (
              <span className="ml-2 rounded-full bg-anger/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-anger">
                {items.length}
              </span>
            )}
          </h2>
        </div>
      </div>

      {items.length === 0 ? (
        summary.status !== "clear" ? (
          <div className="flex items-center gap-3 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3">
            <IconAlertTriangle size={16} className="text-warning shrink-0" />
            <p className="font-body text-xs text-text-secondary">
              {summary.message}
            </p>
          </div>
        ) : relatedIncident ? (
          <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-primary/40 px-4 py-3">
            <IconInfoCircle size={16} className="text-text-tertiary shrink-0" />
            <p className="font-body text-xs text-text-secondary">
              {relatedIncident.blocksLocalWork
                ? `A related incident from #${relatedIncident.sourceChannelName} was mentioned here and may affect work in this channel.`
                : `A related incident from #${relatedIncident.sourceChannelName} was mentioned in this channel.`}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-joy/20 bg-joy/5 px-4 py-3">
            <IconShieldCheck size={16} className="text-joy shrink-0" />
            <p className="font-body text-xs text-text-secondary">
              Nothing needs attention in this channel right now.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-2">
          {items.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertItem({ alert }: { alert: DashboardAlert }) {
  const liveTime = useRelativeTime(alert.createdAt);
  const badge = getAlertBadge(alert);
  const href = alert.contextHref ?? `/dashboard/channels/${alert.channelId}`;
  const threadInsights = alert.metadata?.threadInsights ?? [];
  const crucialMessage = alert.metadata?.crucialMessage;

  return (
    <Link
      href={href}
      className="block rounded-lg border border-border-subtle bg-bg-primary/50 p-3 transition-all duration-150 hover:border-border-hover hover:bg-bg-primary/80"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-medium text-text-primary">
          {alert.title}
        </span>
        <AlertBadge badge={badge} />
      </div>
      {alert.actorName && (
        <p className="mb-1 font-sans text-[11px] font-semibold text-text-primary">
          {alert.actorName}
        </p>
      )}
      <HighlightedText
        text={alert.message}
        className="font-body text-[11px] leading-relaxed text-text-secondary line-clamp-2"
      />
      {threadInsights.length > 0 || crucialMessage ? (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {crucialMessage ? (
            <span className="rounded-full bg-anger/10 px-1.5 py-0.5 font-mono text-[9px] text-anger">
              Crucial message
            </span>
          ) : null}
          {threadInsights.slice(0, 2).map((insight, index) => (
            <span
              key={`${alert.id}-${insight.label}-${index}`}
              className="rounded-full bg-bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-text-tertiary"
            >
              {insight.label}
            </span>
          ))}
        </div>
      ) : null}
      <p className="mt-1 font-mono text-[9px] text-text-tertiary">{liveTime}</p>
    </Link>
  );
}
