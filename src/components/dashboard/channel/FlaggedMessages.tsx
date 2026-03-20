"use client";

import { useState } from "react";
import { FlaggedMessageCard } from "./FlaggedMessageCard";
import { Skeleton } from "@/components/ui";
import { useMessages } from "@/lib/hooks";
import type { EscalationRisk } from "@/lib/types";

interface FlaggedMessagesProps {
  channelId: string;
  userMap?: Map<string, string>;
  isRiskOnlyChannel?: boolean;
}

type FlaggedRiskFilter = EscalationRisk | "flagged";

const RISK_FILTERS: { label: string; value: FlaggedRiskFilter }[] = [
  { label: "All Flagged", value: "flagged" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
];

export function FlaggedMessages({
  channelId,
  userMap,
  isRiskOnlyChannel = false,
}: FlaggedMessagesProps) {
  const [riskFilter, setRiskFilter] = useState<FlaggedRiskFilter>("flagged");
  const [page, setPage] = useState(1);

  const { data: result, isLoading } = useMessages({
    channelId,
    risk: riskFilter,
    page,
    perPage: 20,
  });

  const messages = result?.data ?? [];
  const filtered = messages;
  const total = result?.total ?? 0;
  const hasMore = result?.hasMore ?? false;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-sans text-sm font-semibold text-text-primary">
          Flagged Messages
          {total > 0 && (
            <span className="ml-2 rounded-full bg-anger/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-anger">
              {total}
            </span>
          )}
        </h2>
        <div className="flex gap-1">
          {RISK_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setRiskFilter(f.value);
                setPage(1);
              }}
              className={[
                "rounded-md px-2 py-1 font-mono text-[10px] font-medium transition-colors duration-150",
                riskFilter === f.value
                  ? "bg-accent/10 text-accent"
                  : "text-text-tertiary hover:text-text-secondary",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center font-mono text-xs text-text-tertiary">
          {!result || total === 0
            ? isRiskOnlyChannel
              ? "Risk-only monitoring is active. Flagged messages will appear here only for severe escalation or policy-risk in this channel."
              : "No flagged medium/high-risk messages were found in the current analysis window."
            : "No messages match the selected filter."}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => {
            const patternContext =
              (msg.authorFlaggedCount ?? 0) > 1
                ? `${msg.authorFlaggedCount} flagged messages from ${msg.userName} in this channel`
                : undefined;

            return (
              <FlaggedMessageCard
                key={msg.id}
                message={msg}
                patternContext={patternContext}
                userMap={userMap}
              />
            );
          })}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
        <p className="font-mono text-[10px] text-text-tertiary">Page {page}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-md border border-border-default px-2.5 py-1 font-mono text-[10px] text-text-secondary transition-colors hover:bg-bg-tertiary/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((current) => current + 1)}
            disabled={!hasMore}
            className="rounded-md border border-border-default px-2.5 py-1 font-mono text-[10px] text-text-secondary transition-colors hover:bg-bg-tertiary/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
