"use client";

import { ThreadMessageCard } from "@/components/dashboard/thread/ThreadMessageCard";
import { Skeleton } from "@/components/ui";
import { useLiveMessages } from "@/lib/hooks";

interface RecentIncidentsProps {
  channelId: string;
  userMap?: Map<string, string>;
}

export function RecentIncidents({
  channelId,
  userMap,
}: RecentIncidentsProps) {
  const { data: messages, isLoading } = useLiveMessages(channelId, {
    limit: 24,
    group: "flat",
    enabled: true,
  });

  const incidents = (messages ?? [])
    .filter((message) =>
      message.triage?.signalType === "operational_incident",
    )
    .slice(0, 6);

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-sans text-sm font-semibold text-text-primary">
          Recent Incidents
          {incidents.length > 0 ? (
            <span className="ml-2 rounded-full bg-warning/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-warning">
              {incidents.length}
            </span>
          ) : null}
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : incidents.length === 0 ? (
        <p className="py-8 text-center font-mono text-xs text-text-tertiary">
          No recent operational incidents were detected in the current window.
        </p>
      ) : (
        <div className="space-y-3">
          {incidents.map((message) => (
            <ThreadMessageCard
              key={message.id}
              channelId={channelId}
              message={message}
              userMap={userMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
