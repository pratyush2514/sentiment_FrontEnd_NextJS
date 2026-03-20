"use client";

import React from "react";
import { IconSearch } from "@tabler/icons-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`.trim()}>
      <IconSearch
        size={12}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-radius-md border border-border-default bg-bg-primary py-1.5 pl-7 pr-3 font-body text-body-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent w-44"
      />
    </div>
  );
}

export type { SearchInputProps };
