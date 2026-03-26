"use client";

import { useState } from "react";
import { PageHeader } from "@/components/primitives";
import FilterPill from "@/components/primitives/FilterPill";
import { CommitmentsList } from "@/components/dashboard/commitments/CommitmentsList";
import { useMeetingObligations, useChannels } from "@/lib/hooks";

const STATUS_FILTERS = [
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "All", value: "" },
] as const;

export default function CommitmentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [channelFilter, setChannelFilter] = useState<string>("");

  const { data, isLoading } = useMeetingObligations({
    status: statusFilter || undefined,
    channelId: channelFilter || undefined,
  });

  const { data: channels } = useChannels();

  const obligations = data?.obligations ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-section">
      <PageHeader
        title="Meeting Commitments"
        description="Action items, decisions, and commitments from Fathom meetings"
      />

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-group">
        {/* Status filters */}
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map((f) => (
            <FilterPill
              key={f.value}
              label={f.label}
              active={statusFilter === f.value}
              onClick={() => setStatusFilter(f.value)}
            />
          ))}
        </div>

        {/* Channel filter */}
        {channels && channels.length > 0 && (
          <div className="flex items-center gap-1">
            <FilterPill
              label="All channels"
              active={channelFilter === ""}
              onClick={() => setChannelFilter("")}
            />
            {channels.slice(0, 6).map((ch) => (
              <FilterPill
                key={ch.id}
                label={`#${ch.name}`}
                active={channelFilter === ch.id}
                onClick={() => setChannelFilter(ch.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CommitmentsList
        obligations={obligations}
        total={total}
        isLoading={isLoading}
      />
    </div>
  );
}
