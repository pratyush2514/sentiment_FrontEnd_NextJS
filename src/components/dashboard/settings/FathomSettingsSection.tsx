"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { IconCopy, IconCheck, IconPlugConnected, IconPlugConnectedX, IconTrash, IconPlus, IconVideo } from "@tabler/icons-react";
import Button from "@/components/primitives/Button";
import { Skeleton } from "@/components/ui";
import { toDisplayErrorMessage } from "@/lib/errors";
import {
  useFathomConnection,
  useMeetingChannelLinks,
  useChannels,
  connectFathom,
  disconnectFathom,
  updateFathomDefaultChannel,
  createMeetingChannelLink,
  deleteMeetingChannelLink,
} from "@/lib/hooks";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-radius-sm border border-border-subtle/70 px-2 py-1 font-mono text-[10px] text-text-secondary transition-colors hover:bg-bg-tertiary/40 hover:text-text-primary"
    >
      {copied ? <IconCheck size={11} /> : <IconCopy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

interface AddRuleFormProps {
  onAdd: (channelId: string, pattern: string) => Promise<void>;
  onCancel: () => void;
}

function AddRuleForm({ onAdd, onCancel }: AddRuleFormProps) {
  const { data: channelsData } = useChannels();
  const channels = channelsData ?? [];

  const [channelId, setChannelId] = useState("");
  const [pattern, setPattern] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!channelId) { setError("Select a channel"); return; }
    setSaving(true);
    setError(null);
    try {
      await onAdd(channelId, pattern);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add rule");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="mt-3 rounded-radius-md border border-border-default bg-bg-primary/60 p-4 space-y-3"
    >
      <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary">New channel rule</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="font-mono text-[10px] text-text-secondary">Channel</span>
          <select
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            className="w-full rounded-radius-sm border border-border-default bg-bg-primary px-3 py-1.5 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
          >
            <option value="">Select channel…</option>
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id}>
                #{ch.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="font-mono text-[10px] text-text-secondary">Domain / title pattern (optional)</span>
          <input
            type="text"
            placeholder="e.g. acmecorp.com or sprint-planning"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="w-full rounded-radius-sm border border-border-default bg-bg-primary px-3 py-1.5 font-body text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </label>
      </div>

      {error && (
        <p className="font-mono text-[10px] text-error">{error}</p>
      )}

      <div className="flex items-center gap-element">
        <Button variant="primary" size="sm" loading={saving} onClick={handleSubmit}>
          Add rule
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function FathomSettingsSection() {
  const { mutate } = useSWRConfig();
  const { data: connectionData, isLoading: connectionLoading } = useFathomConnection();
  const { data: linksData, isLoading: linksLoading } = useMeetingChannelLinks();
  const { data: channelsData } = useChannels();

  const connection = connectionData;
  const isConnected = connection?.connected ?? false;
  const links = linksData?.links ?? [];
  const channels = channelsData ?? [];

  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

  function channelName(channelId: string) {
    return channels.find((c) => c.id === channelId)?.name ?? channelId;
  }

  async function handleConnect() {
    if (!apiKey.trim()) return;
    setConnecting(true);
    setConnectionError(null);
    try {
      const nextConnection = await connectFathom(apiKey.trim());
      await mutate(
        "/api/fathom/connection",
        (current: unknown) =>
          current && typeof current === "object"
            ? {
                ...(current as Record<string, unknown>),
                connected: true,
                webhookUrl: nextConnection.webhookUrl ?? null,
                historicalSync: nextConnection.historicalSync ?? null,
              }
            : current,
        {
          populateCache: true,
          revalidate: false,
        },
      );
      void mutate("/api/fathom/connection");
      setApiKey("");
    } catch (err) {
      setConnectionError(
        toDisplayErrorMessage(
          err,
          "Couldn’t connect Fathom right now. Please try again.",
        ),
      );
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    setConnectionError(null);
    try {
      await disconnectFathom();
      await mutate(
        "/api/fathom/connection",
        (current: unknown) =>
          current && typeof current === "object"
            ? {
                ...(current as Record<string, unknown>),
                connected: false,
                status: "revoked",
                webhookConfigured: false,
                webhookUrl: null,
                historicalSync: null,
              }
            : { connected: false },
        {
          populateCache: true,
          revalidate: false,
        },
      );
      void mutate("/api/fathom/connection");
    } catch (err) {
      setConnectionError(
        toDisplayErrorMessage(
          err,
          "Couldn’t disconnect Fathom right now. Please try again.",
        ),
      );
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleAddRule(channelId: string, pattern: string) {
    await createMeetingChannelLink({
      channel_id: channelId,
      domain_pattern: pattern || undefined,
      title_pattern: pattern || undefined,
    });
    await mutate("/api/meetings/channel-links");
    setShowAddRule(false);
  }

  async function handleDeleteRule(linkId: string) {
    setDeletingLinkId(linkId);
    try {
      await deleteMeetingChannelLink(linkId);
      await mutate("/api/meetings/channel-links");
    } finally {
      setDeletingLinkId(null);
    }
  }

  return (
    <section id="fathom" className="rounded-2xl border border-border-subtle bg-bg-secondary/55 p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-accent/10 p-2 text-accent">
          <IconVideo size={16} />
        </div>
        <div>
          <h2 className="font-sans text-base font-semibold text-text-primary">
            Meeting Intelligence (Fathom)
          </h2>
          <p className="mt-1 font-body text-sm leading-relaxed text-text-secondary">
            Connect your Fathom account to automatically extract action items, decisions, and commitments from recorded meetings and post digests to Slack channels.
          </p>
        </div>
      </div>

      {connectionLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 rounded-radius-md" />
          <Skeleton className="h-10 rounded-radius-md w-2/3" />
        </div>
      ) : isConnected ? (
        /* ---- Connected state ---- */
        <div className="space-y-4">
          {connectionError && (
            <p className="font-mono text-[10px] text-error">{connectionError}</p>
          )}
          {/* Status banner */}
          <div className="flex items-center justify-between gap-group rounded-radius-md border border-positive/25 bg-positive/8 px-4 py-3">
            <div className="flex items-center gap-element">
              <IconPlugConnected size={14} className="text-positive flex-shrink-0" />
              <span className="font-mono text-body-sm text-positive font-medium">Connected</span>
              {connection?.fathomUserEmail && (
                <span className="font-mono text-badge text-text-secondary">
                  {connection.fathomUserEmail}
                </span>
              )}
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={<IconPlugConnectedX size={12} />}
              loading={disconnecting}
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>

          {/* Webhook URL */}
          {connection?.webhookUrl && (
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary">
                Webhook URL — paste this into Fathom &rarr; Settings &rarr; Webhooks
              </p>
              <div className="flex items-center gap-element rounded-radius-sm border border-border-subtle bg-bg-tertiary/40 px-3 py-2">
                <code className="flex-1 truncate font-mono text-[11px] text-text-secondary">
                  {connection.webhookUrl}
                </code>
                <CopyButton text={connection.webhookUrl} />
              </div>
            </div>
          )}

          {/* Default fallback channel */}
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary">
              Default channel for unmatched meetings
            </p>
            <p className="font-body text-xs text-text-tertiary leading-relaxed">
              When a meeting doesn&apos;t match any rule or channel name, post the digest here.
            </p>
            <select
              value={connection?.defaultChannelId ?? ""}
              onChange={async (e) => {
                const val = e.target.value || null;
                setConnectionError(null);
                try {
                  await updateFathomDefaultChannel(val);
                  await mutate(
                    "/api/fathom/connection",
                    (current: unknown) =>
                      current && typeof current === "object"
                        ? {
                            ...(current as Record<string, unknown>),
                            defaultChannelId: val,
                          }
                        : current,
                    {
                      populateCache: true,
                      revalidate: false,
                    },
                  );
                  void mutate("/api/fathom/connection");
                } catch {
                  setConnectionError(
                    "Couldn’t update the default channel. Please try again.",
                  );
                  void mutate("/api/fathom/connection");
                }
              }}
              className="w-full max-w-xs rounded-radius-sm border border-border-default bg-bg-primary px-3 py-1.5 font-body text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
            >
              <option value="">None (skip unmatched meetings)</option>
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  #{ch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Channel mapping rules */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-wide text-text-tertiary">
                Channel mapping rules
              </p>
              {!showAddRule && (
                <button
                  type="button"
                  onClick={() => setShowAddRule(true)}
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-accent hover:text-accent-hover transition-colors"
                >
                  <IconPlus size={11} />
                  Add rule
                </button>
              )}
            </div>

            {linksLoading ? (
              <Skeleton className="h-16 rounded-radius-md" />
            ) : links.length === 0 && !showAddRule ? (
              <p className="rounded-radius-md border border-border-subtle bg-bg-secondary/40 px-4 py-3 font-body text-sm text-text-tertiary">
                No rules yet. Add a rule to route meetings to Slack channels automatically.
              </p>
            ) : (
              <div className="divide-y divide-border-subtle rounded-radius-md border border-border-subtle overflow-hidden">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between gap-group px-4 py-2.5"
                  >
                    <div className="min-w-0 flex items-center gap-element">
                      <span className="font-mono text-body-sm text-text-primary">
                        #{channelName(link.channel_id)}
                      </span>
                      {(link.domain_pattern || link.title_pattern) && (
                        <span className="font-mono text-badge text-text-tertiary truncate">
                          {link.domain_pattern ?? link.title_pattern}
                        </span>
                      )}
                      {!link.enabled && (
                        <span className="rounded-radius-full border border-border-subtle px-1.5 py-0.5 font-mono text-[9px] text-text-tertiary">
                          disabled
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(link.id)}
                      disabled={deletingLinkId === link.id}
                      className="flex-shrink-0 p-1 text-text-tertiary hover:text-error transition-colors disabled:opacity-50"
                      aria-label="Remove rule"
                    >
                      <IconTrash size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAddRule && (
              <AddRuleForm
                onAdd={handleAddRule}
                onCancel={() => setShowAddRule(false)}
              />
            )}
          </div>
        </div>
      ) : (
        /* ---- Disconnected state ---- */
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wide text-text-tertiary">
              Fathom API Key
            </label>
            <div className="flex items-center gap-element">
              <input
                type="password"
                placeholder="fathom_…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { void handleConnect(); } }}
                className="flex-1 rounded-radius-sm border border-border-default bg-bg-primary px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
              <Button
                variant="primary"
                size="md"
                icon={<IconPlugConnected size={14} />}
                loading={connecting}
                disabled={!apiKey.trim()}
                onClick={handleConnect}
              >
                Connect
              </Button>
            </div>
            <p className="font-body text-xs text-text-tertiary leading-relaxed">
              Find your API key in Fathom &rarr; Settings &rarr; Integrations &rarr; API.
            </p>
          </div>
          {connectionError && (
            <p className="font-mono text-[10px] text-error">{connectionError}</p>
          )}
        </div>
      )}
    </section>
  );
}
