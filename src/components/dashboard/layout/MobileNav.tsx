"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV_ITEMS } from "./navigation";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border-default bg-bg-secondary md:hidden">
      {DASHBOARD_NAV_ITEMS.map((item) => {
        const active = item.isActive(pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={[
              "flex flex-col items-center gap-1 px-3 py-1.5 transition-colors duration-150",
              active ? "text-accent" : "text-text-tertiary",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={20} />
            <span className="text-[10px] font-body">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
