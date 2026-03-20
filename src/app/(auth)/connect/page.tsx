import { Suspense } from "react";
import { SlackConnectButton } from "@/components/auth/SlackConnectButton";
import { ConnectError } from "@/components/auth/ConnectError";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Get Started — PulseBoard",
};

export default function ConnectPage() {
  return (
    <div className="w-full max-w-[440px]">
      <div className="rounded-2xl border border-border-subtle bg-bg-secondary/60 p-8 backdrop-blur-sm md:p-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-sans text-2xl font-light text-text-primary">
            Get started with PulseBoard
          </h1>
          <p className="mt-3 font-body text-sm leading-relaxed text-text-secondary">
            PulseBoard connects to your Slack workspace to analyze conversations
            and surface emotional dynamics.
          </p>
        </div>

        {/* Error banner (reads ?error= from URL) */}
        <Suspense>
          <ConnectError />
        </Suspense>

        {/* Primary CTA — install bot into a new workspace */}
        <SlackConnectButton
          href={ROUTES.API_SLACK_INSTALL}
          label="Add to Slack"
          loadingLabel="Redirecting to Slack..."
        />

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border-subtle" />
          <span className="font-mono text-[11px] text-text-tertiary">
            Already installed?
          </span>
          <div className="h-px flex-1 bg-border-subtle" />
        </div>

        {/* Secondary CTA — sign in to existing workspace */}
        <SlackConnectButton
          href={ROUTES.API_SLACK_LOGIN}
          label="Sign in with Slack"
          loadingLabel="Signing in..."
          variant="secondary"
          delay={0.3}
        />

        {/* Trust line */}
        <p className="mt-6 text-center font-mono text-[11px] leading-relaxed text-text-tertiary">
          PulseBoard requests Slack bot access for public and private channels it is invited to,
          plus permission to send reminder messages.
          <br />
          Message content and derived analytics are stored server-side to power the dashboard.
        </p>
      </div>
    </div>
  );
}
