"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="font-sans text-lg font-semibold text-text-primary">
        Something went wrong
      </h2>
      <p className="max-w-md font-mono text-sm text-text-tertiary">
        {error.message || "An unexpected error occurred while loading the dashboard."}
      </p>
      <button
        onClick={reset}
        className="rounded-lg border border-border-subtle bg-bg-secondary px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-tertiary"
      >
        Try again
      </button>
    </div>
  );
}
