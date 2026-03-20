import type { ReactNode } from "react";

const elevationMap = {
  flat: "border-border-subtle bg-bg-secondary/55",
  raised: "border-border-subtle bg-bg-secondary/55 shadow-raised",
  panel: "border-border-default bg-bg-secondary/80 shadow-panel",
} as const;

const paddingMap = {
  none: "",
  compact: "p-card",
  default: "p-panel",
  spacious: "p-section",
} as const;

interface CardProps {
  elevation?: "flat" | "raised" | "panel";
  padding?: "none" | "compact" | "default" | "spacious";
  interactive?: boolean;
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section";
}

export function Card({
  elevation = "flat",
  padding = "default",
  interactive = false,
  children,
  className = "",
  as: Tag = "div",
}: CardProps) {
  const interactiveClasses = interactive
    ? "transition-colors duration-fast hover:border-border-hover cursor-pointer"
    : "";

  return (
    <Tag
      className={`rounded-radius-lg border ${elevationMap[elevation]} ${paddingMap[padding]} ${interactiveClasses} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
