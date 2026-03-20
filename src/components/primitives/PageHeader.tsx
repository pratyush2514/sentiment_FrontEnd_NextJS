import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  eyebrow,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-group lg:flex-row lg:items-end lg:justify-between ${className}`.trim()}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="font-mono text-micro uppercase tracking-widest text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-sans text-[1.375rem] font-black tracking-tight text-text-primary md:text-[1.5rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 font-body text-body text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export type { PageHeaderProps };
