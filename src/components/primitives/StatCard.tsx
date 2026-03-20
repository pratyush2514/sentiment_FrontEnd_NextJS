"use client";

import { Skeleton } from "@/components/ui";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>;
  iconColor: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  loading = false,
}: StatCardProps) {
  return (
    <div className="relative bg-bg-primary px-5 py-4 flex flex-col gap-group">
      <div className="flex items-center justify-between">
        <span className="font-mono text-badge uppercase tracking-wider text-text-tertiary leading-none">
          {label}
        </span>
        <div
          className="flex h-5 w-5 items-center justify-center rounded"
          style={{
            backgroundColor: `color-mix(in srgb, ${iconColor} 16%, transparent)`,
          }}
        >
          <Icon size={11} style={{ color: iconColor }} />
        </div>
      </div>
      <div className="flex items-baseline gap-element">
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <span className="font-sans text-metric font-black tracking-tight text-text-primary leading-none">
            {value}
          </span>
        )}
      </div>
      <span
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{
          background: `linear-gradient(to right, transparent, ${iconColor}, transparent)`,
        }}
      />
    </div>
  );
}
