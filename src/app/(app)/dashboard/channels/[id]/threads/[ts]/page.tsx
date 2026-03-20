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
  const model = useThreadDetailModel(id, ts, { highlightedMessageTs });
  const [showFullHistory, setShowFullHistory] = useState(Boolean(highlightedMessageTs));
  const shouldShowFullHistory = useMemo(
    () => showFullHistory || Boolean(highlightedMessageTs),
    [highlightedMessageTs, showFullHistory],
  );

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
    <div className="space-y-6">
      <Link
        href={`/dashboard/channels/${id}`}
        className="inline-flex items-center gap-1.5 font-mono text-xs text-text-tertiary hover:text-text-secondary transition-colors"
      >
        <IconArrowLeft size={12} />
        Back to <ChannelPrefix type={model.conversationType} size={10} />{model.channelName}
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

      <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-sans text-sm font-semibold text-text-primary">
              Full Thread History
            </h2>
            <p className="mt-1 font-body text-xs text-text-tertiary">
              Summary and surfaced moments come first. Expand the full history only when you want to verify context or inspect the routine back-and-forth.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFullHistory((current) => !current)}
            className="inline-flex items-center gap-1 rounded-full border border-border-subtle/70 px-3 py-1.5 font-mono text-[10px] text-text-tertiary transition-colors hover:text-text-secondary"
            aria-expanded={shouldShowFullHistory}
          >
            <IconChevronDown
              size={12}
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
              <div className="space-y-6">
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
