import Link from "next/link";
import {
  IconArrowUpRight,
  IconArrowRight,
  IconArrowDownRight,
  IconFlame,
  IconMessageCircle2,
} from "@tabler/icons-react";
import { HighlightedText } from "@/components/ui";
import { relativeTime } from "@/lib/utils/formatters";
import type {
  ActiveThread,
  ProductWindowScope,
  SentimentTrajectory,
  ThreadInsight,
} from "@/lib/types";

interface ActiveThreadsProps {
  channelId: string;
  threads: ActiveThread[];
  userMap?: Map<string, string>;
  isRiskOnlyChannel?: boolean;
  title?: string;
  countLabel?: string;
  emptyStateMessage?: string;
  scope?: ProductWindowScope | null;
}

const TRAJECTORY_CONFIG: Record<
  SentimentTrajectory,
  { icon: typeof IconArrowUpRight; color: string; label: string }
> = {
  improving: { icon: IconArrowUpRight, color: "var(--theme-status-success)", label: "Improving" },
  stable: { icon: IconArrowRight, color: "var(--theme-status-neutral)", label: "Stable" },
  deteriorating: {
    icon: IconArrowDownRight,
    color: "var(--theme-status-error)",
    label: "Declining",
  },
};

const THREAD_INSIGHT_ICONS: Record<ThreadInsight["type"], typeof IconFlame | typeof IconMessageCircle2> = {
  concern: IconFlame,
  tension: IconArrowDownRight,
  trend: IconArrowUpRight,
  actor: IconMessageCircle2,
  neutral: IconMessageCircle2,
  crucial: IconFlame,
};

export function ActiveThreads({
  channelId,
  threads,
  userMap,
  isRiskOnlyChannel = false,
  title = "Surfaced Threads",
  countLabel = "surfaced",
  emptyStateMessage,
  scope = "active",
}: ActiveThreadsProps) {
  const resolvedEmptyStateMessage = emptyStateMessage ??
    (isRiskOnlyChannel
      ? "Risk-only monitoring is active for this channel. Threads will appear here only when PulseBoard detects a blocker, escalation, or other manager-relevant risk."
      : "No threads are surfaced right now. PulseBoard will show unresolved, risky, or meaningfully changing threads here when they need attention.");

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary/60 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-sans text-sm font-semibold text-text-primary">
          {title}
        </h3>
        <span className="font-mono text-xs text-text-tertiary">
          {threads.length} {countLabel}
        </span>
      </div>
      {threads.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-subtle bg-bg-primary/20 px-4 py-5">
          <p className="font-body text-sm leading-relaxed text-text-secondary">
            {resolvedEmptyStateMessage}
          </p>
        </div>
      ) : (
        <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
          {threads.map((t) => {
            const traj = t.sentimentTrajectory
              ? TRAJECTORY_CONFIG[t.sentimentTrajectory]
              : null;
            const TrajIcon = traj?.icon;

            return (
              <Link
                key={t.threadTs}
                href={`/dashboard/channels/${channelId}/threads/${t.threadTs}${scope !== "active" ? `?scope=${scope}` : ""}`}
                className="block rounded-lg border border-border-subtle/50 bg-bg-primary/30 p-3 transition-all hover:border-border-hover hover:bg-bg-tertiary/30 hover:shadow-sm"
              >
                <HighlightedText
                  text={t.summary}
                  className="mb-2 block font-body text-sm leading-relaxed text-text-secondary line-clamp-2"
                  userMap={userMap}
                />
                {t.crucialMessageSummary ? (
                  <div className="mb-2 rounded-md border border-anger/20 bg-anger/6 px-2 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <IconFlame size={10} className="text-anger" />
                      <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-anger">
                        Crucial message
                      </span>
                    </div>
                    <HighlightedText
                      text={t.crucialMessageSummary}
                      className="mt-1 block font-body text-[11px] leading-relaxed text-text-secondary line-clamp-2"
                      userMap={userMap}
                    />
                  </div>
                ) : null}
                {t.insights && t.insights.length > 0 ? (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {t.insights.slice(0, 3).map((insight, index) => {
                      const Icon = THREAD_INSIGHT_ICONS[insight.type];
                      return (
                        <span
                          key={`${t.threadTs}-${index}`}
                          className="inline-flex items-center gap-1 rounded-full bg-bg-primary/65 px-2 py-1 font-mono text-[10px] text-text-tertiary"
                        >
                          <Icon size={10} className={insight.type === "crucial" ? "text-anger" : undefined} />
                          {insight.label}
                        </span>
                      );
                    })}
                  </div>
                ) : null}
                <div className="flex items-center gap-2.5">
                  {traj && TrajIcon ? (
                    <span className="flex items-center gap-1 font-mono text-xs" style={{ color: traj.color }}>
                      <TrajIcon size={12} />
                      {traj.label}
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-text-tertiary">
                      Tracking
                    </span>
                  )}
                  <span className="font-mono text-xs text-text-tertiary">
                    {t.messageCount} msgs
                  </span>
                  <span className="font-mono text-xs text-text-tertiary">
                    {relativeTime(t.lastActivityAt)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
