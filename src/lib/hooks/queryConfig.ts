import type { SWRConfiguration } from "swr";

export type DashboardQueryConfig = Pick<
  SWRConfiguration,
  | "refreshInterval"
  | "revalidateOnFocus"
  | "keepPreviousData"
  | "dedupingInterval"
  | "refreshWhenHidden"
>;

export function resolveDashboardQueryConfig(
  defaults: DashboardQueryConfig,
  overrides?: DashboardQueryConfig,
): DashboardQueryConfig {
  return {
    ...defaults,
    ...overrides,
  };
}
