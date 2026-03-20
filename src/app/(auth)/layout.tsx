import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="zone-auth relative flex min-h-dvh flex-col items-center justify-between bg-bg-primary">
      {/* Grain */}
      <div className="grain" aria-hidden="true" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "var(--theme-auth-ambient)",
        }}
        aria-hidden="true"
      />

      {/* Logo */}
      <header className="relative z-10 pt-12 pb-8">
        <Link
          href="/"
          className="flex items-center gap-0 transition-opacity duration-150 hover:opacity-80"
        >
          <span className="font-sans text-lg font-light text-text-secondary">Pulse</span>
          <span className="font-sans text-lg font-black text-text-primary">Board</span>
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 flex w-full flex-1 items-center justify-center px-4">
        {children}
      </main>

      {/* Footer links */}
      <footer className="relative z-10 pb-8 pt-8">
        <div className="flex items-center gap-4 font-body text-xs text-text-tertiary">
          <a href="#" className="transition-colors duration-150 hover:text-text-secondary">
            Privacy Policy
          </a>
          <span className="text-border-default">&middot;</span>
          <a href="#" className="transition-colors duration-150 hover:text-text-secondary">
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
}
