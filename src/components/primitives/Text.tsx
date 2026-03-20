import React from "react";

type TextVariant =
  | "micro"
  | "badge"
  | "caption"
  | "body-sm"
  | "body"
  | "heading-sm"
  | "heading"
  | "metric";

type TextFont = "sans" | "body" | "mono";

type TextColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "error"
  | "success"
  | "warning"
  | "inherit";

interface TextProps {
  variant?: TextVariant;
  font?: TextFont;
  color?: TextColor;
  weight?: "normal" | "medium" | "semibold" | "bold" | "black";
  uppercase?: boolean;
  truncate?: boolean;
  children: React.ReactNode;
  as?: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "label" | "div";
  className?: string;
}

const variantSizeMap: Record<TextVariant, string> = {
  micro: "text-micro",
  badge: "text-badge",
  caption: "text-caption",
  "body-sm": "text-body-sm",
  body: "text-body",
  "heading-sm": "text-heading-sm",
  heading: "text-heading",
  metric: "text-metric",
};

const defaultFontMap: Record<TextVariant, TextFont> = {
  micro: "mono",
  badge: "mono",
  caption: "mono",
  "body-sm": "body",
  body: "body",
  "heading-sm": "sans",
  heading: "sans",
  metric: "sans",
};

const fontClassMap: Record<TextFont, string> = {
  sans: "font-sans",
  body: "font-body",
  mono: "font-mono",
};

const colorClassMap: Record<TextColor, string> = {
  primary: "text-text-primary",
  secondary: "text-text-secondary",
  tertiary: "text-text-tertiary",
  accent: "text-accent",
  error: "text-error",
  success: "text-positive",
  warning: "text-warning",
  inherit: "",
};

const weightClassMap: Record<string, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  black: "font-black",
};

const defaultWeightMap: Record<TextVariant, string> = {
  micro: "normal",
  badge: "normal",
  caption: "normal",
  "body-sm": "normal",
  body: "normal",
  "heading-sm": "semibold",
  heading: "semibold",
  metric: "bold",
};

const defaultTagMap: Record<TextVariant, TextProps["as"]> = {
  micro: "span",
  badge: "span",
  caption: "span",
  "body-sm": "p",
  body: "p",
  "heading-sm": "h2",
  heading: "h2",
  metric: "h2",
};

export default function Text({
  variant = "body",
  font,
  color = "primary",
  weight,
  uppercase = false,
  truncate = false,
  children,
  as,
  className = "",
}: TextProps) {
  const resolvedFont = font ?? defaultFontMap[variant];
  const resolvedWeight = weight ?? defaultWeightMap[variant];
  const Tag = as ?? defaultTagMap[variant] ?? "span";

  const classes = [
    variantSizeMap[variant],
    fontClassMap[resolvedFont],
    colorClassMap[color],
    weightClassMap[resolvedWeight],
    uppercase && "uppercase",
    uppercase && variant === "badge" && "tracking-wider",
    uppercase && variant === "micro" && "tracking-widest",
    truncate && "truncate",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Tag className={classes}>{children}</Tag>;
}

export type { TextProps, TextVariant, TextFont, TextColor };
