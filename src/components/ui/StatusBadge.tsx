import type { ChannelStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: ChannelStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  ChannelStatus,
  { label: string; color: string; dotClass: string }
> = {
  ready:        { label: "Ready",        color: "var(--theme-status-success)", dotClass: "" },
  initializing: { label: "Initializing", color: "var(--theme-status-warning)", dotClass: "animate-[pulse-dot_2s_infinite]" },
  pending:      { label: "Pending",      color: "var(--theme-status-neutral)", dotClass: "" },
  failed:       { label: "Failed",       color: "var(--theme-status-error)", dotClass: "" },
  removed:      { label: "Removed",      color: "var(--theme-status-neutral)", dotClass: "" },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${className}`}
      style={{
        color: config.color,
        backgroundColor: `color-mix(in srgb, ${config.color} 12%, transparent)`,
      }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`}
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
