import type { ReactNode, CSSProperties } from "react";

const gapMap = {
  tight: "gap-tight",
  element: "gap-element",
  group: "gap-group",
  card: "gap-card",
} as const;

interface GridProps {
  cols?: { sm?: number; md?: number; lg?: number };
  gap?: "tight" | "element" | "group" | "card";
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Grid({
  cols,
  gap = "group",
  children,
  className = "",
  style,
}: GridProps) {
  const colClasses = cols
    ? [
        cols.sm ? `sm:grid-cols-${cols.sm}` : "",
        cols.md ? `md:grid-cols-${cols.md}` : "",
        cols.lg ? `lg:grid-cols-${cols.lg}` : "",
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <div
      className={`grid ${gapMap[gap]} ${colClasses} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
