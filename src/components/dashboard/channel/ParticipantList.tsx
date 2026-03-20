import Link from "next/link";
import {
  IconTrendingUp,
  IconMinus,
  IconTrendingDown,
  IconAlertTriangle,
  IconSettings,
  IconFlame,
} from "@tabler/icons-react";
import { shortNumber } from "@/lib/utils/formatters";
import { Tooltip } from "@/components/ui";
import type { Participant } from "@/lib/types";

function frustrationLabel(score: number): { text: string; color: string } | null {
  if (score >= 50) return { text: "Frustrated", color: "var(--color-anger)" };
  if (score >= 25) return { text: "Tense", color: "var(--theme-status-warning)" };
  return null;
}

function roleTone(role: Participant["role"]) {
  switch (role) {
    case "client":
      return "border-accent/30 bg-accent/10 text-accent";
    case "worker":
      return "border-positive/30 bg-positive/10 text-positive";
    case "senior":
      return "border-warning/30 bg-warning/10 text-warning";
    case "observer":
      return "border-border-subtle bg-bg-primary/60 text-text-secondary";
    default:
      return "";
  }
}

function roleLabel(role: Participant["role"]) {
  switch (role) {
    case "client": return "Client";
    case "worker": return "Worker";
    case "senior": return "Senior";
    case "observer": return "Observer";
    default: return null;
  }
}

interface ParticipantListProps {
  participants: Participant[];
  selectedUserId?: string | null;
  onSelectUser?: (userId: string | null) => void;
  embedded?: boolean;
}

const TREND_CONFIG = {
  improving: { icon: IconTrendingUp, color: "var(--theme-status-success)", label: "Improving" },
  stable: { icon: IconMinus, color: "var(--theme-status-neutral)", label: "Stable" },
  declining: { icon: IconTrendingDown, color: "var(--theme-status-error)", label: "Declining" },
  insufficient: { icon: IconMinus, color: "var(--theme-chart-axis)", label: "Insufficient data" },
} as const;

export function ParticipantList({
  participants,
  selectedUserId,
  onSelectUser,
  embedded = false,
}: ParticipantListProps) {
  const content = (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-sans text-xs font-semibold text-text-primary">
          Participants
        </h3>
        {onSelectUser ? (
          <button
            type="button"
            onClick={() => onSelectUser(null)}
            className="font-mono text-[10px] text-text-tertiary transition-colors hover:text-text-secondary"
          >
            All participants
          </button>
        ) : null}
      </div>
      <div className="space-y-2.5">
        {participants.map((p) => {
          const trend = TREND_CONFIG[p.sentimentTrend];
          const TrendIcon = trend.icon;
          const selected = selectedUserId === p.userId;
          return (
            <button
              key={p.userId}
              type="button"
              onClick={() => onSelectUser?.(selected ? null : p.userId)}
              aria-pressed={selected}
              className={[
                "flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors",
                onSelectUser
                  ? selected
                    ? "bg-accent/10 ring-1 ring-accent/30"
                    : "hover:bg-bg-tertiary/40"
                  : "",
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  p.profileImage ||
                  `https://api.dicebear.com/9.x/notionists/svg?seed=${p.displayName}&radius=50`
                }
                alt={p.displayName}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full bg-bg-tertiary ring-1 ring-border-subtle"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-mono text-xs text-text-primary">
                    {p.displayName}
                  </p>
                  {p.role && p.role !== "unknown" && (
                    <Tooltip content={p.displayLabel ?? roleLabel(p.role) ?? ""}>
                      <span
                        className={[
                          "shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide",
                          roleTone(p.role),
                        ].join(" ")}
                      >
                        {p.displayLabel ?? roleLabel(p.role)}
                      </span>
                    </Tooltip>
                  )}
                  {p.escalationInvolvement > 0 && (
                    <Tooltip content={`Involved in ${p.escalationInvolvement} escalation(s)`}>
                      <span>
                        <IconAlertTriangle size={10} className="text-anger" />
                      </span>
                    </Tooltip>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[10px] text-text-tertiary">
                    {p.messageCount === 0
                      ? "No messages yet"
                      : `${shortNumber(p.messageCount)} msgs · ${p.contributionPct}%`}
                  </span>
                  {p.sentimentTrend !== "insufficient" && (
                    <Tooltip content={trend.label}>
                      <span className="flex items-center gap-0.5">
                        <TrendIcon size={9} style={{ color: trend.color }} />
                      </span>
                    </Tooltip>
                  )}
                  {(() => {
                    const frust = frustrationLabel(p.frustrationScore);
                    if (!frust) return null;
                    return (
                      <Tooltip content={`Frustration score: ${p.frustrationScore}/100`}>
                        <span
                          className="flex items-center gap-0.5 font-mono text-[9px] font-medium"
                          style={{ color: frust.color }}
                        >
                          <IconFlame size={9} />
                          {frust.text}
                        </span>
                      </Tooltip>
                    );
                  })()}
                </div>
              </div>
              {onSelectUser ? (
                <span
                  className={[
                    "shrink-0 font-mono text-[10px] transition-colors",
                    selected ? "text-accent" : "text-text-tertiary",
                  ].join(" ")}
                >
                  {selected ? "Open" : "Focus"}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <Link
        href="/dashboard/settings#channel-roles"
        className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] text-text-tertiary transition-colors hover:text-accent"
      >
        <IconSettings size={10} />
        Manage roles
      </Link>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-4">
      {content}
    </div>
  );
}
