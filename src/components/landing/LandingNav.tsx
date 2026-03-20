"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Container } from "./Container";
import { ThemeControl } from "@/components/theme/ThemeControl";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#", soon: true },
];

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "border-b border-border-subtle bg-overlay/85 backdrop-blur-xl"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-0 transition-opacity duration-150 hover:opacity-80 select-none"
        >
          <span className="font-sans text-lg font-light text-text-secondary">
            Pulse
          </span>
          <span className="font-sans text-lg font-black text-text-primary">
            Board
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative font-body text-[13px] text-text-secondary transition-colors duration-150 hover:text-text-primary"
              onClick={link.soon ? (e) => e.preventDefault() : undefined}
            >
              {link.label}
              {link.soon && (
                <span className="ml-1.5 rounded bg-bg-tertiary px-1.5 py-0.5 font-mono text-[9px] text-text-tertiary">
                  Soon
                </span>
              )}
              {!link.soon && (
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-accent transition-all duration-200 group-hover:w-full" />
              )}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeControl showLabel />
          <Link
            href="/connect"
            className="px-4 py-2 font-body text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            Sign in
          </Link>
          <Link
            href="/connect"
            className="rounded-lg bg-cta px-4 py-2 font-body text-sm font-semibold text-text-inverse transition-all duration-150 hover:-translate-y-0.5 hover:bg-cta-hover hover:shadow-[0_10px_24px_-10px_rgba(var(--theme-cta-rgb),0.42)]"
          >
            Get Started
          </Link>
        </div>

        <button
          className="flex items-center md:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        >
          {isMobileOpen ? (
            <IconX size={22} className="text-text-primary" />
          ) : (
            <IconMenu2 size={22} className="text-text-primary" />
          )}
        </button>
      </Container>

      {isMobileOpen && (
        <div className="border-b border-border-subtle bg-overlay/95 backdrop-blur-xl md:hidden">
          <Container className="flex flex-col gap-4 py-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-body text-base text-text-secondary"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-3">
              <ThemeControl align="left" showLabel className="self-start" />
              <Link
                href="/connect"
                onClick={() => setIsMobileOpen(false)}
                className="px-4 py-2.5 font-body text-sm text-text-secondary"
              >
                Sign in
              </Link>
              <Link
                href="/connect"
                onClick={() => setIsMobileOpen(false)}
                className="rounded-lg bg-cta px-4 py-2.5 font-body text-sm font-semibold text-text-inverse"
              >
                Get Started
              </Link>
            </div>
          </Container>
        </div>
      )}
    </nav>
  );
}
