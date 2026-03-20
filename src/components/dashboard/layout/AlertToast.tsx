"use client";

import { useEffect, useState } from "react";
import { IconAlertTriangle, IconLock, IconX } from "@tabler/icons-react";
import type { ConversationType } from "@/lib/types";

interface Alert {
  id: string;
  message: string;
  channelName?: string;
  conversationType?: ConversationType;
  risk: string;
}

let addAlertFn: ((alert: Alert) => void) | null = null;

export function pushAlert(alert: Omit<Alert, "id">) {
  addAlertFn?.({ ...alert, id: crypto.randomUUID() });
}

export function AlertToastContainer() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    addAlertFn = (alert) => {
      setAlerts((prev) => [...prev.slice(-4), alert]);
    };
    return () => {
      addAlertFn = null;
    };
  }, []);

  const dismiss = (id: string) =>
    setAlerts((prev) => prev.filter((a) => a.id !== id));

  useEffect(() => {
    if (alerts.length === 0) return;
    const timer = setTimeout(() => {
      setAlerts((prev) => prev.slice(1));
    }, 6000);
    return () => clearTimeout(timer);
  }, [alerts]);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col gap-2 max-w-sm">
      {alerts.map((alert) => {
        const tone =
          alert.risk === "high"
            ? {
                border: "border-anger/30",
                icon: "text-anger",
                pill: "bg-anger/10 text-anger",
              }
            : alert.risk === "medium"
              ? {
                  border: "border-warning/30",
                  icon: "text-warning",
                  pill: "bg-warning/10 text-warning",
                }
              : {
                  border: "border-accent/30",
                  icon: "text-accent",
                  pill: "bg-accent/10 text-accent",
                };

        return (
        <div
          key={alert.id}
          className={`flex items-start gap-2.5 rounded-lg border ${tone.border} bg-bg-elevated p-3 shadow-lg animate-[float-up_0.3s_ease-out]`}
          role="alert"
        >
          <IconAlertTriangle
            size={16}
            className={`shrink-0 mt-0.5 ${tone.icon}`}
          />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs font-medium text-text-primary">
              {alert.message}
            </p>
            {alert.channelName && (
              <p className="mt-0.5 inline-flex items-center gap-0.5 font-mono text-[10px] text-text-tertiary">
                {alert.conversationType === "private_channel" ? <IconLock size={8} className="shrink-0" /> : "#"}{alert.channelName}
              </p>
            )}
            <span className={`mt-2 inline-flex rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide ${tone.pill}`}>
              {alert.risk}
            </span>
          </div>
          <button
            onClick={() => dismiss(alert.id)}
            className="shrink-0 text-text-tertiary hover:text-text-secondary transition-colors"
            aria-label="Dismiss"
          >
            <IconX size={14} />
          </button>
        </div>
        );
      })}
    </div>
  );
}
