"use client";

import { use } from "react";
import Link from "next/link";
import useSWR from "swr";
import { IconArrowLeft, IconExternalLink, IconVideo, IconUsers, IconClock } from "@tabler/icons-react";
import { PageHeader } from "@/components/primitives";
import { Skeleton } from "@/components/ui";
import { MeetingObligationRow } from "@/components/dashboard/meetings/MeetingObligationRow";
import { apiFetch } from "@/lib/api";
import type { MeetingObligation } from "@/lib/hooks";

interface MeetingDetail {
  meeting: {
    id: string;
    title: string;
    source: "api" | "webhook" | "shared_link";
    confidence: "high" | "medium";
    started_at: string;
    ended_at: string | null;
    duration_seconds: number | null;
    participants_json: Array<{ name: string; email: string | null; domain: string | null }>;
    fathom_summary: string | null;
    share_url: string | null;
    recording_url: string | null;
    channel_id: string | null;
    processing_status: string;
    extraction_status: string;
    created_at: string;
  };
  obligations: MeetingObligation[];
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function cleanSummary(raw: string): string {
  return raw
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\(https?:\/\/fathom\.video[^)]*\)/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, isLoading } = useSWR<MeetingDetail>(
    `/api/meetings/${id}`,
    apiFetch,
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  const meeting = data?.meeting;
  const obligations = data?.obligations ?? [];

  const actionItems = obligations.filter((o) =>
    ["action_item", "commitment", "next_step"].includes(o.obligation_type),
  );
  const decisions = obligations.filter((o) => o.obligation_type === "decision");
  const risks = obligations.filter((o) => o.obligation_type === "risk");
  const questions = obligations.filter((o) => o.obligation_type === "question");

  if (isLoading) {
    return (
      <div className="space-y-section">
        <div className="flex items-center gap-group">
          <Link href="/dashboard/commitments" className="text-text-tertiary hover:text-text-primary transition-colors">
            <IconArrowLeft size={18} />
          </Link>
          <Skeleton className="h-8 w-64 rounded-radius-md" />
        </div>
        <Skeleton className="h-48 w-full rounded-radius-md" />
        <Skeleton className="h-32 w-full rounded-radius-md" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="space-y-section">
        <Link href="/dashboard/commitments" className="flex items-center gap-element text-text-tertiary hover:text-text-primary transition-colors font-mono text-badge">
          <IconArrowLeft size={14} /> Back to commitments
        </Link>
        <div className="rounded-radius-md border border-border-subtle bg-bg-secondary/30 p-8 text-center">
          <IconVideo size={24} className="mx-auto mb-2 text-text-tertiary" />
          <p className="font-body text-body-sm text-text-tertiary">Meeting not found</p>
        </div>
      </div>
    );
  }

  const fathomUrl = meeting.share_url ?? meeting.recording_url;
  const durationMin = meeting.duration_seconds ? Math.round(meeting.duration_seconds / 60) : null;

  return (
    <div className="space-y-section">
      {/* Header */}
      <div className="space-y-group">
        <Link href="/dashboard/commitments" className="flex items-center gap-element text-text-tertiary hover:text-text-primary transition-colors font-mono text-badge">
          <IconArrowLeft size={14} /> Back to commitments
        </Link>

        <div className="flex items-start justify-between gap-group">
          <PageHeader title={meeting.title || "Untitled Meeting"} />
          {fathomUrl && (
            <a
              href={fathomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-radius-md border border-border-subtle px-3 py-1.5 font-mono text-badge text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
            >
              <IconExternalLink size={12} />
              View in Fathom
            </a>
          )}
        </div>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-group font-mono text-badge text-text-tertiary">
          <span className="rounded-radius-full border border-border-subtle px-1.5 py-0.5 text-[9px] text-text-secondary">
            {meeting.source === "shared_link" ? "Shared link" : "Fathom"}
          </span>
          <span className="rounded-radius-full border border-border-subtle px-1.5 py-0.5 text-[9px] text-text-secondary">
            {meeting.confidence === "medium" ? "Medium confidence" : "High confidence"}
          </span>
          <span className="flex items-center gap-1">
            <IconClock size={12} />
            {formatDate(meeting.started_at)}
          </span>
          {durationMin && <span>{durationMin} min</span>}
          <span className="flex items-center gap-1">
            <IconUsers size={12} />
            {meeting.participants_json.length} participant{meeting.participants_json.length !== 1 ? "s" : ""}
          </span>
          <span
            className="rounded-radius-full px-1.5 py-0.5 text-[9px]"
            style={{
              color: meeting.extraction_status === "completed" ? "var(--theme-status-success)" : "var(--theme-text-tertiary)",
              backgroundColor: meeting.extraction_status === "completed"
                ? "color-mix(in srgb, var(--theme-status-success) 10%, transparent)"
                : "color-mix(in srgb, var(--theme-text-tertiary) 10%, transparent)",
            }}
          >
            {meeting.extraction_status === "completed" ? "extracted" : meeting.extraction_status}
          </span>
        </div>
      </div>

      {/* Participants */}
      {meeting.participants_json.length > 0 && (
        <div className="rounded-radius-md border border-border-subtle bg-bg-secondary/30 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary mb-2">Participants</p>
          <div className="flex flex-wrap gap-element">
            {meeting.participants_json.map((p, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-radius-full border border-border-subtle px-2.5 py-1 font-body text-body-sm text-text-secondary"
              >
                {p.name}
                {p.domain && (
                  <span className="ml-1 font-mono text-[9px] text-text-tertiary">{p.domain}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {meeting.fathom_summary && (
        <div className="rounded-radius-md border border-border-subtle bg-bg-secondary/30 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary mb-2">Meeting Summary</p>
          <div className="font-body text-body-sm text-text-primary whitespace-pre-wrap leading-relaxed">
            {cleanSummary(meeting.fathom_summary)}
          </div>
        </div>
      )}

      {/* Action Items */}
      {actionItems.length > 0 && (
        <div className="rounded-radius-md border border-border-subtle bg-bg-secondary/30 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary mb-2">
            Action Items ({actionItems.length})
          </p>
          <div className="divide-y divide-border-subtle">
            {actionItems.map((ob) => (
              <MeetingObligationRow key={ob.id} obligation={ob} />
            ))}
          </div>
        </div>
      )}

      {/* Decisions */}
      {decisions.length > 0 && (
        <div className="rounded-radius-md border border-border-subtle bg-bg-secondary/30 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary mb-2">
            Decisions ({decisions.length})
          </p>
          <div className="divide-y divide-border-subtle">
            {decisions.map((ob) => (
              <MeetingObligationRow key={ob.id} obligation={ob} />
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {risks.length > 0 && (
        <div className="rounded-radius-md border border-border-subtle bg-bg-secondary/30 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary mb-2">
            Risk Signals ({risks.length})
          </p>
          <div className="divide-y divide-border-subtle">
            {risks.map((ob) => (
              <MeetingObligationRow key={ob.id} obligation={ob} />
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="rounded-radius-md border border-border-subtle bg-bg-secondary/30 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary mb-2">
            Open Questions ({questions.length})
          </p>
          <div className="divide-y divide-border-subtle">
            {questions.map((ob) => (
              <MeetingObligationRow key={ob.id} obligation={ob} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
