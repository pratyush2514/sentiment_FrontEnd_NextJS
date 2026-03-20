"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { IconBrandSlack } from "@tabler/icons-react";
import { Container } from "./Container";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  const reduce = useReducedMotion();

  return (
    <section
      ref={ref}
      className="zone-cta relative py-40 lg:py-48"
    >
      <div className="grain" aria-hidden="true" />

      {/* Subtle lime glow — slightly stronger */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--theme-cta) 12%, transparent) 0%, transparent 62%)",
        }}
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.98 }}
          animate={isInView ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-[640px] text-center"
        >
          {/* Lead question */}
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-4 font-body text-lg text-text-secondary"
          >
            What&apos;s happening in your Slack channels right now?
          </motion.p>

          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-sans text-3xl font-light text-text-primary md:text-[52px] leading-[1.1]"
          >
            Stop guessing.{" "}
            <span className="font-black">Start seeing.</span>
          </motion.h2>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-10 flex flex-col items-center gap-4"
          >
            <Link href="/connect" className="inline-flex items-center gap-2 rounded-lg bg-cta px-8 py-3.5 font-sans text-base font-semibold text-text-inverse transition-all duration-150 hover:-translate-y-0.5 hover:bg-cta-hover hover:shadow-[0_12px_28px_-12px_rgba(var(--theme-cta-rgb),0.4)]">
              <IconBrandSlack size={20} />
              Connect with Slack
            </Link>
            <p className="font-body text-sm text-text-tertiary">
              Free during beta. No credit card required.
            </p>
            <a
              href="#"
              className="mt-1 font-body text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
            >
              Read the documentation &rarr;
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
