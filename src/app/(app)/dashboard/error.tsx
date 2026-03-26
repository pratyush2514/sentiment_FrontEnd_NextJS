"use client";

import { toDisplayErrorMessage } from "@/lib/errors";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = toDisplayErrorMessage(
    error,
    "An unexpected error occurred while loading the dashboard.",
  );

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="font-sans text-lg font-semibold text-text-primary">
        Something went wrong
      </h2>
      <p className="max-w-md font-mono text-sm text-text-tertiary">
        {message}
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
