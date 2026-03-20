"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sidebar } from "@/components/dashboard/layout/Sidebar";
import { TopBar } from "@/components/dashboard/layout/TopBar";
import { MobileNav } from "@/components/dashboard/layout/MobileNav";
import { MobileDrawer } from "@/components/dashboard/layout/MobileDrawer";
import {
  AlertToastContainer,
  pushAlert,
} from "@/components/dashboard/layout/AlertToast";
import { useChannelState, useChannels, useInbox, useSSE, useSession } from "@/lib/hooks";
import { usePathname, useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";

const ALERT_TOAST_TTL_MS = 6 * 60 * 60 * 1000;

function formatAlertMessage(alertType: string): string {
  switch (alertType) {
    case "high_escalation_risk":
      return "High escalation risk detected";
    case "high_confidence_anger":
      return "High-confidence anger detected";
    case "sarcasm_masked_anger":
      return "Sarcasm may be masking frustration";
    case "deteriorating_sentiment":
      return "Thread sentiment is deteriorating";
    case "budget_exceeded":
      return "Daily LLM budget exceeded";
    case "follow_up_due":
      return "A client follow-up is overdue";
    case "follow_up_acknowledged":
      return "A follow-up was acknowledged";
    case "follow_up_escalated":
      return "A follow-up escalated to senior coverage";
    case "follow_up_opened":
      return "A follow-up request was detected";
    case "follow_up_high_priority":
      return "A follow-up needs urgent attention";
    case "leadership_instruction":
      return "Leadership asked for an update";
    case "follow_up_resolved":
      return "A follow-up was resolved";
    case "follow_up_dismissed":
      return "A follow-up reminder was dismissed";
    case "follow_up_snoozed":
      return "A follow-up reminder was snoozed";
    default:
      return "New alert";
  }
}

function buildToastEventKey(
  channelId: string,
  alertType: string,
  changeType: string,
  seriousness: string,
  data: Record<string, unknown>,
): string {
  const identity =
    (typeof data.attentionItemId === "string" && data.attentionItemId) ||
    (typeof data.followUpItemId === "string" && data.followUpItemId) ||
    [
      channelId,
      typeof data.sourceMessageTs === "string" ? data.sourceMessageTs : "none",
      typeof data.threadTs === "string" ? data.threadTs : "none",
      alertType,
    ].join(":");

  return `${identity}:${changeType}:${seriousness}`;
}

function shouldShowToast(
  alertType: string,
  changeType: string,
  seriousness: string,
): boolean {
  switch (alertType) {
    case "follow_up_opened":
      return false;
    case "follow_up_acknowledged":
      return false;
    case "follow_up_escalated":
      return changeType === "escalated";
    case "follow_up_high_priority":
      return changeType === "created" || changeType === "severity_changed" || changeType === "due";
    case "follow_up_due":
      return (changeType === "due" || changeType === "severity_changed") && seriousness !== "low";
    case "follow_up_resolved":
    case "follow_up_dismissed":
    case "follow_up_snoozed":
      return false;
    case "leadership_instruction":
      return changeType === "created";
    case "high_escalation_risk":
    case "high_confidence_anger":
    case "sarcasm_masked_anger":
    case "deteriorating_sentiment":
    case "budget_exceeded":
      return changeType === "created" || changeType === "legacy";
    default:
      return false;
  }
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, error: sessionError, isLoading: sessionLoading } = useSession();
  const { data: channels } = useChannels();
  const { data: inbox } = useInbox({ limit: 120 });
  const alertCount =
    inbox?.filter(
      (item) =>
        item.group !== "acknowledged" &&
        item.group !== "resolved_recently",
    ).length ?? 0;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("pb_sidebar_collapsed") === "true";
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const toastRegistryRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (sessionError && sessionError instanceof ApiError && sessionError.status === 401) {
      router.replace("/connect");
    }
  }, [sessionError, router]);

  useEffect(() => {
    window.localStorage.setItem("pb_sidebar_collapsed", sidebarCollapsed ? "true" : "false");
  }, [sidebarCollapsed]);

  const activeChannelId = useMemo(() => {
    const match = pathname.match(/^\/dashboard\/channels\/([^/]+)/);
    return match?.[1] ?? null;
  }, [pathname]);
  const { data: activeChannelState } = useChannelState(activeChannelId);
  const activeChannelName =
    activeChannelState?.channelName ??
    channels?.find((channel) => channel.id === activeChannelId)?.name;

  useSSE("/api/events/stream", (event) => {
    if (event.type === "alert_triggered") {
      const matchedChannel = channels?.find((channel) => channel.id === event.channelId);
      // Suppress toasts for channels still being backfilled
      if (matchedChannel && matchedChannel.status !== "ready") return;
      const channelName = matchedChannel?.name ?? event.channelId;
      const alertType = (event.data.alertType as string | undefined) ?? "unknown";
      const changeType = (event.data.changeType as string | undefined) ?? "legacy";
      const seriousness = typeof event.data.seriousness === "string" ? event.data.seriousness : "high";

      if (!shouldShowToast(alertType, changeType, seriousness)) {
        return;
      }

      const now = Date.now();
      for (const [key, timestamp] of toastRegistryRef.current.entries()) {
        if (now - timestamp > ALERT_TOAST_TTL_MS) {
          toastRegistryRef.current.delete(key);
        }
      }

      const toastKey = buildToastEventKey(
        event.channelId,
        alertType,
        changeType,
        seriousness,
        event.data,
      );
      if (toastRegistryRef.current.has(toastKey)) {
        return;
      }
      toastRegistryRef.current.set(toastKey, now);

      const summary = typeof event.data.summary === "string" ? event.data.summary : null;
      pushAlert({
        message: summary ?? formatAlertMessage(alertType),
        channelName,
        conversationType: matchedChannel?.conversationType,
        risk: alertType === "follow_up_high_priority" ? "high" : seriousness,
      });
    }
  });

  // Don't render anything while session is being verified or on auth failure
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    if (sessionError && sessionError instanceof ApiError && sessionError.status === 401) {
      return null;
    }

    if (sessionError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-bg-primary px-6">
          <div className="max-w-md rounded-2xl border border-border-subtle bg-bg-secondary/80 p-6 text-center">
            <p className="mb-2 font-sans text-sm font-semibold text-text-primary">
              PulseBoard couldn&apos;t verify your session
            </p>
            <p className="mb-4 font-body text-sm text-text-secondary">
              The app is available, but the session bootstrap failed. Refresh to retry or reconnect if the problem persists.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full border border-border-subtle px-4 py-2 font-mono text-xs text-text-primary transition hover:border-border-hover hover:bg-bg-primary"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar
        workspaceName={session?.workspaceName}
        channels={channels ?? []}
        alertCount={alertCount}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />
      <div className={`flex flex-1 flex-col md:ml-16 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-52"}`}>
        <TopBar
          channelName={activeChannelName}
          isPrivateChannel={
            (activeChannelState?.conversationType ?? channels?.find((c) => c.id === activeChannelId)?.conversationType) === "private_channel"
          }
          userName={session?.userName}
          workspaceName={session?.workspaceName}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 px-4 py-5 md:px-6 lg:px-7 pb-20 md:pb-6">
          <div className="mx-auto max-w-[1280px]">{children}</div>
        </main>
      </div>
      <MobileDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        workspaceName={session?.workspaceName}
        channels={channels ?? []}
        alertCount={alertCount}
      />
      <MobileNav />
      <AlertToastContainer />
    </div>
  );
}
