"use client";

import { useState } from "react";
import {
  IconChevronDown,
  IconCircleCheck,
  IconFlag,
  IconBell,
} from "@tabler/icons-react";
import { MessageRichText } from "@/components/dashboard/common/MessageRichText";
import { OpenInSlackButton } from "@/components/dashboard/common/OpenInSlackButton";
import {
  EmotionBadge,
  HighlightedText,
  InteractionToneBadge,
  RiskBadge,
  Tooltip,
} from "@/components/ui";
import { relativeTime } from "@/lib/utils/formatters";
import type { FlaggedMessage } from "@/lib/types";

interface FlaggedMessageCardProps {
  message: FlaggedMessage;
  patternContext?: string;
  userMap?: Map<string, string>;
}

function emotionToHighlightColor(emotion: string): string {
  switch (emotion) {
    case "anger": return "var(--theme-status-error)";
    case "fear": return "var(--theme-status-fear)";
    case "sadness": return "var(--theme-status-sadness)";
    case "joy": return "var(--theme-status-success)";
    case "surprise": return "var(--theme-surprise)";
    case "disgust": return "var(--theme-status-error)";
    default: return "var(--theme-accent)";
  }
}

export function FlaggedMessageCard({ message, patternContext, userMap }: FlaggedMessageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const hasTriggers = message.analysis.triggerPhrases && message.analysis.triggerPhrases.length > 0;
  const highlightColor = emotionToHighlightColor(message.analysis.dominantEmotion);
  const interactionTone = message.analysis.interactionTone;

  return (
    <div
      className={[
        "rounded-lg border p-4 transition-colors",
        reviewed
          ? "border-border-subtle/50 bg-bg-secondary/20 opacity-70"
          : "border-border-subtle bg-bg-secondary/40 hover:bg-bg-secondary/60",
      ].join(" ")}
    >
      {/* Pattern context banner */}
      {patternContext && (
        <div className="mb-3 flex items-center gap-1.5 rounded-md bg-anger/8 px-2.5 py-1.5">
          <IconFlag size={11} className="shrink-0 text-anger" />
          <span className="font-mono text-[10px] text-anger">{patternContext}</span>
        </div>
      )}

      {/* Meta row */}
      <div className="mb-2 flex items-center gap-2 flex-wrap">
        <span className="font-mono text-xs font-medium text-text-primary">
          {message.userName}
        </span>
        <span className="font-mono text-[10px] text-text-tertiary">
          {relativeTime(message.createdAt)}
        </span>
        {interactionTone ? (
          <>
            <InteractionToneBadge tone={interactionTone} />
            <EmotionBadge
              emotion={message.analysis.dominantEmotion}
              size="sm"
              className="opacity-65"
            />
          </>
        ) : (
          <EmotionBadge emotion={message.analysis.dominantEmotion} />
        )}
        <RiskBadge risk={message.analysis.escalationRisk} />
        {message.analysis.sarcasmDetected && (
          <span className="rounded-full bg-surprise/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-surprise">
            Sarcasm
          </span>
        )}
      </div>

      {/* Message text with in-text trigger phrase highlighting */}
      <div className="rounded-md bg-bg-tertiary/30 px-3 py-2">
        <MessageRichText
          text={message.text}
          className="font-body text-[13px] leading-6 text-text-primary"
          userMap={userMap}
          files={message.files}
          triggerPhrases={hasTriggers ? message.analysis.triggerPhrases : undefined}
          highlightColor={hasTriggers ? highlightColor : undefined}
        />
      </div>

      {/* Action row */}
      <div className="mt-3 flex items-center gap-1 flex-wrap">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] font-medium text-accent hover:bg-accent/8 transition-colors"
          aria-expanded={expanded}
        >
          <IconChevronDown
            size={11}
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Hide analysis" : "View analysis"}
        </button>

        <span className="mx-1 h-3 w-px bg-border-default" aria-hidden="true" />

        {/* Quick actions */}
        <OpenInSlackButton channelId={message.channelId} messageTs={message.ts} />
        <button
          onClick={() => setReviewed(!reviewed)}
          className={[
            "flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] transition-colors",
            reviewed
              ? "text-joy bg-joy/8"
              : "text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/50",
          ].join(" ")}
        >
          <IconCircleCheck size={11} />
          <Tooltip content={reviewed ? "Undo review" : "Mark as reviewed"}>
            <span className="hidden sm:inline">{reviewed ? "Reviewed" : "Mark reviewed"}</span>
          </Tooltip>
        </button>
        <button
          className="flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/50 transition-colors"
        >
          <IconBell size={11} />
          <Tooltip content="Notify manager">
            <span className="hidden sm:inline">Notify</span>
          </Tooltip>
        </button>
      </div>

      {/* Expandable analysis */}
      {expanded && (
        <div className="mt-3 rounded-md border border-border-subtle bg-bg-tertiary/30 p-3">
          <HighlightedText
            text={message.analysis.explanation}
            className="font-body text-xs leading-relaxed text-text-secondary"
          />
          {message.analysis.themes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {message.analysis.themes.map((theme) => (
                <span
                  key={theme}
                  className="rounded-full bg-bg-tertiary px-2 py-0.5 font-mono text-[10px] text-text-tertiary"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
