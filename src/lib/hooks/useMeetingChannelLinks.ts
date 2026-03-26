"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";

export interface MeetingChannelLink {
  id: string;
  workspace_id: string;
  channel_id: string;
  link_type: string;
  domain_pattern: string | null;
  title_pattern: string | null;
  recorder_email_pattern: string | null;
  priority: number;
  enabled: boolean;
  digest_enabled: boolean;
  tracking_enabled: boolean;
}

interface LinksResponse {
  links: MeetingChannelLink[];
}

export function useMeetingChannelLinks() {
  return useSWR<LinksResponse>(
    "/api/meetings/channel-links",
    apiFetch,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 10_000,
    },
  );
}

export async function createMeetingChannelLink(input: {
  channel_id: string;
  link_type?: string;
  domain_pattern?: string;
  title_pattern?: string;
}): Promise<MeetingChannelLink> {
  const res = await fetch("/api/meetings/channel-links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to create rule");
  return json.data?.link;
}

export async function deleteMeetingChannelLink(linkId: string): Promise<void> {
  const res = await fetch(`/api/meetings/channel-links/${linkId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error ?? "Failed to delete rule");
  }
}
