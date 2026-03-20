"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";

interface TooltipProps {
  /** Text shown in the tooltip */
  content: string;
  children: ReactNode;
  /** Preferred placement — auto-flips if clipped */
  side?: "top" | "bottom";
  className?: string;
}

export function Tooltip({ content, children, side = "top", className = "" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);

  return (
    <span
      ref={ref}
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          ref={tipRef}
          role="tooltip"
          className={[
            "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 w-max max-w-[220px] rounded-md px-2 py-1",
            "bg-bg-primary/95 text-text-primary shadow-lg ring-1 ring-border-subtle/60 backdrop-blur-sm",
            "font-mono text-[10px] leading-tight",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
          ].join(" ")}
        >
          {content}
          {/* Arrow */}
          <span
            className={[
              "absolute left-1/2 -translate-x-1/2 border-[4px] border-transparent",
              side === "top"
                ? "top-full border-t-bg-primary/95"
                : "bottom-full border-b-bg-primary/95",
            ].join(" ")}
          />
        </span>
      )}
    </span>
  );
}
