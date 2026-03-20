interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`rounded bg-bg-tertiary/60 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent 0%, var(--theme-skeleton-highlight) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}
