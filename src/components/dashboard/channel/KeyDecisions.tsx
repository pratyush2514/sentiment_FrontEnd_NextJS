import Link from "next/link";
import { IconCircleCheck, IconUsers } from "@tabler/icons-react";
import { relativeTime } from "@/lib/utils/formatters";
import type { KeyDecision } from "@/lib/types";

interface KeyDecisionsProps {
  channelId: string;
  decisions: KeyDecision[];
}

function confidenceLabel(c: number): { text: string; color: string } {
  if (c >= 0.9) return { text: "High", color: "var(--theme-status-success)" };
  if (c >= 0.75) return { text: "Medium", color: "var(--theme-status-warning)" };
  return { text: "Low", color: "var(--theme-status-neutral)" };
}

function buildEvidenceHref(
  channelId: string,
  evidence: NonNullable<KeyDecision["evidence"]>[number],
): string {
  if (evidence.threadTs && evidence.threadTs !== evidence.messageTs) {
    return `/dashboard/channels/${channelId}/threads/${evidence.threadTs}?messageTs=${evidence.messageTs}`;
  }

  return `/dashboard/channels/${channelId}?conversation=1&messageTs=${evidence.messageTs}`;
}

export function KeyDecisions({ channelId, decisions }: KeyDecisionsProps) {
  if (decisions.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-5">
      <h3 className="mb-4 font-sans text-sm font-semibold text-text-primary">
        Key Decisions
      </h3>
      <div className="space-y-4">
        {decisions.map((d, i) => {
          const conf = confidenceLabel(d.confidence);
          return (
            <div key={i} className="flex gap-2.5">
              <IconCircleCheck size={16} className="mt-0.5 shrink-0 text-joy" />
              <div className="min-w-0">
                <p className="font-body text-sm leading-relaxed text-text-secondary">
                  {d.text}
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="font-mono text-xs text-text-tertiary">
                    {d.detectedAt ? relativeTime(d.detectedAt) : "time unavailable"}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: conf.color }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: conf.color }} />
                    {conf.text}
                  </span>
                  {d.participantCount > 0 ? (
                    <span className="flex items-center gap-1 font-mono text-xs text-text-tertiary">
                      <IconUsers size={12} />
                      {d.participantCount}
                    </span>
                  ) : null}
                </div>
                {d.evidence && d.evidence.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {d.evidence.slice(0, 3).map((evidence, evidenceIndex) => (
                      <Link
                        key={`${evidence.messageTs}-${evidenceIndex}`}
                        href={buildEvidenceHref(channelId, evidence)}
                        className="rounded-full border border-border-subtle bg-bg-primary px-2.5 py-1 font-mono text-[10px] text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
                        title={evidence.excerpt ?? "Open the cited Slack context"}
                      >
                        Source {evidenceIndex + 1}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
