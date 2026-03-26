"use client";

import Link from "next/link";
import { toDisplayErrorMessage } from "@/lib/errors";

export default function ChannelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = toDisplayErrorMessage(
    error,
    "An unexpected error occurred while loading channel data.",
  );

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="font-sans text-lg font-semibold text-text-primary">
        Failed to load channel
      </h2>
      <p className="max-w-md font-mono text-sm text-text-tertiary">
        {message}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg border border-border-subtle bg-bg-secondary px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-tertiary"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-border-subtle bg-bg-secondary px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-tertiary"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
