import { StatusBadge, HealthBadge, ChannelPrefix } from "@/components/ui";
import { shortNumber } from "@/lib/utils/formatters";
import type { ChannelState, ChannelStatus, ConversationType } from "@/lib/types";

interface ChannelHeaderProps {
  name: string;
  status: ChannelStatus;
  state: ChannelState | undefined;
  conversationType?: ConversationType;
}

export function ChannelHeader({ name, status, state, conversationType }: ChannelHeaderProps) {
  const health = state?.health ?? null;
  const activeMessageCount = state?.activeMessageCount ?? state?.messageCount ?? 0;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-mono text-lg font-bold text-text-primary">
          <ChannelPrefix type={conversationType} size={16} />{name}
        </h1>
        {state && (
          <p className="mt-0.5 font-body text-xs text-text-secondary">
            {shortNumber(activeMessageCount)} recent messages &middot;{" "}
            {state.participants.length} participants
            {state.initializedAt
              ? ` · Monitoring since ${new Date(state.initializedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}`
              : " · Monitoring active"}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={status} />
        {health && <HealthBadge health={health} />}
      </div>
    </div>
  );
}
