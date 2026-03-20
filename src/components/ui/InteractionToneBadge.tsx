import { colorMixBg } from "@/lib/utils/emotionColor";
import type { InteractionTone } from "@/lib/types";

interface InteractionToneBadgeProps {
  tone: InteractionTone;
  className?: string;
}

const TONE_CONFIG: Record<InteractionTone, { label: string; color: string }> = {
  collaborative: { label: "Collaborative", color: "var(--color-positive)" },
  corrective: { label: "Corrective", color: "var(--color-accent)" },
  tense: { label: "Tense", color: "var(--color-warning)" },
  confrontational: { label: "Confrontational", color: "var(--color-error)" },
  dismissive: { label: "Dismissive", color: "var(--color-neutral)" },
  neutral: { label: "Neutral", color: "var(--color-neutral)" },
};

export function InteractionToneBadge({ tone, className = "" }: InteractionToneBadgeProps) {
  const config = TONE_CONFIG[tone];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${className}`}
      style={{
        color: config.color,
        backgroundColor: colorMixBg(config.color, 10),
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
