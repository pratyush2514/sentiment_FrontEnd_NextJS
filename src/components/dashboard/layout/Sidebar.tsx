"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import { getChannelDotColor } from "@/lib/utils/emotionColor";
import { Tooltip, ChannelPrefix } from "@/components/ui";
import { SyncChannelsButton } from "@/components/dashboard/common/SyncChannelsButton";
import { Logo } from "@/components/primitives";
import { DASHBOARD_NAV_ITEMS } from "./navigation";
import type { ChannelCardData } from "@/lib/types";

interface SidebarProps {
  workspaceName?: string;
  channels?: ChannelCardData[];
  alertCount?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  workspaceName,
  channels = [],
  alertCount = 0,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={[
        "fixed top-0 left-0 z-30 hidden h-full flex-col bg-bg-primary border-r border-border-default transition-[width] duration-200 md:flex",
        collapsed ? "md:w-16" : "md:w-16 lg:w-52",
      ].join(" ")}
    >
      <div className="flex h-14 items-center border-b border-border-default px-4 shrink-0">
        <Logo
          collapsed={collapsed}
          className={collapsed ? "justify-center" : ""}
        />
      </div>

      <div className="flex flex-col gap-0 flex-1 overflow-y-auto py-3">
        <nav className="px-2 space-y-0.5 mb-4">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const active = item.isActive(pathname);
            const Icon = item.icon;
            return (
              <Tooltip
                key={item.label}
                content={item.label}
                side="bottom"
                className="flex w-full"
              >
                <Link
                  href={item.href}
                  className={[
                    "group flex w-full items-center gap-3 rounded-md px-2.5 py-2 transition-colors duration-150",
                    collapsed
                      ? "justify-center"
                      : "md:justify-center lg:justify-start",
                    active
                      ? "bg-accent/8 text-accent"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/40",
                  ].join(" ")}
                >
                  <Icon size={16} className="shrink-0" />
                  <span
                    className={
                      collapsed
                        ? "hidden"
                        : "hidden lg:inline font-body text-xs"
                    }
                  >
                    {item.label}
                  </span>
                </Link>
              </Tooltip>
            );
          })}
        </nav>

        {channels.length > 0 && (
          <div className="px-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-tertiary mb-2 px-0.5">
              <span className={collapsed ? "hidden" : "hidden lg:inline"}>
                Channels
              </span>
            </p>
            <div className="space-y-0.5">
              {channels.slice(0, 8).map((ch) => {
                const dotColor = getChannelDotColor(ch.status, ch.health);
                const isActive = pathname === `/dashboard/channels/${ch.id}`;
                const isSettingUp =
                  ch.status === "initializing" || ch.status === "pending";
                return (
                  <Tooltip
                    key={ch.id}
                    content={
                      isSettingUp ? `${ch.name} (setting up...)` : ch.name
                    }
                    side="bottom"
                    className="flex w-full"
                  >
                    <Link
                      href={`/dashboard/channels/${ch.id}`}
                      className={[
                        "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors duration-150",
                        collapsed
                          ? "justify-center"
                          : "md:justify-center lg:justify-start",
                        isActive
                          ? "bg-bg-tertiary/60 text-text-primary"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/30",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "h-1.5 w-1.5 rounded-full flex-shrink-0",
                          isSettingUp ? "animate-pulse" : "",
                        ].join(" ")}
                        style={{ backgroundColor: dotColor }}
                      />
                      <span
                        className={
                          collapsed
                            ? "hidden"
                            : "hidden lg:inline font-mono text-[11px] truncate flex items-center gap-0.5"
                        }
                      >
                        <ChannelPrefix type={ch.conversationType} size={10} />
                        {ch.name}
                        {isSettingUp && (
                          <span className="ml-1 text-[9px] text-text-tertiary">
                            (setting up...)
                          </span>
                        )}
                      </span>
                    </Link>
                  </Tooltip>
                );
              })}
              <SyncChannelsButton variant="icon" collapsed={collapsed} />
            </div>
          </div>
        )}

        {/* QUEUE section */}
        {alertCount > 0 && (
          <div className="px-3 mt-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-tertiary mb-2 px-0.5">
              <span className={collapsed ? "hidden" : "hidden lg:inline"}>
                Alert
              </span>
            </p>
            <Link
              href="/dashboard/alerts"
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-anger hover:bg-anger/8 transition-colors duration-150"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-anger flex-shrink-0 animate-pulse" />
              <span
                className={
                  collapsed
                    ? "hidden"
                    : "hidden lg:inline font-mono text-[11px]"
                }
              >
                {alertCount} active item{alertCount === 1 ? "" : "s"}
              </span>
            </Link>
          </div>
        )}
      </div>

      <div className="border-t border-border-default px-3 py-3 shrink-0 space-y-2">
        <div
          className={[
            "flex items-center gap-2 px-2.5",
            collapsed ? "justify-center" : "md:justify-center lg:justify-start",
          ].join(" ")}
        >
          <div className="h-5 w-5 rounded bg-accent/10 flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-[9px] font-bold text-accent">
              {(workspaceName ?? "S")[0].toUpperCase()}
            </span>
          </div>
          <span
            className={
              collapsed
                ? "hidden"
                : "hidden lg:block font-mono text-[11px] text-text-tertiary truncate"
            }
          >
            {workspaceName ?? "Slack workspace"}
          </span>
        </div>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={[
              "hidden lg:flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/40 transition-colors duration-150",
              collapsed ? "justify-center" : "justify-start",
            ].join(" ")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Tooltip
              content={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              side="bottom"
            >
              <span className="flex items-center gap-2">
                {collapsed ? (
                  <IconChevronsRight size={14} />
                ) : (
                  <IconChevronsLeft size={14} />
                )}
                <span
                  className={collapsed ? "hidden" : "font-mono text-[10px]"}
                >
                  Collapse
                </span>
              </span>
            </Tooltip>
          </button>
        )}
      </div>
    </aside>
  );
}
