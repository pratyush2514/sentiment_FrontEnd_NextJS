"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { ChannelMemberWithRole } from "@/lib/types";

export function useChannelMembers(channelId: string | null) {
  return useSWR<ChannelMemberWithRole[]>(
    channelId ? `/api/roles/channel/${channelId}` : null,
    apiFetch,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 10_000,
    },
  );
}
