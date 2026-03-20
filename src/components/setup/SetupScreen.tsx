"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  IconAlertTriangle,
  IconBrandSlack,
  IconCheck,
  IconLoader2,
  IconRefresh,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { useChannels, useSession, useWorkspaceStatus } from "@/lib/hooks";
import { Skeleton, StatusBadge, ChannelPrefix } from "@/components/ui";
import { relativeTime } from "@/lib/utils/formatters";
import { ROUTES } from "@/lib/constants";

const DISCOVERY_SESSION_KEY = "pb_discovery_triggered";

type DiscoveryPhase = "idle" | "discovering" | "complete";

type DiscoveryAction =
  | { type: "start" }
  | { type: "stop" }
  | { type: "complete" };

function discoveryPhaseReducer(
  state: DiscoveryPhase,
  action: DiscoveryAction,
): DiscoveryPhase {
  switch (action.type) {
    case "start":
      return "discovering";
    case "stop":
      return "idle";
    case "complete":
      return "complete";
    default:
      return state;
  }
}

function ChannelListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-16 rounded-2xl" />
      ))}
    </div>
  );
}


function DiscoveryProgress() {
  return (
    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-accent/12 shrink-0">
          <IconLoader2 size={18} className="text-accent animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="font-body text-sm text-text-primary">
            Discovering channels...
          </p>
          <p className="font-body text-sm leading-relaxed text-text-secondary">
            Scanning your workspace for channels the bot is a member of.
            This usually takes a few seconds.
          </p>
        </div>
      </div>
    </div>
  );
}

function getTokenRotationNotice(tokenRotationStatus?: string | null) {
  switch (tokenRotationStatus) {
    case "legacy_reinstall_required":
      return {
        title: "Slack bot reinstall required",
        message:
          "This workspace is using a legacy Slack bot install without a refresh token. Reinstall PulseBoard once so bot access can rotate automatically.",
        containerClassName: "border-warning/25 bg-warning/8",
        iconClassName: "text-warning",
        buttonClassName:
          "border-warning/30 bg-warning/10 text-warning hover:bg-warning/20",
        actionLabel: "Reconnect Slack Bot",
      };
    case "refresh_failed":
      return {
        title: "Slack bot token refresh failed",
        message:
          "PulseBoard could not refresh the Slack bot token automatically. Reconnect the Slack app to restore reliable Slack access before testing further.",
        containerClassName: "border-anger/20 bg-anger/8",
        iconClassName: "text-anger",
        buttonClassName:
          "border-anger/30 bg-anger/10 text-anger hover:bg-anger/20",
        actionLabel: "Reconnect Slack Bot",
      };
    case "expired_or_invalid":
      return {
        title: "Slack bot access has expired",
        message:
          "The stored Slack bot token is expired or invalid. Reconnect the workspace so PulseBoard can resume syncing channels and processing events.",
        containerClassName: "border-anger/20 bg-anger/8",
        iconClassName: "text-anger",
        buttonClassName:
          "border-anger/30 bg-anger/10 text-anger hover:bg-anger/20",
        actionLabel: "Reconnect Slack Bot",
      };
    default:
      return null;
  }
}

function InviteBotToChannel({ onRescan }: { onRescan: () => void }) {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRescan = () => {
    setCooldown(60);
    onRescan();
  };

  return (
    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-accent/12 shrink-0">
          <IconBrandSlack size={18} className="text-accent" />
        </div>
        <div className="space-y-2">
          <p className="font-body text-sm font-medium text-text-primary">
            Bot is installed in your workspace
          </p>
          <p className="font-body text-sm leading-relaxed text-text-secondary">
            Invite the bot to a channel to start tracking conversations. In Slack, go to the channel and type:
          </p>
          <code className="block rounded-lg bg-bg-tertiary/60 px-3 py-2 font-mono text-xs text-text-primary">
            /invite @PulseBoard
          </code>
          <p className="font-body text-xs text-text-tertiary">
            This page updates automatically — once the bot joins a channel, tracking starts immediately.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleRescan}
              disabled={cooldown > 0}
              className="inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/8 px-4 py-2 font-mono text-xs text-accent transition-colors hover:bg-accent/15 disabled:opacity-60"
            >
              <IconRefresh size={14} />
              {cooldown > 0 ? `Re-scan (${cooldown}s)` : "Re-scan Workspace"}
            </button>
            <p className="font-body text-xs text-text-tertiary">
              Already invited the bot? Click to re-scan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SyncChannelsSection({ onSynced }: { onSynced: () => void }) {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch("/api/channels/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok || json.ok === false) {
        setSyncError(json.error ?? "Sync failed");
        return;
      }
      onSynced();
    } catch {
      setSyncError("Failed to connect to backend");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-tertiary/20 p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-accent/12 shrink-0">
          <IconBrandSlack size={18} className="text-accent" />
        </div>
        <div className="space-y-3 flex-1">
          <div className="space-y-1">
            <p className="font-body text-sm text-text-primary">
              No channels are tracked yet.
            </p>
            <p className="font-body text-sm leading-relaxed text-text-secondary">
              Click below to discover all channels (public and private) the bot is a member of and start backfilling messages.
              You can also invite the bot to new channels in Slack — they will be auto-detected.
            </p>
          </div>
          {syncError && (
            <p className="font-mono text-xs text-anger">{syncError}</p>
          )}
          <button
            onClick={() => void handleSync()}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/8 px-4 py-2 font-mono text-xs text-accent transition-colors hover:bg-accent/15 disabled:opacity-60"
          >
            {syncing ? <IconLoader2 size={14} className="animate-spin" /> : <IconRefresh size={14} />}
            {syncing ? "Syncing..." : "Sync Channels from Slack"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InstallBotSection({ error }: { error: string | null }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleInstall = () => {
    setIsLoading(true);
    window.location.href = ROUTES.API_SLACK_INSTALL;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-[520px]">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-tertiary/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
          <IconShieldCheck size={12} />
          Bot Installation Required
        </div>
        <h1 className="font-sans text-2xl font-light text-text-primary md:text-[2rem]">
          Install PulseBoard to your workspace
        </h1>
        <p className="mt-3 font-body text-sm leading-relaxed text-text-secondary">
          To start analyzing conversations, PulseBoard needs to be installed as a bot in your Slack workspace.
          This grants the bot permission to read public and private channel history, view user profiles, and post
          follow-up reminders.
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-bg-tertiary/20 p-5">
        <h3 className="mb-3 font-sans text-sm font-semibold text-text-primary">
          Permissions requested
        </h3>
        <ul className="space-y-2 font-body text-sm text-text-secondary">
          {[
            { scope: "channels:history", desc: "Read messages in public channels the bot is invited to" },
            { scope: "channels:read", desc: "View basic channel information" },
            { scope: "groups:history", desc: "Read messages in private channels the bot is invited to" },
            { scope: "groups:read", desc: "View private channels the bot is invited to" },
            { scope: "users:read", desc: "View user display names and profiles" },
            { scope: "team:read", desc: "View workspace information" },
            { scope: "chat:write", desc: "Send follow-up reminders and notifications" },
            { scope: "im:write", desc: "Send private follow-up reminders via direct message" },
          ].map((item) => (
            <li key={item.scope} className="flex items-start gap-2">
              <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
              <span>
                <span className="font-mono text-[11px] text-text-primary">{item.scope}</span>
                {" — "}
                {item.desc}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-anger/20 bg-anger/8 p-4">
          <IconAlertTriangle size={18} className="mt-0.5 shrink-0 text-anger" />
          <div>
            <p className="font-body text-sm font-medium text-text-primary">Installation failed</p>
            <p className="mt-1 font-body text-sm text-text-secondary">
              {error === "install_failed"
                ? "The bot installation could not be completed. Please try again or contact your Slack workspace admin."
                : `An error occurred: ${error}`}
            </p>
          </div>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleInstall}
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-surface px-6 py-4 font-sans text-[15px] font-semibold text-text-primary shadow-[var(--theme-shadow-raised)] transition-all hover:shadow-[var(--theme-shadow-panel)] disabled:pointer-events-none disabled:opacity-60 md:w-auto"
      >
        {isLoading ? (
          <IconLoader2 size={20} className="animate-spin" />
        ) : (
          <IconBrandSlack size={20} />
        )}
        {isLoading ? "Redirecting to Slack..." : "Install Bot to Workspace"}
      </motion.button>
    </div>
  );
}

export function SetupScreen() {
  const reduce = useReducedMotion();
  const searchParams = useSearchParams();
  const session = useSession();
  const channels = useChannels({ refreshInterval: 5_000 });
  const {
    data: workspaceStatusData,
    error: workspaceStatusError,
    isLoading: workspaceStatusLoading,
    mutate: mutateWorkspaceStatus,
  } = useWorkspaceStatus();

  const [{ error: installError, installed: justInstalled }] = useState(() => {
    return {
      error: searchParams.get("error"),
      installed: searchParams.get("installed") === "true",
    };
  });
  const [discoveryPhase, dispatchDiscovery] = useReducer(discoveryPhaseReducer, "idle");
  const discoveryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggeredDiscovery = useRef(false);

  const workspaceName = session.data?.workspaceName ?? "your Slack workspace";
  const isLoading = session.isLoading || workspaceStatusLoading;
  const isWorkspaceStatusUnavailable = Boolean(workspaceStatusError);
  const botInstalled =
    justInstalled || (!isWorkspaceStatusUnavailable && (workspaceStatusData?.installed ?? false));
  const hasChannels = (channels.data?.length ?? 0) > 0;
  const autoDiscovering = discoveryPhase === "discovering";
  const discoveryDone = discoveryPhase === "complete";
  const tokenRotationNotice = getTokenRotationNotice(
    workspaceStatusData?.tokenRotationStatus,
  );

  useEffect(() => {
    if (!justInstalled) return;
    void mutateWorkspaceStatus();
  }, [justInstalled, mutateWorkspaceStatus]);

  useEffect(() => {
    if (!installError && !justInstalled) return;
    window.history.replaceState({}, "", window.location.pathname);
  }, [installError, justInstalled]);

  // Auto-discover when bot is installed but no channels found yet
  useEffect(() => {
    if (!botInstalled || isLoading) return;
    if (hasChannels) return;
    if (hasTriggeredDiscovery.current) return;
    if (sessionStorage.getItem(DISCOVERY_SESSION_KEY)) return;

    hasTriggeredDiscovery.current = true;
    sessionStorage.setItem(DISCOVERY_SESSION_KEY, Date.now().toString());
    dispatchDiscovery({ type: "start" });

    // Trigger queue-based discovery
    void fetch("/api/channels/sync", { method: "POST" }).catch(() => {});
  }, [botInstalled, hasChannels, isLoading]);

  // Clear session flag when channels are found (allow fresh discovery in new session)
  useEffect(() => {
    if (hasChannels) {
      sessionStorage.removeItem(DISCOVERY_SESSION_KEY);
    }
  }, [hasChannels]);

  // Auto-discovery timeout: show invite guidance after 20s
  useEffect(() => {
    if (!autoDiscovering) return;

    discoveryTimeoutRef.current = setTimeout(() => {
      dispatchDiscovery({ type: "complete" });
    }, 20_000);

    return () => {
      if (discoveryTimeoutRef.current) {
        clearTimeout(discoveryTimeoutRef.current);
        discoveryTimeoutRef.current = null;
      }
    };
  }, [autoDiscovering]);

  // When channels appear during auto-discovery, clear the auto-discovering state
  useEffect(() => {
    if (autoDiscovering && hasChannels) {
      if (discoveryTimeoutRef.current) {
        clearTimeout(discoveryTimeoutRef.current);
        discoveryTimeoutRef.current = null;
      }
      dispatchDiscovery({ type: "stop" });
    }
  }, [autoDiscovering, hasChannels]);

  const summary = useMemo(() => {
    const list = channels.data ?? [];

    return {
      total: list.length,
      ready: list.filter((channel) => channel.status === "ready").length,
      initializing: list.filter((channel) => channel.status === "initializing").length,
      failed: list.filter((channel) => channel.status === "failed" || channel.status === "removed").length,
      pending: list.filter((channel) => channel.status === "pending").length,
    };
  }, [channels.data]);

  useEffect(() => {
    if (session.error) {
      window.location.href = "/connect";
      return;
    }

    if (summary.ready > 0) {
      const timer = window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);

      return () => window.clearTimeout(timer);
    }
  }, [session.error, summary.ready]);

  // Show install section if bot is not installed
  const showInstallSection = !isLoading && !isWorkspaceStatusUnavailable && !botInstalled;

  // Show channel tracking section if bot is installed
  const showChannelSection = !isLoading && !isWorkspaceStatusUnavailable && botInstalled;
  const hasFailures = summary.failed > 0;
  const isWaitingForInvite = showChannelSection && !channels.isLoading && !hasChannels && !autoDiscovering;

  return (
    <div className="w-full max-w-[760px]">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="rounded-[28px] border border-border-subtle bg-bg-secondary/70 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-sm md:p-10"
      >
        <div className="flex flex-col gap-8">
          {isLoading && (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-64 rounded-lg" />
              <Skeleton className="h-4 w-96 rounded-lg" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          )}

          {!isLoading && isWorkspaceStatusUnavailable && (
            <div className="rounded-2xl border border-anger/20 bg-anger/8 p-5">
              <div className="flex items-start gap-3">
                <IconAlertTriangle size={18} className="mt-0.5 shrink-0 text-anger" />
                <div>
                  <p className="font-body text-sm font-medium text-text-primary">
                    Slack workspace status is temporarily unavailable
                  </p>
                  <p className="mt-1 font-body text-sm leading-relaxed text-text-secondary">
                    PulseBoard could not verify whether the bot is installed because the backend did not respond cleanly.
                    This does not mean your workspace was disconnected. Refresh in a moment or confirm the backend is running.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        void mutateWorkspaceStatus();
                        void channels.mutate();
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-border-default px-3 py-1.5 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-tertiary/50"
                    >
                      <IconRefresh size={14} />
                      Retry status check
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = ROUTES.API_SLACK_INSTALL;
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-anger/30 bg-anger/10 px-3 py-1.5 font-mono text-xs text-anger transition-colors hover:bg-anger/20"
                    >
                      <IconBrandSlack size={14} />
                      Reconnect Slack Bot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showInstallSection && <InstallBotSection error={installError} />}

          {showChannelSection && (
            <>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-[480px]">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-tertiary/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
                    <IconSparkles size={12} />
                    Workspace Setup
                  </div>
                  <h1 className="font-sans text-2xl font-light text-text-primary md:text-[2rem]">
                    Preparing {workspaceName}
                  </h1>
                  <p className="mt-3 font-body text-sm leading-relaxed text-text-secondary">
                    This screen reflects live status. As soon as at least one channel is ready, the dashboard opens automatically.
                  </p>
                </div>

                <button
                  onClick={() => void channels.mutate()}
                  className="inline-flex items-center gap-2 self-start rounded-lg border border-border-default px-3 py-2 font-mono text-[11px] text-text-secondary transition-colors hover:bg-bg-tertiary/50"
                >
                  <IconRefresh size={14} />
                  Refresh
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                {[
                  { label: "Tracked", value: summary.total },
                  { label: "Ready", value: summary.ready },
                  { label: "Initializing", value: summary.initializing + summary.pending },
                  { label: "Failed", value: summary.failed },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border-subtle bg-bg-tertiary/30 p-4"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
                      {item.label}
                    </p>
                    <p className="mt-3 font-sans text-2xl font-semibold text-text-primary">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {tokenRotationNotice && (
                <div
                  className={`rounded-2xl border p-4 ${tokenRotationNotice.containerClassName}`}
                >
                  <div className="flex items-start gap-3">
                    <IconAlertTriangle
                      size={18}
                      className={`mt-0.5 shrink-0 ${tokenRotationNotice.iconClassName}`}
                    />
                    <div className="flex-1">
                      <p className="font-body text-sm font-medium text-text-primary">
                        {tokenRotationNotice.title}
                      </p>
                      <p className="mt-1 font-body text-sm leading-relaxed text-text-secondary">
                        {tokenRotationNotice.message}
                      </p>
                      <button
                        onClick={() => {
                          window.location.href = ROUTES.API_SLACK_INSTALL;
                        }}
                        className={`mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${tokenRotationNotice.buttonClassName}`}
                      >
                        <IconBrandSlack size={14} />
                        {tokenRotationNotice.actionLabel}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {summary.ready > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-joy/25 bg-joy/8 p-4">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-joy/15">
                    <IconCheck size={16} className="text-joy" />
                  </div>
                  <p className="font-body text-sm text-text-primary">
                    At least one channel is ready. Redirecting to the dashboard now.
                  </p>
                </div>
              )}

              {autoDiscovering && !hasChannels && <DiscoveryProgress />}

              {discoveryDone && !hasChannels && !autoDiscovering && (
                <InviteBotToChannel onRescan={() => {
                  dispatchDiscovery({ type: "start" });
                  sessionStorage.removeItem(DISCOVERY_SESSION_KEY);
                  void fetch("/api/channels/sync", { method: "POST" }).catch(() => {});
                  void channels.mutate();
                }} />
              )}

              {isWaitingForInvite && !discoveryDone && (
                <SyncChannelsSection onSynced={() => {
                  dispatchDiscovery({ type: "start" });
                  hasTriggeredDiscovery.current = true;
                  void channels.mutate();
                }} />
              )}

              {hasFailures && (
                <div className="flex items-start gap-3 rounded-2xl border border-anger/20 bg-anger/8 p-4">
                  <IconAlertTriangle size={18} className="mt-0.5 shrink-0 text-anger" />
                  <p className="font-body text-sm leading-relaxed text-text-secondary">
                    One or more channels failed to initialize or lost bot access. Re-invite the bot or trigger a manual backfill from the backend if the status does not recover.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-sans text-base font-semibold text-text-primary">
                    Channel Status
                  </h2>
                  {channels.data && channels.data.length > 0 && (
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
                      Live every 5s
                    </p>
                  )}
                </div>

                {channels.isLoading ? (
                  <ChannelListSkeleton />
                ) : channels.error ? (
                  <div className="rounded-xl border border-anger/20 bg-anger/8 p-4 font-body text-sm text-text-secondary">
                    Unable to load channel state. Confirm the backend is running and the app session is valid.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(channels.data ?? []).map((channel) => (
                      <div
                        key={channel.id}
                        className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-bg-tertiary/20 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-mono text-sm text-text-primary flex items-center gap-0.5">
                            <ChannelPrefix type={channel.conversationType} size={12} />{channel.name}
                          </p>
                          <p className="mt-1 font-body text-xs text-text-secondary">
                            {channel.messageCount.toLocaleString()} messages
                            {channel.lastActivity ? ` • last activity ${relativeTime(channel.lastActivity)}` : ""}
                          </p>
                        </div>
                        <StatusBadge status={channel.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
