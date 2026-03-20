"use client";

import { useState } from "react";
import { IconChevronDown, IconFlame } from "@tabler/icons-react";
import { MessageRichText } from "@/components/dashboard/common/MessageRichText";
import { OpenInSlackButton } from "@/components/dashboard/common/OpenInSlackButton";
import {
  EmotionBadge,
  InteractionToneBadge,
  IntentBadge,
  RiskBadge,
  Tooltip,
} from "@/components/ui";
import { hasAnalysisPayload } from "@/lib/utils/messageAnalysis";
import { useRelativeTime } from "@/lib/hooks";
import type { ThreadMessage } from "@/lib/types";

function triageChipLabel(message: ThreadMessage): string | null {
  if (message.triage?.relatedIncident) {
    return "Related incident";
  }

  if (message.triage?.signalType === "operational_incident") {
    return "Incident";
  }

  if (message.triage?.signalType === "human_risk") {
    return "Risk";
  }

  switch (message.triage?.candidateKind) {
    case "thread_turning_point":
      return "Turning point";
    case "resolution_signal":
      return "Resolution";
    case "context_only":
      return "Context";
    default:
      return null;
  }
}

function humanizeSignalValue(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

interface ThreadMessageCardProps {
  message: ThreadMessage;
  channelId?: string;
  highlighted?: boolean;
  showThreadLink?: boolean;
  userMap?: Map<string, string>;
}

export function ThreadMessageCard({
  message,
  channelId,
  highlighted = false,
  showThreadLink = true,
  userMap,
}: ThreadMessageCardProps) {
  const liveCreatedAt = useRelativeTime(message.createdAt);
  const [expanded, setExpanded] = useState(false);
  const hasAnalysis = hasAnalysisPayload(message);
  const hasCanonicalSignalDetails = Boolean(
    message.triage?.signalType &&
      message.triage.signalType !== "ignore" &&
      message.triage.signalType !== "context",
  );
  const hasTriggers = message.triggerPhrases && message.triggerPhrases.length > 0;
  const triageLabel = triageChipLabel(message);

  const highlightColor =
    message.emotion === "anger"
      ? "var(--theme-status-error)"
      : message.emotion === "fear"
        ? "var(--theme-status-fear)"
        : message.emotion === "sadness"
          ? "var(--theme-status-sadness)"
          : message.emotion === "joy"
            ? "var(--theme-status-success)"
            : "var(--theme-accent)";
  const anchorId = `message-${message.ts.replace(".", "-")}`;

  return (
    <div
      id={anchorId}
      className={[
        "scroll-mt-28 rounded-xl px-2 py-1 transition-colors",
        highlighted ? "bg-accent/8 ring-1 ring-accent/25" : "",
        message.isCrucial ? "ring-1 ring-anger/20 bg-anger/4" : "",
      ].join(" ")}
    >
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            message.userAvatar ||
            `https://api.dicebear.com/9.x/notionists/svg?seed=${message.userName}&radius=50`
          }
          alt={message.userName}
          width={28}
          height={28}
          className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-bg-tertiary ring-1 ring-border-subtle"
        />

        <div className="min-w-0 flex-1">
          {/* Meta */}
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-medium text-text-primary">
              {message.userName}
            </span>
            <span className="font-mono text-[10px] text-text-tertiary">
              {liveCreatedAt}
            </span>
            {message.interactionTone ? (
              <>
                <InteractionToneBadge tone={message.interactionTone} />
                {message.emotion ? (
                  <EmotionBadge
                    emotion={message.emotion}
                    size="sm"
                    className="opacity-65"
                  />
                ) : null}
              </>
            ) : message.emotion ? (
              <EmotionBadge emotion={message.emotion} />
            ) : null}
            {message.escalationRisk && message.escalationRisk !== "low" && (
              <RiskBadge risk={message.escalationRisk} />
            )}
            {message.messageIntent &&
              message.messageIntent !== "fyi" &&
              message.messageIntent !== "acknowledgment" && (
              <IntentBadge intent={message.messageIntent} />
            )}
            {message.isBlocking && (
              <span className="rounded-full bg-anger/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-anger">
                Blocked
              </span>
            )}
            {message.sarcasmDetected && (
              <span className="rounded-full bg-surprise/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-surprise">
                Sarcasm
              </span>
            )}
            {message.isCrucial && (
              <Tooltip content={message.crucialReason ?? "This message has been surfaced as crucial."}>
                <span className="inline-flex items-center gap-1 rounded-full bg-anger/12 px-1.5 py-0.5 font-mono text-[10px] font-medium text-anger">
                  <IconFlame size={10} />
                  Crucial
                </span>
              </Tooltip>
            )}
            {message.followUp ? (
              <Tooltip content={message.followUp.summary}>
                <span
                  className={[
                    "rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium",
                    message.followUp.seriousness === "high"
                      ? "bg-anger/15 text-anger"
                      : message.followUp.seriousness === "medium"
                        ? "bg-surprise/15 text-surprise"
                        : "bg-accent/12 text-accent",
                  ].join(" ")}
                >
                  Follow-up {message.followUp.seriousness}
                </span>
              </Tooltip>
            ) : null}
            {triageLabel ? (
              <Tooltip content={message.triage?.reasonCodes.join(", ") || "Backend triage classified this message before deep analysis."}>
                <span className="rounded-full bg-bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-medium text-text-tertiary">
                  {triageLabel}
                </span>
              </Tooltip>
            ) : null}
          </div>

          {/* Message text with in-text trigger phrase highlighting */}
          <div className="font-body text-sm text-text-secondary">
            <MessageRichText
              text={message.text}
              className="space-y-1.5 leading-relaxed"
              userMap={userMap}
              files={message.files}
              triggerPhrases={hasTriggers ? message.triggerPhrases : undefined}
              highlightColor={hasTriggers ? highlightColor : undefined}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {showThreadLink && channelId ? (
              <a
                href={`/dashboard/channels/${channelId}/threads/${message.threadTs ?? message.ts}?messageTs=${message.ts}#${anchorId}`}
                className="font-mono text-[10px] text-accent transition-colors hover:text-accent-hover"
              >
                Open thread
              </a>
            ) : null}
            {channelId ? (
              <OpenInSlackButton
                channelId={channelId}
                messageTs={message.ts}
                className="px-0 py-0 text-[10px]"
                label="Open in Slack"
              />
            ) : null}
          </div>

          {message.followUp ? (
            <div className="mt-3 rounded-md border border-border-subtle/70 bg-bg-tertiary/25 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                  Follow-up reminder
                </span>
                <span className="font-mono text-[10px] text-text-tertiary">
                  {message.followUp.repeatedAskCount > 1
                    ? `${message.followUp.repeatedAskCount} nudges`
                    : "1 open request"}
                </span>
              </div>
              <p className="mt-1 font-body text-[11px] leading-relaxed text-text-secondary">
                {message.followUp.summary || "This message is being tracked as a follow-up reminder."}
              </p>
            </div>
          ) : null}

          {/* Structured analysis */}
          {(hasAnalysis || hasCanonicalSignalDetails) && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 flex items-center gap-1 font-mono text-[10px] font-medium text-accent transition-colors hover:text-accent-hover"
                aria-expanded={expanded}
              >
                <IconChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                />
                {expanded
                  ? hasAnalysis
                    ? "Hide analysis"
                    : "Hide signal details"
                  : hasAnalysis
                    ? "View analysis"
                    : "View signal details"}
              </button>
              {expanded && (
                <div className="mt-2 space-y-2 rounded-md border border-border-subtle bg-bg-tertiary/30 p-3">
                  {hasAnalysis ? (
                    <>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        <div>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                            Interaction Tone
                          </span>
                          <p className="font-mono text-[11px] text-text-secondary capitalize">
                            {message.interactionTone ?? "neutral"}
                          </p>
                        </div>
                        <div>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                            Dominant Emotion
                          </span>
                          <p className="font-mono text-[11px] text-text-secondary capitalize">
                            {message.emotion ?? "neutral"}
                            {message.sarcasmDetected ? " (sarcastic)" : ""}
                          </p>
                        </div>
                        <div>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                            Confidence
                          </span>
                          <p className="font-mono text-[11px] text-text-secondary">
                            {typeof message.confidence === "number" ? `${Math.round(message.confidence * 100)}%` : "—"}
                          </p>
                        </div>
                        {message.behavioralPattern && (
                          <div className="col-span-2">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                              Behavioral Pattern
                            </span>
                            <p className="font-mono text-[11px] text-text-secondary">
                              {message.behavioralPattern}
                            </p>
                          </div>
                        )}
                      </div>
                      {message.explanation && message.explanation !== message.behavioralPattern && (
                        <div className="border-t border-border-subtle/50 pt-1.5 font-body text-[11px] leading-relaxed text-text-tertiary">
                          <MessageRichText text={message.explanation} className="space-y-1.5" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                          Signal Type
                        </span>
                        <p className="font-mono text-[11px] text-text-secondary">
                          {humanizeSignalValue(message.triage?.signalType)}
                        </p>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                          Severity
                        </span>
                        <p className="font-mono text-[11px] text-text-secondary">
                          {humanizeSignalValue(message.triage?.severity)}
                        </p>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                          State Impact
                        </span>
                        <p className="font-mono text-[11px] text-text-secondary">
                          {humanizeSignalValue(message.triage?.stateImpact)}
                        </p>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                          Evidence
                        </span>
                        <p className="font-mono text-[11px] text-text-secondary">
                          {humanizeSignalValue(message.triage?.evidenceType)}
                        </p>
                      </div>
                      {message.triage?.incidentFamily &&
                      message.triage.incidentFamily !== "none" ? (
                        <div className="col-span-2">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                            Incident Family
                          </span>
                          <p className="font-mono text-[11px] text-text-secondary">
                            {humanizeSignalValue(message.triage.incidentFamily)}
                          </p>
                        </div>
                      ) : null}
                      {message.triage?.relatedIncident ? (
                        <div className="col-span-2">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                            Related Incident
                          </span>
                          <p className="font-mono text-[11px] text-text-secondary">
                            #{message.triage.relatedIncident.sourceChannelName}
                            {message.triage.relatedIncident.blocksLocalWork
                              ? " may be affecting work in this channel."
                              : " was referenced in this conversation."}
                          </p>
                        </div>
                      ) : null}
                      {message.triage?.reasonCodes && message.triage.reasonCodes.length > 0 ? (
                        <div className="col-span-2 border-t border-border-subtle/50 pt-1.5">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-text-tertiary">
                            Reason Codes
                          </span>
                          <p className="mt-1 font-mono text-[11px] text-text-secondary">
                            {message.triage.reasonCodes.join(", ")}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
