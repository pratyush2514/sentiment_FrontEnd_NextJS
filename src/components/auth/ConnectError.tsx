"use client";

import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_state: "Something went wrong. Please try again.",
  auth_failed: "We couldn't connect to your Slack workspace. Please try again.",
  missing_workspace: "Your Slack login didn't include workspace information. Please try again.",
  token_exchange_failed: "Slack authorization failed. Please try again.",
  install_failed: "Bot installation failed. Please try again.",
  deprecated_auth_callback: "That Slack callback is no longer used. Please restart the Slack connect flow.",
  mock_auth_disabled: "Mock Slack auth is disabled outside local development.",
  workspace_status_unavailable: "Workspace status is temporarily unavailable. Please try again in a moment.",
};

export function ConnectError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error || !ERROR_MESSAGES[error]) return null;

  return (
    <div className="mb-6 rounded-lg border border-anger/20 bg-anger/5 px-4 py-3">
      <p className="text-center font-body text-sm text-text-secondary">
        {ERROR_MESSAGES[error]}
      </p>
    </div>
  );
}
