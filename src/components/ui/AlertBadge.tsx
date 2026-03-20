import type { AlertBadgeData } from "@/lib/utils/alertBadge";

interface AlertBadgeProps {
  badge: AlertBadgeData;
}

export function AlertBadge({ badge }: AlertBadgeProps) {
  return (
    <span
      className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold shrink-0"
      style={{ backgroundColor: badge.bg, color: badge.color }}
    >
      {badge.label}
    </span>
  );
}
