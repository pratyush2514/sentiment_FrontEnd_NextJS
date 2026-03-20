import type { ReactNode } from "react";

const gapMap = {
  tight: "gap-tight",
  element: "gap-element",
  group: "gap-group",
  card: "gap-card",
  panel: "gap-panel",
  section: "gap-section",
} as const;

interface StackProps {
  gap?: "tight" | "element" | "group" | "card" | "panel" | "section";
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "ul" | "article";
}

export function Stack({
  gap = "group",
  children,
  className = "",
  as: Tag = "div",
}: StackProps) {
  return (
    <Tag className={`flex flex-col ${gapMap[gap]} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
