import type { ReactNode } from "react";
import { Card } from "./Card";

interface PanelProps {
  title: string;
  count?: number;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({
  title,
  count,
  action,
  children,
  className = "",
}: PanelProps) {
  return (
    <Card elevation="flat" padding="default" className={className}>
      <div className="flex justify-between items-center mb-group">
        <div className="flex items-center">
          <h2 className="font-sans text-heading-sm font-semibold text-text-primary">
            {title}
          </h2>
          {count !== undefined && (
            <span className="font-mono text-badge text-text-tertiary ml-element">
              {count}
            </span>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </Card>
  );
}
