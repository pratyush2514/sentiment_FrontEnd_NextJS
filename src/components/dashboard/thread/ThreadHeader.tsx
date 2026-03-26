import Link from "next/link";
import {
  IconArrowUpRight,
  IconArrowRight,
  IconArrowDownRight,
  IconFlame,
  IconMessageCircle2,
} from "@tabler/icons-react";
import type { SentimentTrajectory, ThreadInsight } from "@/lib/types";

interface ThreadHeaderProps {
  summary: string;
  trajectory: SentimentTrajectory | null;
  messageCount: number;
  threadInsights?: ThreadInsight[];
  crucialMessageTs?: string | null;
  crucialMessageSummary?: string | null;
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

export function ThreadHeader({
  summary,
  trajectory,
  messageCount,
  threadInsights = [],
  crucialMessageTs,
  crucialMessageSummary,
}: ThreadHeaderProps) {
  const traj = trajectory ? TRAJECTORY_CONFIG[trajectory] : null;
  const TrajIcon = traj?.icon;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-6">
      <p className="mb-4 font-body text-base leading-7 text-text-primary">
        {summary}
      </p>
      <div className="flex items-center gap-3">
        {traj && TrajIcon ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs font-medium"
            style={{
              color: traj.color,
              backgroundColor: `color-mix(in srgb, ${traj.color} 14%, transparent)`,
            }}
          >
            <TrajIcon size={12} />
            {traj.label}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-bg-tertiary px-2.5 py-1 font-mono text-xs font-medium text-text-tertiary">
            Tracking sentiment
          </span>
        )}
        <span className="font-mono text-xs text-text-tertiary">
          {messageCount} messages
        </span>
      </div>

      {threadInsights.length > 0 ? (
        <div className="mt-4 rounded-lg border border-border-subtle/70 bg-bg-primary/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-mono text-xs uppercase tracking-wider text-text-primary font-semibold">
              Thread Insights
            </p>
            <span className="font-mono text-xs text-text-tertiary">
              {threadInsights.length} surfaced
            </span>
          </div>
          <div className="space-y-2.5">
            {threadInsights.slice(0, 3).map((insight, index) => {
              const Icon = THREAD_INSIGHT_ICONS[insight.type];
              return (
                <div key={`${insight.label}-${index}`} className="flex gap-2.5">
                  <Icon
                    size={14}
                    className="mt-0.5 shrink-0"
                    style={{ color: insight.type === "crucial" ? "var(--theme-status-error)" : "var(--theme-text-tertiary)" }}
                  />
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-text-primary">
                      {insight.label}
                    </p>
                    <p className="font-body text-sm leading-relaxed text-text-secondary mt-0.5">
                      {insight.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {crucialMessageTs || crucialMessageSummary ? (
        <div className="mt-4 rounded-lg border border-anger/25 bg-anger/6 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-anger/12 px-2.5 py-1 font-mono text-xs font-bold text-anger">
              <IconFlame size={12} />
              Crucial Message
            </span>
            {crucialMessageTs ? (
              <Link
                href={`#message-${crucialMessageTs.replace(".", "-")}`}
                className="font-mono text-xs text-text-tertiary transition-colors hover:text-text-secondary font-medium"
              >
                Jump to message
              </Link>
            ) : null}
          </div>
          {crucialMessageSummary ? (
            <p className="mt-2.5 font-body text-sm leading-relaxed text-text-secondary">
              {crucialMessageSummary}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
