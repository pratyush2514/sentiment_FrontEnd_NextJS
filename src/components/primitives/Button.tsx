"use client";

import React from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "warning";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  as?: "button" | "a";
  href?: string;
}

const variantClassMap: Record<string, string> = {
  primary: "bg-accent text-text-inverse hover:bg-accent-hover",
  secondary:
    "border border-border-subtle bg-transparent text-text-secondary hover:bg-bg-tertiary/40 hover:text-text-primary",
  ghost: "text-text-secondary hover:bg-bg-tertiary/40 hover:text-text-primary",
  danger: "border border-error/30 text-error hover:bg-error/10",
  success: "border border-positive/30 text-positive hover:bg-positive/10",
  warning: "border border-warning/30 text-warning hover:bg-warning/10",
};

const sizeClassMap: Record<string, string> = {
  sm: "gap-1 rounded-radius-sm px-2.5 py-1.5 text-badge",
  md: "gap-1.5 rounded-radius-md px-3 py-2 text-body-sm",
};

function Spinner() {
  return (
    <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
  );
}

export default function Button({
  variant = "secondary",
  size = "sm",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  children,
  onClick,
  className = "",
  as,
  href,
}: ButtonProps) {
  const classes = [
    "inline-flex items-center font-mono transition-colors duration-fast disabled:opacity-60 disabled:cursor-not-allowed",
    sizeClassMap[size],
    variantClassMap[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading && <Spinner />}
      {!loading && icon && iconPosition === "left" && icon}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
    </>
  );

  if (as === "a" && href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {content}
    </button>
  );
}

export type { ButtonProps };
