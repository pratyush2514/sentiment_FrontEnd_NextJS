import { IconCircleCheck, IconUsers } from "@tabler/icons-react";
import { relativeTime } from "@/lib/utils/formatters";
import type { KeyDecision } from "@/lib/types";

interface KeyDecisionsProps {
  decisions: KeyDecision[];
}

function confidenceLabel(c: number): { text: string; color: string } {
  if (c >= 0.9) return { text: "High", color: "var(--theme-status-success)" };
  if (c >= 0.75) return { text: "Medium", color: "var(--theme-status-warning)" };
  return { text: "Low", color: "var(--theme-status-neutral)" };
}

export function KeyDecisions({ decisions }: KeyDecisionsProps) {
  if (decisions.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-4">
      <h3 className="mb-3 font-sans text-xs font-semibold text-text-primary">
        Key Decisions
      </h3>
      <div className="space-y-3">
        {decisions.map((d, i) => {
          const conf = confidenceLabel(d.confidence);
          return (
            <div key={i} className="flex gap-2.5">
              <IconCircleCheck size={14} className="mt-0.5 shrink-0 text-joy" />
              <div className="min-w-0">
                <p className="font-body text-xs leading-relaxed text-text-secondary">
                  {d.text}
                </p>
                <div className="mt-1 flex items-center gap-2.5">
                  <span className="font-mono text-[10px] text-text-tertiary">
                    {d.detectedAt ? relativeTime(d.detectedAt) : "time unavailable"}
                  </span>
                  <span className="flex items-center gap-0.5 font-mono text-[10px]" style={{ color: conf.color }}>
                    <span className="h-1 w-1 rounded-full" style={{ backgroundColor: conf.color }} />
                    {conf.text}
                  </span>
                  <span className="flex items-center gap-0.5 font-mono text-[10px] text-text-tertiary">
                    <IconUsers size={9} />
                    {d.participantCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
