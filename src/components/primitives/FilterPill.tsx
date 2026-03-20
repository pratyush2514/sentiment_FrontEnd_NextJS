"use client";

import React from "react";

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}

export default function FilterPill({
  label,
  active,
  onClick,
  className = "",
}: FilterPillProps) {
  const classes = [
    "rounded-radius-full px-2.5 py-1 font-mono text-badge transition-colors duration-fast",
    active
      ? "bg-accent/12 text-accent"
      : "text-text-tertiary hover:bg-bg-tertiary/40 hover:text-text-secondary",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={classes} onClick={onClick} aria-pressed={active}>
      {label}
    </button>
  );
}

export type { FilterPillProps };
