const INTENT_CONFIG: Record<string, { label: string; color: string }> = {
  request: { label: "Request", color: "var(--theme-status-sadness)" },
  question: { label: "Question", color: "var(--theme-status-info)" },
  decision: { label: "Decision", color: "var(--theme-status-fear)" },
  commitment: { label: "Commitment", color: "var(--theme-status-success)" },
  blocker: { label: "Blocker", color: "var(--theme-status-error)" },
  escalation: { label: "Escalation", color: "var(--theme-status-warning)" },
  fyi: { label: "FYI", color: "var(--theme-status-neutral)" },
  acknowledgment: { label: "Ack", color: "var(--theme-status-neutral)" },
};

interface IntentBadgeProps {
  intent: string;
  className?: string;
}

export function IntentBadge({ intent, className = "" }: IntentBadgeProps) {
  const config = INTENT_CONFIG[intent];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium ${className}`}
      style={{
        color: config.color,
        backgroundColor: `color-mix(in srgb, ${config.color} 16%, transparent)`,
      }}
    >
      {config.label}
    </span>
  );
}
