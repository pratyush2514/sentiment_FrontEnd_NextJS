import type { AttentionItem } from "@/lib/types";

interface AttentionRespondersProps {
  item: AttentionItem;
}

export function AttentionResponders({ item }: AttentionRespondersProps) {
  const hasResponders =
    item.expectedResponderNames.length > 0 ||
    item.primaryResponderNames.length > 0 ||
    item.escalationResponderNames.length > 0;

  if (!hasResponders) return null;

  return (
    <div className="mt-3 space-y-2">
      {item.expectedResponderNames.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-badge uppercase tracking-wide text-text-tertiary">Active lane</span>
          {item.expectedResponderNames.map((name) => (
            <span key={name} className="rounded-full border border-border-subtle/70 px-2 py-1 font-mono text-badge text-text-secondary">{name}</span>
          ))}
        </div>
      )}
      {item.primaryResponderNames.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-badge uppercase tracking-wide text-text-tertiary">Primary</span>
          {item.primaryResponderNames.map((name) => (
            <span key={`primary-${name}`} className="rounded-full border border-border-subtle/70 px-2 py-1 font-mono text-badge text-text-secondary">{name}</span>
          ))}
        </div>
      )}
      {item.escalationResponderNames.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-badge uppercase tracking-wide text-text-tertiary">Escalation</span>
          {item.escalationResponderNames.map((name) => (
            <span key={`escalation-${name}`} className="rounded-full border border-border-subtle/70 px-2 py-1 font-mono text-badge text-text-secondary">{name}</span>
          ))}
        </div>
      )}
    </div>
  );
}
