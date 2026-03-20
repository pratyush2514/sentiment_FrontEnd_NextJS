"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { RoleDirectoryEntry } from "@/lib/types";

export function useRoles() {
  return useSWR<RoleDirectoryEntry[]>("/api/roles", apiFetch, {
    revalidateOnFocus: false,
    keepPreviousData: true,
    dedupingInterval: 10_000,
  });
}
