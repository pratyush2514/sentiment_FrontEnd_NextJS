"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { IconBrandSlack, IconArrowRight } from "@tabler/icons-react";
import { Container } from "./Container";
import { HeroDashboard } from "./HeroDashboard";

export function Hero() {
  const reduce = useReducedMotion();

  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: "easeOut" as const },
        };

  return (
    <section className="zone-hero relative overflow-hidden pt-36 pb-0">
      {/* Grain */}
      <div className="grain" aria-hidden="true" />

      {/* Multi-point ambient glow */}
      <div
        className="glow-mesh pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />

      <Container className="flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          {...fade(0.1)}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-secondary/60 px-4 py-1.5 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-joy animate-[pulse-dot_2s_infinite]" />
          <span className="font-mono text-xs text-text-secondary">
            Conversational Intelligence for Slack
          </span>
        </motion.div>

        {/* Headline - extreme weight contrast */}
        <motion.h1
          {...fade(0.2)}
          className="max-w-6xl font-sans text-[36px] font-light leading-[1.08] tracking-[-0.03em] text-text-primary sm:text-5xl md:text-6xl lg:text-[80px]"
        >
          See what Slack conversations
          <br className="hidden sm:block" />
          {" "}
          <span className="font-black bg-gradient-to-r from-accent via-[#38BDF8] to-accent bg-clip-text text-transparent">
            really
          </span>
          {" "}mean.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fade(0.35)}
          className="mt-6 max-w-[560px] font-body text-base leading-relaxed text-text-secondary md:text-lg"
        >
          PulseBoard monitors your Slack channels and reveals the emotional
          dynamics, escalation risks, and key decisions your team is missing.
        </motion.p>

        {/* CTA buttons */}
        <motion.div {...fade(0.5)} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/connect" className="inline-flex items-center gap-2 rounded-lg bg-cta px-7 py-3 font-sans text-[15px] font-semibold text-text-inverse transition-all duration-150 hover:-translate-y-0.5 hover:bg-cta-hover hover:shadow-[0_10px_24px_-10px_rgba(var(--theme-cta-rgb),0.42)]">
            <IconBrandSlack size={18} />
            Connect with Slack
          </Link>
          <a
            href="#product-demo"
            className="group inline-flex items-center gap-1.5 px-4 py-3 font-sans text-[15px] text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            See how it works
            <IconArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-1" />
          </a>
        </motion.div>
      </Container>

      {/* Product screenshot - the centerpiece */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.7, ease: "easeOut" as const }}
        className="relative mt-20 md:mt-28"
      >
        {/* Glow behind dashboard */}
        <div
          className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 h-[600px]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--theme-accent) 11%, transparent) 0%, color-mix(in srgb, var(--theme-cta) 5%, transparent) 40%, transparent 72%)",
          }}
        />
        <Container>
          <div className="relative mx-auto max-w-[1100px]">
            {/* Fade-out at bottom */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40"
              style={{
                background:
                  "linear-gradient(to top, color-mix(in srgb, var(--theme-bg-primary) 82%, transparent) 0%, transparent 100%)",
              }}
            />
            <HeroDashboard />
          </div>
        </Container>
      </motion.div>
    </section>
  );
}
