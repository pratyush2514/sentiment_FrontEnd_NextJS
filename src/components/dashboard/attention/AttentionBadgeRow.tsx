import { IntentBadge, ChannelPrefix } from "@/components/ui";
import type { AttentionItem, ConversationType } from "@/lib/types";

function severityClasses(severity: AttentionItem["severity"]): string {
  switch (severity) {
    case "high": return "border-anger/30 bg-anger/10 text-anger";
    case "medium": return "border-warning/30 bg-warning/10 text-warning";
    default: return "border-accent/30 bg-accent/10 text-accent";
  }
}

function followUpStateLabel(item: AttentionItem): string {
  if (!item.followUpItemId) {
    return kindLabel(item.kind);
  }
  switch (item.workflowState) {
    case "acknowledged_waiting": return "Acknowledged, waiting on completion";
    case "escalated": return item.resolvedViaEscalation ? "Resolved by senior after escalation" : "Escalated to senior";
    case "expired": return "Quietly concluded";
    case "dismissed": return "Dismissed";
    case "resolved":
      if (item.resolvedViaEscalation) return "Resolved by senior after escalation";
      return "Resolved";
    default: break;
  }
  if (item.resolutionState === "resolved") {
    switch (item.resolutionReason) {
      case "reaction_ack": return "Acknowledged by reaction";
      case "reply": return "Resolved by reply";
      case "requester_ack": return "Acknowledged by requester";
      case "natural_conclusion": return "Concluded naturally";
      case "manual_done": return "Marked done";
      case "manual_dismissed": return "Dismissed";
      case "expired": return "Expired";
      default: return "Resolved";
    }
  }
  return "Awaiting first reply";
}

function kindLabel(kind: AttentionItem["kind"]): string {
  switch (kind) {
    case "reply_needed": return "Reply needed";
    case "follow_up_due": return "Follow-up due";
    case "leadership_instruction": return "Leadership";
    case "sentiment_risk": return "Sentiment risk";
    case "thread_escalation": return "Thread escalation";
  }
}

function conversationLabel(conversationType: ConversationType): string {
  switch (conversationType) {
    case "public_channel": return "Channel";
    case "private_channel": return "Private";
    case "dm": return "DM";
    case "group_dm": return "Group DM";
  }
}

interface AttentionBadgeRowProps {
  item: AttentionItem;
  relativeTime: string;
}

export function AttentionBadgeRow({ item, relativeTime }: AttentionBadgeRowProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className={`rounded-full border px-2 py-1 font-mono text-badge uppercase tracking-wide ${severityClasses(item.severity)}`}>
        {item.severity}
      </span>
      <span className="rounded-full bg-bg-primary/60 px-2 py-1 font-mono text-badge text-text-tertiary">
        {followUpStateLabel(item)}
      </span>
      <span className="rounded-full bg-bg-primary/60 px-2 py-1 font-mono text-badge text-text-tertiary">
        {conversationLabel(item.conversationType)}
      </span>
      <span className="inline-flex items-center gap-0.5 font-mono text-badge text-text-tertiary">
        <ChannelPrefix type={item.conversationType} size={9} />{item.channelName}
      </span>
      <span className="font-mono text-badge text-text-tertiary">{relativeTime}</span>
      {item.messageIntent && item.messageIntent !== "fyi" && item.messageIntent !== "acknowledgment" && (
        <IntentBadge intent={item.messageIntent} />
      )}
      {item.urgencyDimensions?.isBlocking && (
        <span className="rounded-full border border-anger/30 bg-anger/10 px-2 py-1 font-mono text-badge uppercase tracking-wide text-anger">
          Blocked
        </span>
      )}
      {item.urgencyDimensions && (item.urgencyDimensions.urgencyLevel === "high" || item.urgencyDimensions.urgencyLevel === "critical") && (
        <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-1 font-mono text-badge uppercase tracking-wide text-warning">
          {item.urgencyDimensions.urgencyLevel === "critical" ? "Critical" : "Urgent"}
        </span>
      )}
    </div>
  );
}
