import type { ReactNode } from "react";

const gapMap = {
  tight: "gap-tight",
  element: "gap-element",
  group: "gap-group",
} as const;

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  baseline: "items-baseline",
} as const;

interface ClusterProps {
  gap?: "tight" | "element" | "group";
  align?: "start" | "center" | "end" | "baseline";
  wrap?: boolean;
  children: ReactNode;
  className?: string;
}

export function Cluster({
  gap = "element",
  align = "center",
  wrap = true,
  children,
  className = "",
}: ClusterProps) {
  return (
    <div
      className={`flex ${wrap ? "flex-wrap" : "flex-nowrap"} ${alignMap[align]} ${gapMap[gap]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
