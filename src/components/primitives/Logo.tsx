import Link from "next/link";

interface LogoProps {
  collapsed?: boolean;
  href?: string;
  className?: string;
}

export function Logo({
  collapsed = false,
  href = "/",
  className = "",
}: LogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 transition-opacity hover:opacity-80 ${className}`.trim()}
      aria-label="PulseBoard home"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-radius-md border border-border-subtle bg-accent/10 shadow-raised">
        <span className="font-sans text-[12px] font-black tracking-tight text-accent">
          P
        </span>
      </span>
      {!collapsed ? (
        <span className="flex items-center gap-0.5 leading-none">
          <span className="font-sans text-sm font-light text-text-secondary">
            Pulse
          </span>
          <span className="font-sans text-sm font-black tracking-tight text-text-primary">
            Board
          </span>
        </span>
      ) : null}
    </Link>
  );
}

export type { LogoProps };
