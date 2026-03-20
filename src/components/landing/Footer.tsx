import Link from "next/link";
import { Container } from "./Container";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#", soon: true },
      { label: "Documentation", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#", soon: true },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Twitter / X", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Email", href: "#" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative pt-20 pb-10"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--theme-bg-primary) 84%, transparent) 0%, color-mix(in srgb, var(--theme-surface-secondary) 94%, var(--theme-cta) 6%) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--theme-accent) 5%, transparent) 0%, transparent 72%)",
        }}
      />
      <Container>
        <div className="section-divider mb-16" />
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Logo column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 inline-flex items-center">
              <span className="font-sans text-lg font-light text-text-secondary">
                Pulse
              </span>
              <span className="font-sans text-lg font-black text-text-primary">
                Board
              </span>
            </Link>
            <p className="mt-2 max-w-[200px] font-body text-xs leading-relaxed text-text-tertiary">
              Conversational intelligence for teams that use Slack.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-body text-xs font-semibold uppercase tracking-widest text-text-secondary">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="font-body text-sm text-text-tertiary transition-colors duration-200 hover:text-text-primary"
                    >
                      {link.label}
                      {link.soon && (
                        <span className="ml-1.5 rounded-full bg-bg-tertiary px-1.5 py-0.5 font-mono text-[8px] text-text-tertiary">
                          Soon
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border-default/30 pt-6 sm:flex-row">
          <p className="font-body text-xs text-text-tertiary">
            &copy; {year} PulseBoard
          </p>
          <p className="font-body text-xs text-text-tertiary">
            Built with care
          </p>
        </div>
      </Container>
    </footer>
  );
}
