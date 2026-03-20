"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconCheck,
  IconDeviceDesktop,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { useTheme } from "./ThemeProvider";
import { Tooltip } from "@/components/ui";
import type { ThemePreference } from "@/lib/theme";

interface ThemeControlProps {
  align?: "left" | "right";
  showLabel?: boolean;
  className?: string;
}

const OPTIONS: Array<{
  preference: ThemePreference;
  label: string;
  description: string;
  icon: typeof IconSun;
}> = [
  {
    preference: "light",
    label: "Light",
    description: "Bright, calm workspace contrast",
    icon: IconSun,
  },
  {
    preference: "dark",
    label: "Dark",
    description: "Low-glare focus mode",
    icon: IconMoon,
  },
  {
    preference: "system",
    label: "System",
    description: "Match your device appearance",
    icon: IconDeviceDesktop,
  },
];

function ThemeGlyph({
  preference,
  size = 16,
}: {
  preference: ThemePreference;
  size?: number;
}) {
  if (preference === "system") {
    return <IconDeviceDesktop size={size} />;
  }

  if (preference === "dark") {
    return <IconMoon size={size} />;
  }

  return <IconSun size={size} />;
}

export function ThemeControl({
  align = "right",
  showLabel = false,
  className = "",
}: ThemeControlProps) {
  const { themePreference, isHydrated, setThemePreference } = useTheme();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const displayedPreference = isHydrated ? themePreference : "system";

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const activeLabel = useMemo(() => {
    const option = OPTIONS.find(
      (entry) => entry.preference === displayedPreference,
    );
    return option?.label ?? "Theme";
  }, [displayedPreference]);

  return (
    <div className={`relative ${className}`} ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-8 items-center gap-2 rounded-lg border border-border-default bg-bg-secondary/60 px-2.5 font-mono text-[11px] text-text-secondary transition-colors duration-150 hover:border-border-hover hover:bg-bg-tertiary/60 hover:text-text-primary"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Choose theme"
      >
        <Tooltip content={`Theme: ${activeLabel}`} side="bottom">
          <span className="flex items-center gap-2">
            <ThemeGlyph preference={displayedPreference} size={14} />
            {showLabel ? (
              <span className="hidden sm:inline">{activeLabel}</span>
            ) : null}
          </span>
        </Tooltip>
      </button>

      {open ? (
        <div
          className={[
            "absolute top-full z-50 mt-2 w-60 rounded-xl border border-border-default bg-bg-primary/95 p-1.5 shadow-xl backdrop-blur-xl",
            align === "left" ? "left-0" : "right-0",
          ].join(" ")}
          role="menu"
          aria-label="Theme options"
        >
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = displayedPreference === option.preference;

            return (
              <button
                key={option.preference}
                type="button"
                onClick={() => {
                  setThemePreference(option.preference);
                  setOpen(false);
                }}
                className={[
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors duration-150",
                  isActive
                    ? "bg-accent/10 text-text-primary"
                    : "text-text-secondary hover:bg-bg-tertiary/60 hover:text-text-primary",
                ].join(" ")}
                role="menuitemradio"
                aria-checked={isActive}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      isActive
                        ? "bg-accent/12 text-accent"
                        : "bg-bg-secondary/80 text-text-tertiary",
                    ].join(" ")}
                  >
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-sans text-sm font-medium">
                      {option.label}
                    </span>
                    <span className="block font-body text-xs text-text-tertiary">
                      {option.description}
                    </span>
                  </span>
                </span>
                {isActive ? (
                  <IconCheck size={14} className="text-accent" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
