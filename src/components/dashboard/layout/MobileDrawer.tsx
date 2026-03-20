"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getChannelDotColor } from "@/lib/utils/emotionColor";
import { ChannelPrefix } from "@/components/ui";
import { Drawer, Logo } from "@/components/primitives";
import { DASHBOARD_NAV_ITEMS } from "./navigation";
import type { ChannelCardData } from "@/lib/types";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  workspaceName?: string | null;
  channels: ChannelCardData[];
  alertCount: number;
}

export function MobileDrawer({
  open,
  onClose,
  workspaceName,
  channels,
  alertCount,
}: MobileDrawerProps) {
  const pathname = usePathname();

  return (
    <Drawer open={open} onClose={onClose} title="Navigation">
      <div className="space-y-5 px-4 py-4">
        <Logo className="w-full" />

        <nav className="space-y-1" aria-label="Dashboard navigation">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.isActive(pathname);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={[
                  "flex min-h-11 items-center gap-3 rounded-radius-md px-3 py-2 font-body text-body-sm transition-colors",
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-bg-tertiary/50 hover:text-text-primary",
                ].join(" ")}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.label === "Queue" && alertCount > 0 ? (
                  <span className="ml-auto rounded-radius-full bg-anger/12 px-2 py-1 font-mono text-badge text-anger">
                    {alertCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {channels.length > 0 ? (
          <section className="space-y-2">
            <p className="font-mono text-micro uppercase tracking-widest text-text-tertiary">
              Channels
            </p>
            <div className="space-y-1">
              {channels.slice(0, 10).map((channel) => {
                const active = pathname === `/dashboard/channels/${channel.id}`;
                const dotColor = getChannelDotColor(channel.status, channel.health);
                const isSettingUp =
                  channel.status === "initializing" || channel.status === "pending";

                return (
                  <Link
                    key={channel.id}
                    href={`/dashboard/channels/${channel.id}`}
                    onClick={onClose}
                    className={[
                      "flex min-h-11 items-center gap-2 rounded-radius-md px-3 py-2 transition-colors",
                      active
                        ? "bg-bg-tertiary/70 text-text-primary"
                        : "text-text-secondary hover:bg-bg-tertiary/40 hover:text-text-primary",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        isSettingUp ? "animate-pulse" : "",
                      ].join(" ")}
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="flex min-w-0 items-center gap-1 truncate font-mono text-body-sm">
                      <ChannelPrefix type={channel.conversationType} size={11} />
                      <span className="truncate">{channel.name}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <div className="border-t border-border-subtle pt-4">
          <p className="font-mono text-badge text-text-tertiary">
            {workspaceName ?? "Slack workspace"}
          </p>
        </div>
      </div>
    </Drawer>
  );
}
