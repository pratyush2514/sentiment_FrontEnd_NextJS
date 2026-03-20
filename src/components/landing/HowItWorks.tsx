"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { IconBrandSlack, IconBrain, IconChartLine } from "@tabler/icons-react";
import { Container } from "./Container";

/* eslint-disable @next/next/no-img-element */

const steps = [
  {
    number: "01",
    icon: IconBrandSlack,
    title: "Connect",
    subtitle: "One command. That's it.",
    description: "Invite PulseBoard to any Slack channel. It backfills 30 days of history, reconstructs every thread, and resolves all participants automatically.",
    visual: "connect",
    glowColor: "rgba(34, 197, 94, 0.06)",
  },
  {
    number: "02",
    icon: IconBrain,
    title: "Analyze",
    subtitle: "AI with full conversation memory.",
    description: "Every message is analyzed with running summaries, thread structures, and historical context. Not keyword matching — contextual understanding.",
    visual: "analyze",
    glowColor: "rgba(239, 68, 68, 0.05)",
  },
  {
    number: "03",
    icon: IconChartLine,
    title: "Act",
    subtitle: "See what needs attention in 10 seconds.",
    description: "Sentiment timelines, flagged messages, AI-generated summaries, and real-time escalation alerts — all in one dashboard.",
    visual: "act",
    glowColor: "rgba(14, 165, 233, 0.06)",
  },
];

const stepVisualStyle = {
  boxShadow: "var(--theme-shadow-raised)",
};

function ConnectVisual({ isActive }: { isActive?: boolean }) {
  return (
    <div
      className="rounded-2xl border border-border-subtle bg-surface/95 p-5"
      style={stepVisualStyle}
    >
      <div className="mb-4 flex items-center gap-2">
        <IconBrandSlack size={16} className="text-text-tertiary" />
        <span className="font-mono text-xs text-text-secondary">Add to Slack</span>
      </div>
      <div className="space-y-2">
        {["#client-acme", "#project-alpha", "#client-beta", "#urgent-support"].map((ch, i) => (
          <motion.div
            key={ch}
            initial={isActive ? { opacity: 0, x: -8 } : false}
            animate={isActive ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.3, delay: i * 0.15 }}
            className="flex items-center gap-3 rounded-lg bg-bg-tertiary/50 px-3 py-2"
          >
            <div className={`h-2 w-2 rounded-full ${i < 3 ? "bg-joy" : "bg-joy/40"}`} />
            <span className="font-mono text-xs text-text-secondary">{ch}</span>
            <span className="ml-auto font-mono text-[9px] text-joy">{i < 3 ? "Connected" : "Syncing..."}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-bg-tertiary">
        <div
          className="h-full rounded-full bg-accent transition-all duration-1000 ease-out"
          style={{ width: isActive ? "75%" : "0%" }}
        />
      </div>
      <p className="mt-2 font-mono text-[10px] text-text-tertiary">Backfilling 30 days of history...</p>
    </div>
  );
}

function AnalyzeVisual() {
  return (
    <div
      className="rounded-2xl border border-border-subtle bg-surface/95 p-5"
      style={stepVisualStyle}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3 border-l-2 border-anger/60 pl-3">
          <img
            src="https://api.dicebear.com/9.x/notionists/svg?seed=client&backgroundColor=transparent"
            alt=""
            className="mt-0.5 h-6 w-6 shrink-0 rounded"
            loading="lazy"
          />
          <div className="flex-1">
            <p className="font-body text-xs text-text-secondary">
              &ldquo;Sure, whatever works. We&apos;ve only been waiting two weeks.&rdquo;
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-anger/12 px-2 py-0.5 font-mono text-[9px] text-anger">Frustration 82%</span>
              <span className="rounded-full bg-surprise/12 px-2 py-0.5 font-mono text-[9px] text-surprise">Sarcasm detected</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-bg-tertiary/50 p-3">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-wider text-text-tertiary">AI Context</p>
          <p className="font-mono text-[10px] leading-relaxed text-text-secondary">
            Historical pattern: 3rd escalation this month from this client. Previous interactions show growing dissatisfaction with delivery timelines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-[pulse-dot_2s_infinite]" />
          <span className="font-mono text-[10px] text-accent">Processing with conversation memory...</span>
        </div>
      </div>
    </div>
  );
}

function ActVisual() {
  return (
    <div
      className="rounded-2xl border border-border-subtle bg-surface/95 p-5"
      style={stepVisualStyle}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-sans text-xs font-semibold text-text-primary">Dashboard</span>
        <span className="font-mono text-[9px] text-text-tertiary">Live</span>
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-bg-tertiary/50 p-2 text-center">
          <p className="font-mono text-lg font-bold text-text-primary">12</p>
          <p className="font-mono text-[8px] text-text-tertiary">Channels</p>
        </div>
        <div className="rounded-lg bg-bg-tertiary/50 p-2 text-center">
          <p className="font-mono text-lg font-bold text-anger">3</p>
          <p className="font-mono text-[8px] text-text-tertiary">Alerts</p>
        </div>
        <div className="rounded-lg bg-bg-tertiary/50 p-2 text-center">
          <p className="font-mono text-lg font-bold text-joy">84%</p>
          <p className="font-mono text-[8px] text-text-tertiary">Health</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 rounded-lg bg-anger/5 px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-anger animate-[pulse-dot_2s_infinite]" />
          <span className="font-mono text-[10px] text-anger">#client-beta — escalation detected</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surprise/5 px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-surprise" />
          <span className="font-mono text-[10px] text-surprise">#urgent-support — sentiment declining</span>
        </div>
      </div>
    </div>
  );
}

const visuals: Record<string, React.FC<{ isActive?: boolean }>> = {
  connect: ConnectVisual,
  analyze: AnalyzeVisual,
  act: ActVisual,
};

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  const reduce = useReducedMotion();
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    if (!isInView) return;
    if (reduce) {
      const t = setTimeout(() => setActiveStep(2), 0);
      return () => clearTimeout(t);
    }
    const timers: NodeJS.Timeout[] = [];
    steps.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveStep(i), 600 + i * 700));
    });
    return () => timers.forEach(clearTimeout);
  }, [isInView, reduce]);

  return (
    <section id="how-it-works" className="zone-how relative py-32 lg:py-40">
      <Container>
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-wider text-accent">
            How It Works
          </span>
          <h2 className="font-sans text-2xl font-light text-text-primary md:text-[40px]">
            Three steps to conversational intelligence
          </h2>
        </div>

        <div ref={ref} className="mx-auto max-w-[960px] space-y-16 lg:space-y-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const Visual = visuals[step.visual];
            const isActive = i <= activeStep;
            const isEven = i % 2 === 1;

            return (
              <motion.div
                key={step.number}
                initial={reduce ? false : { opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16 ${i > 0 ? "lg:mt-20" : ""} ${isEven ? "lg:flex-row-reverse" : ""}`}
              >
                {/* Text side */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 ${
                        isActive
                          ? "bg-accent/10 shadow-[0_0_20px_rgba(14,165,233,0.15)]"
                          : "bg-bg-tertiary"
                      }`}
                    >
                      <Icon
                        size={20}
                        className={`transition-colors duration-500 ${isActive ? "text-accent" : "text-text-tertiary"}`}
                      />
                    </div>
                    <span className={`font-mono text-sm transition-colors duration-500 ${isActive ? "text-accent" : "text-text-tertiary"}`}>{step.number}</span>
                  </div>
                  <h3 className="mb-2 font-sans text-2xl font-bold text-text-primary lg:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mb-3 font-body text-sm font-medium text-accent/80">
                    {step.subtitle}
                  </p>
                  <p className="max-w-[400px] font-body text-base leading-relaxed text-text-secondary">
                    {step.description}
                  </p>
                </div>

                {/* Visual side */}
                <div className="relative flex-1">
                  <div
                    className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl"
                    style={{ background: `radial-gradient(ellipse at 50% 50%, ${step.glowColor}, transparent 70%)` }}
                  />
                  <Visual isActive={isActive} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
