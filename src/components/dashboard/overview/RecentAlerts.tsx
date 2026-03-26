"use client";

import { useMemo } from "react";
import Link from "next/link";
import { IconFlame } from "@tabler/icons-react";
import { Skeleton, AlertBadge, HighlightedText, ChannelPrefix } from "@/components/ui";
import { relativeTime } from "@/lib/utils/formatters";
import { getAlertBadge } from "@/lib/utils/alertBadge";
import type { ConversationType, DashboardAlert } from "@/lib/types";

interface RecentAlertsProps {
  alerts: DashboardAlert[] | undefined;
  isLoading: boolean;
  isUnavailable?: boolean;
}

interface ChannelGroup {
  channelId: string;
  channelName: string;
  conversationType?: ConversationType;
  alerts: DashboardAlert[];
}

function groupByChannel(alerts: DashboardAlert[]): ChannelGroup[] {
  const map = new Map<string, ChannelGroup>();
  for (const alert of alerts) {
    const existing = map.get(alert.channelId);
    if (existing) {
      existing.alerts.push(alert);
    } else {
      map.set(alert.channelId, {
        channelId: alert.channelId,
        channelName: alert.channelName,
        conversationType: alert.conversationType,
        alerts: [alert],
      });
    }
  }
  return [...map.values()];
}

export function RecentAlerts({
  alerts,
  isLoading,
  isUnavailable = false,
}: RecentAlertsProps) {
  const grouped = useMemo(() => {
    if (!alerts || alerts.length === 0) return [];
    return groupByChannel(alerts.slice(0, 8));
  }, [alerts]);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-bg-secondary/50 border border-border-subtle p-5">
        <Skeleton className="mb-4 h-4 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-bg-secondary/50 border border-border-subtle p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-sans text-sm font-semibold text-text-primary">
          Flagged Messages
        </h3>
        {alerts && alerts.length > 0 && (
          <span className="rounded-full bg-anger/15 px-2.5 py-1 font-mono text-xs font-bold text-anger">
            {alerts.length}
          </span>
        )}
      </div>

      {isUnavailable ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="font-body text-xs text-text-tertiary text-center">
            Flagged-message data is temporarily unavailable.
            <br />
            <span className="opacity-60">The backend did not return a trustworthy alert view.</span>
          </p>
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="font-body text-xs text-text-tertiary text-center">
            No recent alerts.
            <br />
            <span className="opacity-60">Channels are healthy.</span>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.channelId}>
              <Link
                href={`/dashboard/channels/${group.channelId}`}
                className="mb-2 flex items-center gap-1.5 group"
              >
                <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-text-primary group-hover:text-accent transition-colors">
                  <ChannelPrefix type={group.conversationType} size={11} />{group.channelName}
                </span>
                <span className="font-mono text-[10px] text-text-tertiary">
                  ({group.alerts.length})
                </span>
              </Link>
              <div className="space-y-1.5">
                {group.alerts.map((alert) => {
                  const badge = getAlertBadge(alert);
                  const href = alert.contextHref ?? `/dashboard/channels/${alert.channelId}`;
                  const threadInsights = alert.metadata?.threadInsights ?? [];
                  const crucialMessage = alert.metadata?.crucialMessage;
                  return (
                    <Link
                      key={alert.id}
                      href={href}
                      className="block rounded-lg border border-border-subtle bg-bg-primary/50 px-3.5 py-3 transition-all duration-150 hover:border-border-hover hover:bg-bg-primary/80 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {alert.actorName && (
                            <p className="font-sans text-xs font-semibold text-text-primary truncate">
                              {alert.actorName}
                            </p>
                          )}
                          <HighlightedText
                            text={alert.message}
                            className="font-body text-xs leading-relaxed text-text-secondary line-clamp-2 mt-0.5"
                          />
                          {(threadInsights.length > 0 || crucialMessage) && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {crucialMessage ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-anger/10 px-2 py-0.5 font-mono text-[10px] text-anger">
                                  <IconFlame size={10} />
                                  Crucial
                                </span>
                              ) : null}
                              {threadInsights.slice(0, 2).map((insight, index) => (
                                <span
                                  key={`${alert.id}-${insight.label}-${index}`}
                                  className="rounded-full bg-bg-secondary px-2 py-0.5 font-mono text-[10px] text-text-tertiary"
                                >
                                  {insight.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <AlertBadge badge={badge} />
                      </div>
                      <p className="mt-1.5 font-mono text-[10px] text-text-tertiary">
                        {relativeTime(alert.createdAt)}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
