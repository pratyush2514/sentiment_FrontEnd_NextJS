import React from "react";

interface FilterBarProps {
  label?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function FilterBar({
  label,
  icon,
  children,
  className = "",
}: FilterBarProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-tight ${className}`.trim()}
    >
      {label && (
        <span className="inline-flex items-center gap-tight rounded-radius-full bg-bg-tertiary/60 px-2.5 py-1 font-mono text-micro uppercase tracking-widest text-text-tertiary">
          {icon}
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

export type { FilterBarProps };
