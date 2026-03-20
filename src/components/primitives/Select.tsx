"use client";

import React from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  className?: string;
}

export default function Select({
  value,
  onChange,
  options,
  label,
  className = "",
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className={`rounded-radius-md border border-border-default bg-bg-primary px-2.5 py-1 font-mono text-badge text-text-secondary focus:outline-none focus:border-accent ${className}`.trim()}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export type { SelectProps, SelectOption };
