"use client";

import {
  useEffect,
  useId,
  type ReactNode,
} from "react";
import { IconX } from "@tabler/icons-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "left" | "right";
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "left",
  className = "",
}: DrawerProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-overlay/80 backdrop-blur-sm"
        aria-label="Close navigation"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          "absolute top-0 h-full w-[min(88vw,22rem)] border-border-default bg-bg-primary shadow-panel",
          side === "left"
            ? "left-0 border-r"
            : "right-0 border-l",
          className,
        ].join(" ")}
      >
        <div className="flex h-14 items-center justify-between border-b border-border-default px-4">
          <h2
            id={titleId}
            className="font-sans text-heading-sm font-semibold text-text-primary"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-radius-md text-text-secondary transition-colors hover:bg-bg-tertiary/50 hover:text-text-primary"
            aria-label="Close navigation"
          >
            <IconX size={18} />
          </button>
        </div>
        <div className="h-[calc(100%-3.5rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export type { DrawerProps };
