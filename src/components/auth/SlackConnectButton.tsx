"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { IconBrandSlack, IconLoader2 } from "@tabler/icons-react";
import { ROUTES } from "@/lib/constants";

interface SlackConnectButtonProps {
  href?: string;
  label?: string;
  loadingLabel?: string;
  variant?: "primary" | "secondary";
  delay?: number;
}

export function SlackConnectButton({
  href = ROUTES.API_SLACK_LOGIN,
  label = "Connect with Slack",
  loadingLabel = "Connecting...",
  variant = "primary",
  delay = 0.2,
}: SlackConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const reduce = useReducedMotion();

  const handleConnect = () => {
    setIsLoading(true);
    window.location.href = href;
  };

  const isPrimary = variant === "primary";

  return (
    <motion.button
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      onClick={handleConnect}
      disabled={isLoading}
      className={
        isPrimary
          ? "inline-flex w-full items-center justify-center gap-3 rounded-lg bg-surface px-6 py-3.5 font-sans text-[15px] font-semibold text-text-primary shadow-[var(--theme-shadow-raised)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--theme-shadow-panel)] disabled:pointer-events-none disabled:opacity-60"
          : "inline-flex w-full items-center justify-center gap-3 rounded-lg border border-border-subtle bg-transparent px-6 py-3 font-sans text-[14px] font-medium text-text-secondary transition-all duration-150 hover:bg-bg-secondary hover:text-text-primary disabled:pointer-events-none disabled:opacity-60"
      }
    >
      {isLoading ? (
        <IconLoader2 size={isPrimary ? 20 : 18} className="animate-spin" />
      ) : (
        <IconBrandSlack size={isPrimary ? 20 : 18} />
      )}
      {isLoading ? loadingLabel : label}
    </motion.button>
  );
}
