interface BadgeProps {
  label: string;
  color: string;
  dot?: boolean;
  dotAnimated?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  label,
  color,
  dot = false,
  dotAnimated = false,
  size = "sm",
  className = "",
}: BadgeProps) {
  const sizeClasses =
    size === "md"
      ? "px-2 py-1 text-body-sm gap-1.5"
      : "px-1.5 py-0.5 text-badge gap-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-medium capitalize ${sizeClasses} ${className}`}
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
      }}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full${dotAnimated ? " animate-[pulse-dot_2s_infinite]" : ""}`}
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </span>
  );
}
