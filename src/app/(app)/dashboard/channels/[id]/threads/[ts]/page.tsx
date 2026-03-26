"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconChevronDown } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";

import { ThreadHeader } from "@/components/dashboard/thread/ThreadHeader";
import { ThreadMessageCard } from "@/components/dashboard/thread/ThreadMessageCard";
import { ChannelPrefix, Skeleton } from "@/components/ui";
import { useThreadDetailModel } from "@/features/dashboard";

export default function ThreadDetailPage({
  params,
}: {
  params: Promise<{ id: string; ts: string }>;
}) {
  const { id, ts } = use(params);
  const searchParams = useSearchParams();
  const highlightedMessageTs = searchParams.get("messageTs");
  const scope = searchParams.get("scope");
  const model = useThreadDetailModel(id, ts, { highlightedMessageTs, scope });
  const [showFullHistory, setShowFullHistory] = useState(Boolean(highlightedMessageTs));
  const shouldShowFullHistory = useMemo(
    () => showFullHistory || Boolean(highlightedMessageTs),
    [highlightedMessageTs, showFullHistory],
  );
  const backHref = `/dashboard/channels/${id}${scope && scope !== "active" ? `?scope=${scope}` : ""}`;

  useEffect(() => {
    if (!highlightedMessageTs || !model.messages || model.messages.length === 0) {
      return;
    }

    const anchorId = `message-${highlightedMessageTs.replace(".", "-")}`;
    const timer = window.setTimeout(() => {
      document.getElementById(anchorId)?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [highlightedMessageTs, model.messages]);

  return (
    <div className="space-y-7">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-secondary/50 px-3 py-2 font-sans text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary/80 transition-all"
      >
        <IconArrowLeft size={14} />
        Back to <ChannelPrefix type={model.conversationType} size={12} />{model.channelName}
      </Link>

      {model.thread ? (
        <ThreadHeader
          summary={model.thread.summary}
          trajectory={model.thread.sentimentTrajectory}
          messageCount={model.thread.messageCount}
          threadInsights={model.threadInsights}
          crucialMessageTs={model.crucialMessageTs}
          crucialMessageSummary={model.crucialMessageSummary}
        />
      ) : (
        <Skeleton className="h-24 rounded-xl" />
      )}

      {model.thread?.openQuestions && model.thread.openQuestions.length > 0 ? (
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
          <h3 className="mb-2 font-mono text-xs font-semibold text-warning">
            Open Questions ({model.thread.openQuestions.length})
          </h3>
          <ul className="space-y-1.5">
            {model.thread.openQuestions.map((question, index) => (
              <li
                key={index}
                className="flex items-start gap-2 font-body text-sm text-text-secondary"
              >
                <span className="mt-1 text-warning">•</span>
                {question}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-sans text-base font-semibold text-text-primary">
              Full Thread History
            </h2>
            <p className="mt-1.5 font-body text-sm text-text-tertiary leading-relaxed">
              Summary and surfaced moments come first. Expand the full history to verify context or inspect the back-and-forth.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFullHistory((current) => !current)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-primary px-4 py-2 font-sans text-xs font-medium text-text-secondary transition-all hover:text-text-primary hover:bg-bg-secondary/80 hover:shadow-sm"
            aria-expanded={shouldShowFullHistory}
          >
            <IconChevronDown
              size={13}
              className={`transition-transform duration-200 ${shouldShowFullHistory ? "rotate-180" : ""}`}
            />
            {shouldShowFullHistory ? "Hide full history" : "View full history"}
          </button>
        </div>

        {shouldShowFullHistory ? (
          <div className="mt-5">
            {model.messagesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !model.messages || model.messages.length === 0 ? (
              <p className="py-8 text-center font-mono text-xs text-text-tertiary">
                No messages in this thread.
              </p>
            ) : (
              <div className="space-y-1">
                {model.messages.map((message) => (
                  <ThreadMessageCard
                    key={message.id}
                    channelId={id}
                    message={message}
                    highlighted={message.ts === highlightedMessageTs}
                    showThreadLink={false}
                    userMap={model.userMap}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-border-subtle/70 bg-bg-primary/35 p-4">
            <p className="font-body text-sm leading-relaxed text-text-secondary">
              The raw thread is tucked away by default so you can act from the summary, status, and surfaced moments first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
