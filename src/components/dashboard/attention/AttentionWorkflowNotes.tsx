import { formatAbsoluteDateTime } from "@/lib/utils/formatters";
import type { AttentionItem } from "@/lib/types";

interface AttentionWorkflowNotesProps {
  item: AttentionItem;
}

export function AttentionWorkflowNotes({ item }: AttentionWorkflowNotesProps) {
  const hasNotes = item.acknowledgedAt || (typeof item.ignoredScore === "number" && item.ignoredScore > 0) || item.primaryMissedSla;
  if (!hasNotes) return null;

  return (
    <div className="mt-3 rounded-xl border border-border-subtle/70 bg-bg-primary/45 p-3">
      <p className="font-mono text-badge uppercase tracking-wider text-text-tertiary">
        Workflow notes
      </p>
      {item.acknowledgedAt && (
        <p className="mt-2 font-body text-sm text-text-secondary">
          Acknowledged {formatAbsoluteDateTime(item.acknowledgedAt)}
        </p>
      )}
      {typeof item.ignoredScore === "number" && item.ignoredScore > 0 && (
        <p className="mt-1 font-body text-sm text-text-secondary">
          Looks intentionally bypassed {item.ignoredScore} time{item.ignoredScore === 1 ? "" : "s"}.
        </p>
      )}
      {item.primaryMissedSla && (
        <p className="mt-1 font-body text-sm text-text-secondary">
          Primary lane missed the reply window before resolution.
        </p>
      )}
    </div>
  );
}
