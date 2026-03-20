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
    <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-5">
      <p className="mb-3 font-body text-sm leading-relaxed text-text-secondary">
        {summary}
      </p>
      <div className="flex items-center gap-3">
        {traj && TrajIcon ? (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium"
            style={{
              color: traj.color,
              backgroundColor: `color-mix(in srgb, ${traj.color} 14%, transparent)`,
            }}
          >
            <TrajIcon size={10} />
            {traj.label}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-bg-tertiary px-2 py-0.5 font-mono text-[10px] font-medium text-text-tertiary">
            Tracking sentiment
          </span>
        )}
        <span className="font-mono text-[10px] text-text-tertiary">
          {messageCount} messages
        </span>
      </div>

      {threadInsights.length > 0 ? (
        <div className="mt-4 rounded-lg border border-border-subtle/70 bg-bg-primary/40 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
              Thread insights
            </p>
            <span className="font-mono text-[10px] text-text-tertiary">
              {threadInsights.length} surfaced
            </span>
          </div>
          <div className="space-y-2">
            {threadInsights.slice(0, 3).map((insight, index) => {
              const Icon = THREAD_INSIGHT_ICONS[insight.type];
              return (
                <div key={`${insight.label}-${index}`} className="flex gap-2">
                  <Icon
                    size={12}
                    className="mt-0.5 shrink-0"
                    style={{ color: insight.type === "crucial" ? "var(--theme-status-error)" : "var(--theme-text-tertiary)" }}
                  />
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                      {insight.label}
                    </p>
                    <p className="font-body text-xs leading-relaxed text-text-secondary">
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
        <div className="mt-3 rounded-lg border border-anger/20 bg-anger/6 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-anger/10 px-2 py-0.5 font-mono text-[10px] font-medium text-anger">
              <IconFlame size={10} />
              Crucial message
            </span>
            {crucialMessageTs ? (
              <Link
                href={`#message-${crucialMessageTs.replace(".", "-")}`}
                className="font-mono text-[10px] text-text-tertiary transition-colors hover:text-text-secondary"
              >
                Jump to message
              </Link>
            ) : null}
          </div>
          {crucialMessageSummary ? (
            <p className="mt-2 font-body text-sm leading-relaxed text-text-secondary">
              {crucialMessageSummary}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
