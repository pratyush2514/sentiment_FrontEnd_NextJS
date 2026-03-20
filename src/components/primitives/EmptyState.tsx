import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-radius-lg border border-border-subtle bg-bg-secondary/45 px-6 py-10 text-center ${className}`.trim()}
    >
      {icon ? (
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-radius-full border border-border-subtle bg-bg-primary/70 text-text-tertiary">
          {icon}
        </div>
      ) : null}
      <h2 className="font-sans text-heading font-semibold text-text-primary">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-xl font-body text-body-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export type { EmptyStateProps };
