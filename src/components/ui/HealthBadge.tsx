import { getHealthColor, colorMixBg } from "@/lib/utils/emotionColor";
import type { ChannelHealth } from "@/lib/types";

interface HealthBadgeProps {
  health: ChannelHealth;
  className?: string;
}

const HEALTH_LABELS: Record<ChannelHealth, string> = {
  healthy:   "Healthy",
  attention: "Attention",
  "at-risk": "At Risk",
};

export function HealthBadge({ health, className = "" }: HealthBadgeProps) {
  const color = getHealthColor(health);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${className}`}
      style={{
        color,
        backgroundColor: colorMixBg(color, 10),
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {HEALTH_LABELS[health]}
    </span>
  );
}
