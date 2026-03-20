"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { WorkspaceStatusResponse } from "@/lib/types/api";

export type WorkspaceStatus = WorkspaceStatusResponse;

export function useWorkspaceStatus() {
  return useSWR<WorkspaceStatus>(
    "/api/workspace-status",
    apiFetch,
    { revalidateOnFocus: true },
  );
}
