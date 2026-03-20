"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect, useCallback } from "react";
import { IconChevronLeft, IconChevronRight, IconMenu2, IconLogout } from "@tabler/icons-react";
import { SSEIndicator } from "./SSEIndicator";
import { ThemeControl } from "@/components/theme/ThemeControl";
import { Tooltip, ChannelPrefix } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import { useSWRConfig } from "swr";

interface TopBarProps {
  channelName?: string;
  isPrivateChannel?: boolean;
  userName?: string | null;
  workspaceName?: string | null;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileNav?: () => void;
}

interface BreadcrumbSegment {
  label: string;
  href?: string;
  dim?: boolean;
  isChannel?: boolean;
  isPrivate?: boolean;
}

function getBreadcrumb(
  pathname: string,
  channelName?: string,
  isPrivateChannel?: boolean,
): BreadcrumbSegment[] {
  if (pathname.startsWith("/dashboard/settings")) {
    return [
      { label: "Dashboard", href: "/dashboard", dim: true },
      { label: "/", dim: true },
      { label: "Settings" },
    ];
  }

  if (pathname.startsWith("/dashboard/alerts")) {
    return [
      { label: "Dashboard", href: "/dashboard", dim: true },
      { label: "/", dim: true },
      { label: "Queue" },
    ];
  }

  const threadMatch = pathname.match(
    /^\/dashboard\/channels\/([^/]+)\/threads\//
  );
  if (threadMatch) {
    const channelId = threadMatch[1];
    const display = channelName ?? channelId;
    return [
      { label: "Dashboard", href: "/dashboard", dim: true },
      { label: "/", dim: true },
      { label: display, href: `/dashboard/channels/${channelId}`, isChannel: true, isPrivate: isPrivateChannel },
      { label: "/", dim: true },
      { label: "Thread" },
    ];
  }

  if (pathname.startsWith("/dashboard/channels/")) {
    const display = channelName ?? "channel";
    return [
      { label: "Dashboard", href: "/dashboard", dim: true },
      { label: "/", dim: true },
      { label: display, isChannel: true, isPrivate: isPrivateChannel },
    ];
  }

  return [{ label: "Dashboard" }];
}

export function TopBar({
  channelName,
  isPrivateChannel,
  userName,
  workspaceName,
  sidebarCollapsed = false,
  onToggleSidebar,
  onOpenMobileNav,
}: TopBarProps) {
  const pathname = usePathname();
  const segments = getBreadcrumb(pathname, channelName, isPrivateChannel);
  const avatarSeed = userName ?? workspaceName ?? "pulseboard-admin";

  const { mutate } = useSWRConfig();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleLogout = useCallback(() => {
    // Clear all SWR cache so stale session data can't be reused
    mutate(() => true, undefined, { revalidate: false });
    // Then submit the logout form
    formRef.current?.submit();
  }, [mutate]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-bg-primary border-b border-border-default px-4 md:px-6 lg:px-8 shrink-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="flex items-center justify-center md:hidden w-8 h-8 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors duration-150"
          aria-label="Open navigation"
        >
          <IconMenu2 size={18} />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-bg-tertiary/50 hover:text-text-primary"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Tooltip content={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} side="bottom">
            <span className="flex items-center justify-center">
              {sidebarCollapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
            </span>
          </Tooltip>
        </button>

        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            {segments.map((segment, index) => (
              <li key={index}>
                {segment.href ? (
                  <Link
                    href={segment.href}
                    className="font-mono text-sm text-text-tertiary hover:text-text-secondary transition-colors flex items-center gap-0.5"
                  >
                    {segment.isChannel && <ChannelPrefix type={segment.isPrivate ? "private_channel" : "public_channel"} size={12} />}
                    {segment.label}
                  </Link>
                ) : (
                  <span
                    className={[
                      "font-mono text-sm flex items-center gap-0.5",
                      segment.dim
                        ? "text-text-tertiary"
                        : "text-text-secondary",
                    ].join(" ")}
                  >
                    {segment.isChannel && <ChannelPrefix type={segment.isPrivate ? "private_channel" : "public_channel"} size={12} />}
                    {segment.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <ThemeControl showLabel />
        <SSEIndicator />
        {/* Avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-accent/40"
            aria-label="User menu"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=0ea5e9&radius=50`}
              alt={userName ?? "Workspace avatar"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full bg-bg-tertiary ring-1 ring-border-default"
            />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border-default bg-bg-primary shadow-lg py-1 z-50">
              {userName && (
                <div className="px-3 py-2 border-b border-border-default">
                  <p className="font-mono text-xs text-text-primary truncate">{userName}</p>
                  {workspaceName && (
                    <p className="font-mono text-[10px] text-text-tertiary truncate">{workspaceName}</p>
                  )}
                </div>
              )}
              <form ref={formRef} action={ROUTES.API_LOGOUT} method="POST">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 font-mono text-xs text-text-secondary hover:text-anger hover:bg-bg-tertiary/50 transition-colors"
                >
                  <IconLogout size={14} />
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
