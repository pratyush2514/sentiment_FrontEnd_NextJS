"use client";

import { useEffect, useMemo, useState } from "react";
import { useSWRConfig } from "swr";
import { IconAlertTriangle, IconBrandSlack, IconDeviceDesktop, IconMail, IconMoon, IconPlugConnectedX, IconShieldCheck, IconSun, IconUsers } from "@tabler/icons-react";
import { FathomSettingsSection } from "@/components/dashboard/settings/FathomSettingsSection";
import { Skeleton, ChannelPrefix } from "@/components/ui";
import { SyncChannelsButton } from "@/components/dashboard/common/SyncChannelsButton";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useChannelMembers, useChannels, useConversationPolicies, useRoles, useWorkspaceStatus } from "@/lib/hooks";
import { ROUTES, SLACK_BOT_INSTALL_SCOPES } from "@/lib/constants";
import type { ThemePreference } from "@/lib/theme";
import type { ConversationPolicy, RoleDirectoryEntry, UserRole } from "@/lib/types";
import type { TokenRotationStatus } from "@/lib/types/api";

type PolicyDrafts = Record<string, ConversationPolicy>;

const DEFAULT_ANALYSIS_WINDOW_DAYS = 7;
const MIN_ANALYSIS_WINDOW_DAYS = 1;
const MAX_ANALYSIS_WINDOW_DAYS = 30;

function importanceTierLabel(value: ConversationPolicy["effectiveImportanceTier"] | ConversationPolicy["importanceTierOverride"]) {
  switch (value) {
    case "high_value":
      return "High value";
    case "low_value":
      return "Low value";
    case "standard":
      return "Standard";
    default:
      return "Auto";
  }
}

function normalizeAnalysisWindowDays(value: number | null | undefined): number {
  const parsed = Number.isFinite(value ?? Number.NaN)
    ? Math.round(value ?? DEFAULT_ANALYSIS_WINDOW_DAYS)
    : DEFAULT_ANALYSIS_WINDOW_DAYS;

  return Math.max(
    MIN_ANALYSIS_WINDOW_DAYS,
    Math.min(MAX_ANALYSIS_WINDOW_DAYS, parsed),
  );
}

function normalizePolicy(policy: ConversationPolicy): ConversationPolicy {
  return {
    ...policy,
    analysisWindowDays: normalizeAnalysisWindowDays(policy.analysisWindowDays),
    importanceTierOverride: policy.importanceTierOverride ?? "auto",
    recommendedImportanceTier: policy.recommendedImportanceTier ?? "standard",
    effectiveImportanceTier: policy.effectiveImportanceTier ?? "standard",
    channelModeOverride: policy.channelModeOverride ?? "auto",
    recommendedChannelMode: policy.recommendedChannelMode ?? "collaboration",
    effectiveChannelMode: policy.effectiveChannelMode ?? "collaboration",
  };
}

function roleTone(role: UserRole | "unknown") {
  switch (role) {
    case "client":
      return "border-accent/30 bg-accent/10 text-accent";
    case "worker":
      return "border-positive/30 bg-positive/10 text-positive";
    case "senior":
      return "border-warning/30 bg-warning/10 text-warning";
    case "observer":
      return "border-border-subtle bg-bg-primary/60 text-text-secondary";
    default:
      return "border-border-subtle bg-bg-primary/60 text-text-tertiary";
  }
}

function roleLabel(role: UserRole | "unknown") {
  if (role === "unknown") {
    return "Unknown";
  }
  return role[0].toUpperCase() + role.slice(1);
}

function suggestionStrengthLabel(confidence: number): string {
  if (confidence >= 0.9) {
    return "Suggested · strong";
  }
  if (confidence >= 0.75) {
    return "Suggested · moderate";
  }
  return "Suggested · light";
}

function getTokenRotationStatusCopy(
  tokenRotationStatus?: TokenRotationStatus,
  lastError?: string | null,
) {
  switch (tokenRotationStatus) {
    case "legacy_reinstall_required":
      return {
        tone: "warning",
        title: "Slack bot reinstall required",
        message:
          "This workspace is still using a legacy Slack bot install without a refresh token. Reinstall PulseBoard once so bot access can rotate automatically.",
      };
    case "refresh_failed":
      return {
        tone: "danger",
        title: "Slack bot token refresh failed",
        message:
          lastError && lastError.trim().length > 0
            ? `PulseBoard could not refresh the Slack bot token automatically: ${lastError}`
            : "PulseBoard could not refresh the Slack bot token automatically. Reconnect the Slack app to restore reliable Slack access.",
      };
    case "expired_or_invalid":
      return {
        tone: "danger",
        title: "Slack bot token is expired or invalid",
        message:
          "Reconnect this workspace in Slack so PulseBoard can resume syncing channels, reading history, and processing events.",
      };
    default:
      return null;
  }
}

export default function SettingsPage() {
  const { mutate } = useSWRConfig();
  const { data: policies, isLoading: policiesLoading } = useConversationPolicies();
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const [policyDrafts, setPolicyDrafts] = useState<PolicyDrafts>({});
  const [savingPolicyId, setSavingPolicyId] = useState<string | null>(null);
  const [savedPolicyId, setSavedPolicyId] = useState<string | null>(null);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [roleSearch, setRoleSearch] = useState("");
  const [reviewingUserId, setReviewingUserId] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>(null);
  const [displayLabels, setDisplayLabels] = useState<Record<string, string>>({});
  const { data: channelMembers } = useChannelMembers(expandedPolicyId);
  const { themePreference, resolvedTheme, setThemePreference } = useTheme();
  const { data: channels } = useChannels();
  const { data: wsStatus, error: workspaceStatusError } = useWorkspaceStatus();
  const [disconnecting, setDisconnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const missingScopes = useMemo(() => {
    if (workspaceStatusError || !wsStatus?.installed) return [];
    if (!wsStatus.scopes) return SLACK_BOT_INSTALL_SCOPES as unknown as string[];
    const have = new Set(wsStatus.scopes);
    return (SLACK_BOT_INSTALL_SCOPES as unknown as string[]).filter((s: string) => !have.has(s));
  }, [workspaceStatusError, wsStatus?.installed, wsStatus?.scopes]);
  const tokenRotationStatusCopy = useMemo(
    () =>
      getTokenRotationStatusCopy(
        wsStatus?.tokenRotationStatus,
        wsStatus?.lastTokenRefreshError,
      ),
    [wsStatus?.lastTokenRefreshError, wsStatus?.tokenRotationStatus],
  );

  useEffect(() => {
    if (!policies) return;
    setPolicyDrafts((current) => {
      const next = { ...current };
      for (const policy of policies) {
        next[policy.channelId] = current[policy.channelId] ?? normalizePolicy(policy);
      }
      return next;
    });
  }, [policies]);

  const orderedPolicies = useMemo(
    () => [...(policies ?? [])].sort((left, right) => left.channelName.localeCompare(right.channelName)),
    [policies],
  );

  const filteredRoles = useMemo(() => {
    const query = roleSearch.trim().toLowerCase();
    const list = [...(roles ?? [])].sort((left, right) => {
      if (left.effectiveRole !== right.effectiveRole) {
        return left.effectiveRole.localeCompare(right.effectiveRole);
      }
      return right.messageCount - left.messageCount;
    });

    if (!query) {
      return list;
    }

    return list.filter((entry) => {
      return (
        entry.displayName.toLowerCase().includes(query) ||
        entry.userId.toLowerCase().includes(query) ||
        entry.email?.toLowerCase().includes(query)
      );
    });
  }, [roleSearch, roles]);

  async function savePolicy(policy: ConversationPolicy) {
    const payload = normalizePolicy(policy);
    setSavingPolicyId(policy.channelId);
    setSavedPolicyId(null);
    setPolicyError(null);
    try {
      const response = await fetch(`/api/conversation-policies/${policy.channelId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save conversation policy");
      }

      await Promise.all([
        mutate("/api/conversation-policies"),
        mutate("/api/roles"),
        mutate((key) => typeof key === "string" && key.startsWith("/api/inbox"), undefined, {
          revalidate: true,
        }),
      ]);
      setSavedPolicyId(policy.channelId);
    } catch (error) {
      setPolicyError(
        error instanceof Error ? error.message : "Failed to save conversation policy",
      );
    } finally {
      setSavingPolicyId(null);
    }
  }

  async function reviewRole(entry: RoleDirectoryEntry, action: "confirm" | "reject" | "clear", role?: UserRole, displayLabel?: string) {
    setReviewingUserId(entry.userId);
    setRoleError(null);
    try {
      const label = displayLabel ?? displayLabels[entry.userId];
      const response = await fetch(`/api/roles/${entry.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          role,
          ...(action === "confirm" && label ? { displayLabel: label } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role review");
      }

      await Promise.all([
        mutate("/api/roles"),
        mutate((key) => typeof key === "string" && key.startsWith("/api/inbox"), undefined, {
          revalidate: true,
        }),
      ]);
    } catch (error) {
      setRoleError(error instanceof Error ? error.message : "Failed to update role review");
    } finally {
      setReviewingUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-xl font-bold tracking-tight text-text-primary">
          Settings
        </h1>
        <p className="mt-1 max-w-3xl font-body text-sm leading-relaxed text-text-secondary">
          Review who is a client, worker, or senior teammate, then tune conversation policies so PulseBoard only escalates the right conversations on the right surfaces.
        </p>
      </div>

      <section className="rounded-2xl border border-border-subtle bg-bg-secondary/55 p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-accent/10 p-2 text-accent">
            {themePreference === "dark" ? <IconMoon size={16} /> : themePreference === "light" ? <IconSun size={16} /> : <IconDeviceDesktop size={16} />}
          </div>
          <div>
            <h2 className="font-sans text-base font-semibold text-text-primary">
              Appearance
            </h2>
            <p className="mt-1 font-body text-sm leading-relaxed text-text-secondary">
              Choose the workspace theme you want to use across landing, auth, inbox, alerts, and the investigation views.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {([
            {
              preference: "light",
              label: "Light",
              description: "Calm, high-contrast daytime workspace",
              icon: IconSun,
            },
            {
              preference: "dark",
              label: "Dark",
              description: "Low-glare focus mode for dense monitoring",
              icon: IconMoon,
            },
            {
              preference: "system",
              label: "System",
              description: "Follow your operating system appearance",
              icon: IconDeviceDesktop,
            },
          ] as const).map((option) => {
            const Icon = option.icon;
            const selected = themePreference === option.preference;

            return (
              <button
                key={option.preference}
                type="button"
                onClick={() => setThemePreference(option.preference as ThemePreference)}
                className={[
                  "rounded-2xl border p-4 text-left transition-colors duration-150",
                  selected
                    ? "border-accent/35 bg-accent/10"
                    : "border-border-subtle/70 bg-bg-primary/35 hover:border-border-default hover:bg-bg-primary/55",
                ].join(" ")}
                aria-pressed={selected}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={[
                      "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
                      selected ? "bg-accent/14 text-accent" : "bg-bg-tertiary/70 text-text-secondary",
                    ].join(" ")}
                  >
                    <Icon size={17} />
                  </span>
                  {selected ? (
                    <span className="rounded-full bg-accent/12 px-2 py-1 font-mono text-[10px] text-accent">
                      Active
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 font-sans text-sm font-semibold text-text-primary">
                  {option.label}
                </p>
                <p className="mt-1 font-body text-xs leading-relaxed text-text-secondary">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-[10px] text-text-tertiary">
          Resolved theme: {resolvedTheme === "dark" ? "Dark" : "Light"}
        </p>
      </section>

      <section className="rounded-2xl border border-border-subtle bg-bg-secondary/55 p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-accent/10 p-2 text-accent">
            <IconBrandSlack size={16} />
          </div>
          <div className="flex-1">
            <h2 className="font-sans text-base font-semibold text-text-primary">
              Channel management
            </h2>
            <p className="mt-1 font-body text-sm leading-relaxed text-text-secondary">
              Discover new channels the PulseBoard bot has been invited to.
              Currently tracking {channels?.length ?? 0} channel{channels?.length === 1 ? "" : "s"}.
            </p>
            <div className="mt-3">
              <SyncChannelsButton variant="full" />
            </div>
            <p className="mt-2 font-mono text-[10px] text-text-tertiary">
              In Slack, type <code className="rounded bg-bg-tertiary/60 px-1 py-0.5">/invite @PulseBoard</code> in any channel, then click Sync.
            </p>

            {workspaceStatusError && (
              <div className="mt-3 rounded-xl border border-anger/25 bg-anger/8 p-3">
                <p className="font-body text-xs font-medium text-text-primary">
                  Workspace status is unavailable right now
                </p>
                <p className="mt-1 font-body text-xs leading-relaxed text-text-secondary">
                  PulseBoard could not verify the installed Slack scopes, so missing-permission guidance is temporarily hidden until the backend responds again.
                </p>
              </div>
            )}

            {tokenRotationStatusCopy && (
              <div
                className={[
                  "mt-3 rounded-xl border p-3",
                  tokenRotationStatusCopy.tone === "warning"
                    ? "border-warning/25 bg-warning/8"
                    : "border-anger/25 bg-anger/8",
                ].join(" ")}
              >
                <div className="flex items-start gap-2">
                  <IconAlertTriangle
                    size={16}
                    className={
                      tokenRotationStatusCopy.tone === "warning"
                        ? "mt-0.5 shrink-0 text-warning"
                        : "mt-0.5 shrink-0 text-anger"
                    }
                  />
                  <div>
                    <p className="font-body text-xs font-medium text-text-primary">
                      {tokenRotationStatusCopy.title}
                    </p>
                    <p className="mt-1 font-body text-xs leading-relaxed text-text-secondary">
                      {tokenRotationStatusCopy.message}
                    </p>
                    <button
                      onClick={() => {
                        window.location.href = ROUTES.API_SLACK_INSTALL;
                      }}
                      className={[
                        "mt-2 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors",
                        tokenRotationStatusCopy.tone === "warning"
                          ? "border-warning/30 bg-warning/10 text-warning hover:bg-warning/20"
                          : "border-anger/30 bg-anger/10 text-anger hover:bg-anger/20",
                      ].join(" ")}
                    >
                      <IconBrandSlack size={14} />
                      Reconnect Slack Bot
                    </button>
                  </div>
                </div>
              </div>
            )}

            {missingScopes.length > 0 && (
              <div className="mt-3 rounded-xl border border-warning/25 bg-warning/8 p-3">
                <p className="font-body text-xs font-medium text-text-primary">
                  Missing permissions for private channels
                </p>
                <p className="mt-1 font-body text-xs leading-relaxed text-text-secondary">
                  The bot is missing{" "}
                  {missingScopes.map((s, i) => (
                    <span key={s}>
                      {i > 0 && ", "}
                      <code className="rounded bg-bg-tertiary/60 px-1 py-0.5 text-[10px]">{s}</code>
                    </span>
                  ))}
                  . Click below to update permissions — no need to disconnect.
                </p>
                <button
                  onClick={() => { window.location.href = ROUTES.API_SLACK_INSTALL; }}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-1.5 font-mono text-xs text-warning transition-colors hover:bg-warning/20"
                >
                  <IconBrandSlack size={14} />
                  Update Bot Permissions
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border-subtle bg-bg-secondary/55 p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-accent/10 p-2 text-accent">
            <IconShieldCheck size={16} />
          </div>
          <div>
            <h2 className="font-sans text-base font-semibold text-text-primary">
              Conversation policies
            </h2>
            <p className="mt-1 font-body text-sm leading-relaxed text-text-secondary">
              Define owners, client participants, seniors, analysis windows, SLA windows, privacy opt-ins, and whether Slack reminders should fire for each channel or conversation surface.
            </p>
            {policyError ? (
              <p className="mt-2 font-mono text-[10px] text-anger">
                {policyError}
              </p>
            ) : null}
          </div>
        </div>

        {policiesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : orderedPolicies.length === 0 ? (
          <p className="py-10 text-center font-mono text-xs text-text-tertiary">
            No conversation policies available yet.
          </p>
        ) : (
          <div className="space-y-4">
            {orderedPolicies.map((policy) => {
              const draft = normalizePolicy(policyDrafts[policy.channelId] ?? policy);
              const isSaving = savingPolicyId === policy.channelId;

              return (
                <div
                  key={policy.channelId}
                  className="rounded-2xl border border-border-subtle/70 bg-bg-primary/30 p-4"
                >
                  <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="flex items-center gap-0.5 font-sans text-sm font-semibold text-text-primary">
                        <ChannelPrefix type={policy.conversationType} size={12} />{policy.channelName}
                      </h3>
                      <p className="mt-1 font-mono text-[10px] text-text-tertiary">
                        {policy.conversationType.replaceAll("_", " ")}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full border border-border-subtle/70 px-2 py-1 font-mono text-[10px] text-text-tertiary">
                          Recommended: {importanceTierLabel(policy.recommendedImportanceTier)}
                        </span>
                        <span className="rounded-full border border-border-subtle/70 px-2 py-1 font-mono text-[10px] text-text-secondary">
                          Effective: {importanceTierLabel(draft.importanceTierOverride === "auto" ? policy.recommendedImportanceTier : draft.importanceTierOverride)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex items-center gap-2 rounded-full border border-border-subtle/70 px-3 py-1.5 font-body text-xs text-text-secondary">
                        <input
                          type="checkbox"
                          checked={draft.enabled}
                          onChange={(event) =>
                            setPolicyDrafts((current) => ({
                              ...current,
                              [policy.channelId]: {
                                ...draft,
                                enabled: event.target.checked,
                              },
                            }))
                          }
                        />
                        Track follow-ups
                      </label>
                      <label className="inline-flex items-center gap-2 rounded-full border border-border-subtle/70 px-3 py-1.5 font-body text-xs text-text-secondary">
                        <input
                          type="checkbox"
                          checked={draft.slackNotificationsEnabled}
                          onChange={(event) =>
                            setPolicyDrafts((current) => ({
                              ...current,
                              [policy.channelId]: {
                                ...draft,
                                slackNotificationsEnabled: event.target.checked,
                              },
                            }))
                          }
                        />
                        Send overdue Slack DMs
                      </label>
                      <label className="inline-flex items-center gap-2 rounded-full border border-border-subtle/70 px-3 py-1.5 font-body text-xs text-text-secondary">
                        <input
                          type="checkbox"
                          checked={draft.muted}
                          onChange={(event) =>
                            setPolicyDrafts((current) => ({
                              ...current,
                              [policy.channelId]: {
                                ...draft,
                                muted: event.target.checked,
                              },
                            }))
                          }
                        />
                        Pause reminders
                      </label>
                      <label className="inline-flex items-center gap-2 rounded-full border border-border-subtle/70 px-3 py-1.5 font-body text-xs text-text-secondary">
                        <input
                          type="checkbox"
                          checked={draft.privacyOptIn}
                          onChange={(event) =>
                            setPolicyDrafts((current) => ({
                              ...current,
                              [policy.channelId]: {
                                ...draft,
                                privacyOptIn: event.target.checked,
                              },
                            }))
                          }
                        />
                        Allow private-channel tracking
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <label className="space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary">
                        Conversation type
                      </span>
                      <select
                        value={draft.conversationType}
                        onChange={(event) =>
                          setPolicyDrafts((current) => ({
                            ...current,
                            [policy.channelId]: {
                              ...draft,
                              conversationType: event.target.value as ConversationPolicy["conversationType"],
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-border-default bg-bg-primary px-3 py-2 font-body text-sm text-text-primary"
                      >
                        <option value="public_channel">Public channel</option>
                        <option value="private_channel">Private channel</option>
                        <option value="dm" disabled>DM (coming soon)</option>
                        <option value="group_dm" disabled>Group DM (coming soon)</option>
                      </select>
                      </label>

                    <label className="space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary">
                        Importance tier
                      </span>
                      <select
                        value={draft.importanceTierOverride}
                        onChange={(event) =>
                          setPolicyDrafts((current) => ({
                            ...current,
                            [policy.channelId]: {
                              ...draft,
                              importanceTierOverride: event.target.value as ConversationPolicy["importanceTierOverride"],
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-border-default bg-bg-primary px-3 py-2 font-body text-sm text-text-primary"
                      >
                        <option value="auto">Auto</option>
                        <option value="high_value">High value</option>
                        <option value="standard">Standard</option>
                        <option value="low_value">Low value</option>
                      </select>
                      <p className="font-mono text-[10px] leading-relaxed text-text-tertiary">
                        Auto recommends a tier from client assignments and known low-signal channel names. Low value enables risk-only monitoring.
                      </p>
                    </label>

                    <label className="space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary">
                        Analysis window (days)
                      </span>
                      <input
                        type="number"
                        min={MIN_ANALYSIS_WINDOW_DAYS}
                        step={1}
                        max={MAX_ANALYSIS_WINDOW_DAYS}
                        value={draft.analysisWindowDays}
                        onChange={(event) =>
                          setPolicyDrafts((current) => ({
                            ...current,
                            [policy.channelId]: {
                              ...draft,
                              analysisWindowDays: normalizeAnalysisWindowDays(
                                Number.parseFloat(event.target.value),
                              ),
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-border-default bg-bg-primary px-3 py-2 font-mono text-sm text-text-primary"
                      />
                      <p className="font-mono text-[10px] leading-relaxed text-text-tertiary">
                        Only the most recent days in this window will be used when rebuilding summaries and recovering unanswered conversations.
                      </p>
                    </label>

                    <label className="space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary">
                        SLA (hours)
                      </span>
                      <input
                        type="number"
                        min={0.01}
                        step="any"
                        max={24 * 30}
                        value={draft.slaHours}
                        onChange={(event) =>
                          setPolicyDrafts((current) => ({
                            ...current,
                            [policy.channelId]: {
                              ...draft,
                              slaHours: Number.parseFloat(event.target.value) || 48,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-border-default bg-bg-primary px-3 py-2 font-mono text-sm text-text-primary"
                      />
                    </label>

                    <div className="space-y-3 md:col-span-2 xl:col-span-5">
                      {expandedPolicyId === policy.channelId && channelMembers ? (
                        <>
                          {(
                            [
                              { label: "Owners", key: "ownerUserIds" as const, tone: "border-positive/30 bg-positive/10 text-positive" },
                              { label: "Clients", key: "clientUserIds" as const, tone: "border-accent/30 bg-accent/10 text-accent" },
                              { label: "Seniors", key: "seniorUserIds" as const, tone: "border-warning/30 bg-warning/10 text-warning" },
                            ] as const
                          ).map(({ label, key, tone }) => (
                            <div key={key} className="space-y-1.5">
                              <span className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary">
                                {label}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {channelMembers.filter((m) => !m.isBot).map((member) => {
                                  const isSelected = draft[key].includes(member.userId);
                                  return (
                                    <button
                                      key={member.userId}
                                      type="button"
                                      onClick={() =>
                                        setPolicyDrafts((current) => ({
                                          ...current,
                                          [policy.channelId]: {
                                            ...draft,
                                            [key]: isSelected
                                              ? draft[key].filter((id) => id !== member.userId)
                                              : [...draft[key], member.userId],
                                          },
                                        }))
                                      }
                                      className={[
                                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] transition-colors",
                                        isSelected
                                          ? tone
                                          : "border-border-subtle/70 bg-bg-primary/40 text-text-tertiary hover:bg-bg-tertiary/40 hover:text-text-secondary",
                                      ].join(" ")}
                                    >
                                      {member.profileImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={member.profileImage} alt="" className="h-4 w-4 rounded-full" />
                                      ) : null}
                                      {member.displayName}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setExpandedPolicyId(null)}
                            className="font-mono text-[10px] text-text-tertiary transition-colors hover:text-text-secondary"
                          >
                            Collapse member picker
                          </button>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary">
                              Assigned roles:
                            </span>
                            {draft.ownerUserIds.length > 0 && (
                              <span className="rounded-full border border-positive/30 bg-positive/10 px-2 py-0.5 font-mono text-[10px] text-positive">
                                {draft.ownerUserIds.length} owner{draft.ownerUserIds.length > 1 ? "s" : ""}
                              </span>
                            )}
                            {draft.clientUserIds.length > 0 && (
                              <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
                                {draft.clientUserIds.length} client{draft.clientUserIds.length > 1 ? "s" : ""}
                              </span>
                            )}
                            {draft.seniorUserIds.length > 0 && (
                              <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 font-mono text-[10px] text-warning">
                                {draft.seniorUserIds.length} senior{draft.seniorUserIds.length > 1 ? "s" : ""}
                              </span>
                            )}
                            {draft.ownerUserIds.length === 0 && draft.clientUserIds.length === 0 && draft.seniorUserIds.length === 0 && (
                              <span className="font-mono text-[10px] text-text-tertiary">None assigned</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedPolicyId(policy.channelId)}
                            className="rounded-lg border border-border-subtle/70 px-3 py-1.5 font-mono text-[10px] text-text-secondary transition-colors hover:bg-bg-tertiary/40"
                          >
                            Pick members
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-3">
                    {savedPolicyId === policy.channelId ? (
                      <span className="font-mono text-[10px] text-positive">
                        Saved
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void savePolicy(draft)}
                      disabled={isSaving}
                      className="rounded-lg bg-accent px-4 py-2 font-mono text-xs font-medium text-bg-primary transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save policy"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section id="channel-roles" className="scroll-mt-6 rounded-2xl border border-border-subtle bg-bg-secondary/55 p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-positive/10 p-2 text-positive">
            <IconUsers size={16} />
          </div>
          <div className="flex-1">
            <h2 className="font-sans text-base font-semibold text-text-primary">
              Role review
            </h2>
            <p className="mt-1 font-body text-sm leading-relaxed text-text-secondary">
              Confirm who is a client, worker, senior, or observer. Confirmed roles always win over automatic inference, immediately re-score recent unanswered messages, and help PulseBoard decide who should reply next in the inbox.
            </p>
            {roleError ? (
              <p className="mt-2 font-mono text-[10px] text-anger">
                {roleError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={roleSearch}
            onChange={(event) => setRoleSearch(event.target.value)}
            placeholder="Search by name, email, or Slack user ID"
            className="w-full rounded-xl border border-border-default bg-bg-primary px-3 py-2 font-body text-sm text-text-primary lg:max-w-md"
          />
        </div>

        {rolesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : filteredRoles.length === 0 ? (
          <p className="py-10 text-center font-mono text-xs text-text-tertiary">
            No role suggestions match the current search.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredRoles.map((entry) => {
              const isReviewing = reviewingUserId === entry.userId;
              const suggestion = entry.suggestedRole;
              const reasonLines = suggestion?.reasons ?? [];

              return (
                <div
                  key={entry.userId}
                  className="rounded-2xl border border-border-subtle/70 bg-bg-primary/30 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-bg-primary">
                        {entry.profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={entry.profileImage} alt={entry.displayName} className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-sans text-sm font-semibold text-text-primary">
                            {entry.displayName.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-sans text-sm font-semibold text-text-primary">
                            {entry.displayName}
                          </h3>
                          <span
                            className={[
                              "rounded-full border px-2 py-1 font-mono text-[10px] uppercase tracking-wide",
                              roleTone(entry.effectiveRole),
                            ].join(" ")}
                          >
                            {roleLabel(entry.effectiveRole)}
                          </span>
                          {entry.confirmedRole ? (
                            <span className="rounded-full border border-positive/30 bg-positive/10 px-2 py-1 font-mono text-[10px] text-positive">
                              Confirmed
                            </span>
                          ) : suggestion ? (
                            <span className="rounded-full border border-border-subtle/70 bg-bg-primary/60 px-2 py-1 font-mono text-[10px] text-text-secondary">
                              {suggestionStrengthLabel(suggestion.confidence)}
                            </span>
                          ) : null}
                          {entry.displayLabel ? (
                            <span className="rounded-full border border-border-subtle/50 bg-bg-primary/40 px-2 py-1 font-mono text-[10px] text-text-secondary">
                              {entry.displayLabel}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-text-tertiary">
                          <span className="font-mono text-[10px]">{entry.userId}</span>
                          {entry.email ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px]">
                              <IconMail size={10} />
                              {entry.email}
                            </span>
                          ) : null}
                          <span className="font-mono text-[10px]">
                            {entry.messageCount} msgs across {entry.channelCount} channels
                          </span>
                        </div>

                        {reasonLines.length > 0 ? (
                          <ul className="mt-3 space-y-1">
                            {reasonLines.map((reason) => (
                              <li
                                key={reason}
                                className="font-body text-sm leading-relaxed text-text-secondary"
                              >
                                {reason}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 font-body text-sm text-text-secondary">
                            No strong inference yet. Confirm only if you know this user’s role in the workspace.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:w-[19rem]">
                      <input
                        type="text"
                        value={displayLabels[entry.userId] ?? entry.displayLabel ?? ""}
                        onChange={(event) =>
                          setDisplayLabels((current) => ({
                            ...current,
                            [entry.userId]: event.target.value,
                          }))
                        }
                        placeholder="e.g. Founder, Team Lead"
                        className="w-full rounded-lg border border-border-subtle/70 bg-bg-primary px-3 py-1.5 font-mono text-[10px] text-text-primary placeholder:text-text-tertiary"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        {(["client", "worker", "senior", "observer"] as UserRole[]).map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => void reviewRole(entry, "confirm", role)}
                            disabled={isReviewing}
                            className="rounded-lg border border-border-subtle/70 px-3 py-2 font-mono text-[10px] text-text-secondary transition-colors hover:bg-bg-tertiary/40 disabled:opacity-50"
                          >
                            Confirm {roleLabel(role)}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {entry.suggestedRole ? (
                          <button
                            type="button"
                            onClick={() => void reviewRole(entry, "reject", entry.suggestedRole?.role)}
                            disabled={isReviewing}
                            className="rounded-lg border border-border-subtle/70 px-3 py-2 font-mono text-[10px] text-text-secondary transition-colors hover:bg-bg-tertiary/40 disabled:opacity-50"
                          >
                            Reject suggestion
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void reviewRole(entry, "clear")}
                          disabled={isReviewing}
                          className="rounded-lg border border-border-subtle/70 px-3 py-2 font-mono text-[10px] text-text-secondary transition-colors hover:bg-bg-tertiary/40 disabled:opacity-50"
                        >
                          Clear review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Disconnect Workspace ────────────────────────────────────────── */}
      <section className="rounded-2xl border border-anger/20 bg-anger/5 p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-anger/10 p-2 text-anger">
            <IconPlugConnectedX size={16} />
          </div>
          <div>
            <h2 className="font-sans text-base font-semibold text-text-primary">
              Disconnect workspace
            </h2>
            <p className="mt-1 font-body text-sm leading-relaxed text-text-secondary">
              Remove the bot and delete all stored data — channels, messages, sentiment analysis, follow-ups, and role assignments. You will need to re-install the bot to use PulseBoard again.
            </p>
          </div>
        </div>

        {wsStatus?.canDisconnect === false ? (
          <div className="mb-4 rounded-xl border border-warning/25 bg-bg-primary/60 px-4 py-3">
            <p className="font-body text-sm text-text-secondary">
              Only the Slack user who originally connected this workspace can disconnect it and delete the stored data.
            </p>
          </div>
        ) : null}

        {showDisconnectConfirm ? (
          <div className="rounded-xl border border-anger/30 bg-bg-primary/60 p-4">
            <p className="mb-3 font-body text-sm font-medium text-text-primary">
              Are you sure? This action is irreversible.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={disconnecting || wsStatus?.canDisconnect === false}
                onClick={async () => {
                  setDisconnecting(true);
                  try {
                    const res = await fetch("/api/auth/disconnect", { method: "DELETE" });
                    if (res.ok) {
                      window.location.href = "/connect";
                      return;
                    }
                  } catch {
                    // Fall through and re-enable the control.
                  }
                  setDisconnecting(false);
                }}
                className="rounded-lg bg-anger px-4 py-2 font-mono text-xs font-medium text-white transition-colors hover:bg-anger/80 disabled:opacity-50"
              >
                {disconnecting ? "Disconnecting..." : "Yes, disconnect everything"}
              </button>
              <button
                type="button"
                onClick={() => setShowDisconnectConfirm(false)}
                className="rounded-lg border border-border-subtle px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-tertiary/40"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={wsStatus?.canDisconnect === false}
            onClick={() => setShowDisconnectConfirm(true)}
            className="rounded-lg border border-anger/30 bg-bg-primary/60 px-4 py-2 font-mono text-xs text-anger transition-colors hover:bg-anger/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Disconnect workspace
          </button>
        )}
      </section>

      <FathomSettingsSection />
    </div>
  );
}
