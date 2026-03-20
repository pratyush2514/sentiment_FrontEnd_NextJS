"use client";

import { useEffect, useMemo, useState } from "react";
import { IconChevronDown, IconMessageCircle2 } from "@tabler/icons-react";
import { ParticipantList } from "./ParticipantList";
import { ThreadMessageCard } from "@/components/dashboard/thread/ThreadMessageCard";
import { Skeleton } from "@/components/ui";
import { useLiveMessages } from "@/lib/hooks";
import type { Participant, ThreadMessage } from "@/lib/types";

interface PeopleConversationPanelProps {
  channelId: string;
  participants: Participant[];
  selectedParticipantId: string | null;
  onSelectParticipant: (userId: string | null) => void;
  initialOpen?: boolean;
  highlightedMessageTs?: string | null;
}

function deriveFreshnessLabel(messages: ThreadMessage[] | undefined): "Live" | "Mixed" | "Recent" {
  if (!messages || messages.length === 0) {
    return "Recent";
  }

  const realtimeCount = messages.filter((message) => message.source === "realtime").length;
  if (realtimeCount === 0) {
    return "Recent";
  }

  return realtimeCount === messages.length ? "Live" : "Mixed";
}

export function PeopleConversationPanel({
  channelId,
  participants,
  selectedParticipantId,
  onSelectParticipant,
  initialOpen = false,
  highlightedMessageTs = null,
}: PeopleConversationPanelProps) {
  const [showConversationOverride, setShowConversationOverride] = useState(
    initialOpen || Boolean(highlightedMessageTs) || Boolean(selectedParticipantId),
  );
  const selectedParticipant = participants.find((participant) => participant.userId === selectedParticipantId);
  const showConversation =
    showConversationOverride ||
    initialOpen ||
    Boolean(highlightedMessageTs) ||
    Boolean(selectedParticipantId);

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of participants) {
      if (p.displayName && p.displayName !== p.userId) {
        map.set(p.userId, p.displayName);
      }
    }
    return map;
  }, [participants]);

  const { data: messages, isLoading } = useLiveMessages(channelId, {
    limit: highlightedMessageTs ? 36 : 24,
    participantId: selectedParticipantId,
    group: "threaded",
    enabled: true,
  });
  const freshnessLabel = deriveFreshnessLabel(messages);

  useEffect(() => {
    if (!highlightedMessageTs || !showConversation) return;

    const anchorId = `message-${highlightedMessageTs.replace(".", "-")}`;
    const timer = window.setTimeout(() => {
      document.getElementById(anchorId)?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [highlightedMessageTs, messages, showConversation]);

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-sans text-sm font-semibold text-text-primary">
            People & Conversation
          </h2>
          <p className="mt-1 font-body text-xs text-text-tertiary">
            {selectedParticipant
              ? `Focused on ${selectedParticipant.displayName}`
              : "Summary first. Open the recent conversation only when you want to inspect the underlying thread-by-thread context."}
          </p>
        </div>
        <span className="font-mono text-[10px] text-text-tertiary">
          {freshnessLabel}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowConversationOverride((current) => !current)}
          aria-expanded={showConversation}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg border border-border-subtle/60 bg-bg-tertiary/20 px-3 py-2.5 text-left transition-colors hover:border-border-subtle hover:bg-bg-tertiary/30"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <IconMessageCircle2 size={14} className="text-accent" />
              <h3 className="font-sans text-xs font-semibold text-text-primary">
                {selectedParticipant
                  ? `Conversation with ${selectedParticipant.displayName}`
                  : "Latest channel activity"}
              </h3>
            </div>
            <p className="mt-1 font-body text-[11px] text-text-tertiary">
              {selectedParticipant
                ? "Focused recent feed with thread-aware replies."
                : "Expand to inspect recent stored activity without cluttering the channel view or triggering extra AI work."}
            </p>
          </div>
          <IconChevronDown
            size={14}
            className={[
              "shrink-0 text-text-tertiary transition-transform duration-200",
              showConversation ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>
        {selectedParticipant ? (
          <button
            type="button"
            onClick={() => onSelectParticipant(null)}
            className="shrink-0 rounded-full border border-border-subtle/70 px-2 py-1 font-mono text-[10px] text-text-tertiary transition-colors hover:text-text-secondary"
          >
            Reset
          </button>
        ) : null}
      </div>

      {showConversation ? (
        <div className="mt-3">
          {isLoading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : !messages || messages.length === 0 ? (
            <p className="py-6 text-center font-mono text-xs text-text-tertiary">
              {selectedParticipant
                ? `No recent messages from ${selectedParticipant.displayName}.`
                : "No recent conversation yet."}
            </p>
          ) : (
            <div className="max-h-[28rem] space-y-2.5 overflow-y-auto pr-1">
              {messages.map((message) => (
                <ThreadMessageCard
                  key={message.id}
                  channelId={channelId}
                  message={message}
                  highlighted={message.ts === highlightedMessageTs}
                  userMap={userMap}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-bg-tertiary/10 px-3 py-2.5">
          <p className="font-body text-[11px] text-text-tertiary">
            {selectedParticipant
              ? messages && messages.length > 0
                ? `${messages.length} recent messages from ${selectedParticipant.displayName} are ready to inspect.`
                : `Tap again to inspect ${selectedParticipant.displayName}'s latest thread activity.`
              : isLoading
                ? "Loading the latest channel activity in the background."
                : messages && messages.length > 0
                  ? `${messages.length} recent messages are ready to inspect.`
                  : "The recent activity feed stays tucked away until you need to inspect it."}
          </p>
          <span className="font-mono text-[10px] text-text-tertiary">
            Hidden
          </span>
        </div>
      )}

      <div className="my-4 border-t border-border-subtle/70" />

      <ParticipantList
        participants={participants}
        selectedUserId={selectedParticipantId}
        onSelectUser={onSelectParticipant}
        embedded
      />
    </div>
  );
}
