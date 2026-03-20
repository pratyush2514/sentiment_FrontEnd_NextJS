"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  IconMessageChatbot,
  IconMessages,
  IconBrain,
  IconBell,
  IconGauge,
} from "@tabler/icons-react";
import { Container } from "./Container";

/* eslint-disable @next/next/no-img-element */

const features = [
  {
    icon: IconMessageChatbot,
    label: "Core Feature",
    title: "Contextual Sentiment Analysis",
    description:
      "Not keyword matching. PulseBoard understands sarcasm, detects implicit frustration, and reads emotional subtext. When a client says 'fine, let's just go with that,' it knows whether that's agreement or passive frustration — based on the full conversation.",
    visual: "sentiment",
    glowColor: "rgba(239, 68, 68, 0.05)",
  },
  {
    icon: IconMessages,
    label: "Thread Analysis",
    title: "Thread-Level Intelligence",
    description:
      "Analyze entire conversation threads. See how sentiment evolves from first message to last reply — with per-message emotion annotations and drift detection.",
    visual: "thread",
    glowColor: "rgba(245, 158, 11, 0.05)",
  },
  {
    icon: IconBrain,
    label: "Memory Engine",
    title: "Running Conversation Memory",
    description:
      "AI-maintained summaries that evolve with every message. Never lose track of what was discussed, decided, or promised. Context persists across days and weeks.",
    visual: "memory",
    glowColor: "rgba(14, 165, 233, 0.05)",
  },
  {
    icon: IconBell,
    label: "Real-time Alerts",
    title: "Escalation Alerts",
    description:
      "Know when tone shifts before it becomes a complaint. Real-time notifications when sentiment drops below configurable thresholds across any channel.",
    visual: "alerts",
    glowColor: "rgba(239, 68, 68, 0.05)",
  },
  {
    icon: IconGauge,
    label: "Smart Efficiency",
    title: "Cost-Efficient Analysis",
    description:
      "Conditional LLM gating — only calls the AI when it matters. Smart heuristics filter routine messages so you're not burning tokens on 'sounds good' and 'thanks!'",
    visual: "cost",
    glowColor: "rgba(34, 197, 94, 0.05)",
  },
];

const featurePanelStyle = {
  boxShadow: "var(--theme-shadow-raised)",
};

function SentimentVisual() {
  return (
    <div
      className="rounded-2xl border border-border-subtle bg-surface/95 p-6 transition-colors duration-300 hover:border-border-hover"
      style={featurePanelStyle}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <img
            src="https://api.dicebear.com/9.x/notionists/svg?seed=user-a&backgroundColor=transparent"
            alt=""
            className="mt-0.5 h-8 w-8 shrink-0 rounded-lg"
            loading="lazy"
          />
          <div className="flex-1">
            <p className="font-body text-sm text-text-secondary">
              &ldquo;Sure, whatever works&rdquo;
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-text-tertiary">&rarr;</span>
              <span className="rounded-full bg-anger/12 px-3 py-1 font-mono text-[11px] font-medium text-anger">
                Sarcasm detected — Frustration 82%
              </span>
            </div>
          </div>
        </div>
        <div className="h-px bg-border-default/20" />
        <div className="flex items-start gap-4">
          <img
            src="https://api.dicebear.com/9.x/notionists/svg?seed=user-b&backgroundColor=transparent"
            alt=""
            className="mt-0.5 h-8 w-8 shrink-0 rounded-lg"
            loading="lazy"
          />
          <div className="flex-1">
            <p className="font-body text-sm text-text-secondary">
              &ldquo;That sounds great, let&apos;s do it&rdquo;
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-text-tertiary">&rarr;</span>
              <span className="rounded-full bg-joy/12 px-3 py-1 font-mono text-[11px] font-medium text-joy">
                Genuine agreement — Joy 91%
              </span>
            </div>
          </div>
        </div>
        <div className="h-px bg-border-default/20" />
        <div className="flex items-start gap-4">
          <img
            src="https://api.dicebear.com/9.x/notionists/svg?seed=user-c&backgroundColor=transparent"
            alt=""
            className="mt-0.5 h-8 w-8 shrink-0 rounded-lg"
            loading="lazy"
          />
          <div className="flex-1">
            <p className="font-body text-sm text-text-secondary">
              &ldquo;I guess we can try that approach&rdquo;
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-text-tertiary">&rarr;</span>
              <span className="rounded-full bg-surprise/12 px-3 py-1 font-mono text-[11px] font-medium text-surprise">
                Reluctant agreement — Doubt 67%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreadVisual() {
  const msgs = [
    { user: "Alice", emotion: "Neutral", color: "var(--color-neutral)", width: "20%" },
    { user: "Bob", emotion: "Neutral", color: "var(--color-neutral)", width: "25%" },
    { user: "Sarah", emotion: "Concern", color: "var(--color-warning)", width: "45%" },
    { user: "Alice", emotion: "Defensive", color: "var(--color-warning)", width: "55%" },
    { user: "Sarah", emotion: "Frustration", color: "var(--color-error)", width: "72%" },
    { user: "Bob", emotion: "Mediation", color: "var(--color-sadness)", width: "40%" },
    { user: "Sarah", emotion: "Anger", color: "var(--color-anger)", width: "88%" },
  ];

  return (
    <div
      className="rounded-2xl border border-border-subtle bg-surface/95 p-6 transition-colors duration-300 hover:border-border-hover"
      style={featurePanelStyle}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs text-text-tertiary"># client-beta / thread</span>
        <span className="font-mono text-[9px] text-text-tertiary">7 messages</span>
      </div>
      <div className="space-y-2.5">
        {msgs.map((m, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-12 shrink-0 font-body text-[11px] text-text-tertiary">{m.user}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-tertiary">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: m.width, backgroundColor: m.color }}
              />
            </div>
            <span
              className="w-20 shrink-0 font-mono text-[9px]"
              style={{ color: m.color }}
            >
              {m.emotion}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-anger/5 p-3">
        <p className="font-mono text-[10px] text-anger">
          Thread sentiment drift: +68% negativity over 7 messages. Escalation likely.
        </p>
      </div>
    </div>
  );
}

function MemoryVisual() {
  return (
    <div
      className="rounded-2xl border border-border-subtle bg-surface/95 p-6 transition-colors duration-300 hover:border-border-hover"
      style={featurePanelStyle}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs text-text-secondary">Running Summary</span>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[9px] text-accent">Auto-updated</span>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg bg-accent/5 p-4">
          <p className="font-mono text-[11px] leading-relaxed text-text-secondary">
            Team discussed Q2 deliverables. Client requested earlier deadline (Mar 15).
            <span className="text-text-primary font-medium"> Bob agreed but flagged resource constraints.</span>
            {" "}Alice proposed phased delivery.
            <span className="text-anger"> No final decision — revisit Thursday.</span>
          </p>
        </div>
        <div>
          <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-text-tertiary">Decisions</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-joy" />
              <span className="font-mono text-[10px] text-text-secondary">Phased delivery approach approved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-surprise" />
              <span className="font-mono text-[10px] text-text-secondary">Timeline review scheduled for Thursday</span>
            </div>
          </div>
        </div>
        <div>
          <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-text-tertiary">Action Items</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-accent">Bob:</span>
              <span className="font-mono text-[10px] text-text-secondary">Share resource plan by Wed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-accent">Alice:</span>
              <span className="font-mono text-[10px] text-text-secondary">Draft phased delivery timeline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertsVisual() {
  const alerts = [
    { channel: "#client-beta", severity: "Critical", message: "Sarah K.: 'This is unacceptable at this point'", time: "2 min ago", color: "var(--color-error)" },
    { channel: "#urgent-support", severity: "Warning", message: "Mike T.: 'This keeps happening every sprint'", time: "14 min ago", color: "var(--color-warning)" },
    { channel: "#project-alpha", severity: "Watch", message: "Sentiment trending below threshold", time: "1 hr ago", color: "var(--color-info)" },
  ];

  return (
    <div
      className="rounded-2xl border border-border-subtle bg-surface/95 p-6 transition-colors duration-300 hover:border-border-hover"
      style={featurePanelStyle}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs text-text-secondary">Escalation Feed</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-anger animate-[pulse-dot_2s_infinite]" />
          <span className="font-mono text-[9px] text-text-tertiary">Live</span>
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <div key={i} className="rounded-lg bg-bg-tertiary/50 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold"
                  style={{ backgroundColor: `color-mix(in srgb, ${alert.color} 10%, transparent)`, color: alert.color }}
                >
                  {alert.severity}
                </span>
                <span className="font-mono text-[10px] text-text-tertiary">{alert.channel}</span>
              </div>
              <span className="font-mono text-[9px] text-text-tertiary">{alert.time}</span>
            </div>
            <p className="font-body text-[11px] leading-relaxed text-text-secondary">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostVisual() {
  return (
    <div
      className="rounded-2xl border border-border-subtle bg-surface/95 p-6 transition-colors duration-300 hover:border-border-hover"
      style={featurePanelStyle}
    >
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-bg-tertiary/50 p-3 text-center">
          <p className="font-mono text-2xl font-bold text-joy">$38</p>
          <p className="font-mono text-[9px] text-text-tertiary">This month</p>
        </div>
        <div className="rounded-lg bg-bg-tertiary/50 p-3 text-center">
          <p className="font-mono text-2xl font-bold text-text-primary">847</p>
          <p className="font-mono text-[9px] text-text-tertiary">LLM calls saved</p>
        </div>
        <div className="rounded-lg bg-bg-tertiary/50 p-3 text-center">
          <p className="font-mono text-2xl font-bold text-accent">73%</p>
          <p className="font-mono text-[9px] text-text-tertiary">Filtered out</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-text-tertiary">Routine messages</span>
          <span className="font-mono text-[10px] text-text-secondary">Skipped</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg-tertiary">
          <div className="h-full w-[73%] rounded-full bg-bg-elevated" />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-text-tertiary">Meaningful messages</span>
          <span className="font-mono text-[10px] text-accent">Analyzed</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg-tertiary">
          <div className="h-full w-[27%] rounded-full bg-accent" />
        </div>
      </div>
      <p className="mt-4 font-mono text-[10px] text-text-tertiary">
        Smart gating: &ldquo;sounds good&rdquo;, &ldquo;thanks!&rdquo;, emoji reactions &rarr; auto-skipped
      </p>
    </div>
  );
}

const visualComponents: Record<string, React.FC> = {
  sentiment: SentimentVisual,
  thread: ThreadVisual,
  memory: MemoryVisual,
  alerts: AlertsVisual,
  cost: CostVisual,
};

function FeatureSection({ feature, index }: { feature: typeof features[number]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });
  const reduce = useReducedMotion();
  const Icon = feature.icon;
  const Visual = visualComponents[feature.visual];
  const isEven = index % 2 === 1;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const visualY = useTransform(scrollYProgress, [0, 1], [50, -15]);
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.6, 1, 1, 0.7]);

  return (
    <section className={index % 2 === 0 ? "zone-feature-odd" : "zone-feature-even"}>
      <motion.div
        className="py-32 lg:py-40"
        style={reduce ? undefined : { opacity: sectionOpacity }}
      >
        <Container>
          <div
            ref={ref}
            className={`mx-auto flex max-w-[1000px] flex-col gap-10 lg:flex-row lg:items-center lg:gap-20 ${isEven ? "lg:flex-row-reverse" : ""}`}
          >
            {/* Text */}
            <motion.div
              initial={reduce ? false : { opacity: 0, x: isEven ? 30 : -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1"
              style={reduce ? undefined : { y: textY }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Icon size={20} className="text-accent" />
                <span className="font-mono text-xs uppercase tracking-wider text-accent">
                  {feature.label}
                </span>
              </div>
              <h3 className="mb-4 font-sans text-2xl font-light text-text-primary md:text-[36px] leading-[1.15]">
                {feature.title}
              </h3>
              <p className="max-w-[440px] font-body text-base leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </motion.div>

            {/* Visual */}
            <motion.div
              initial={reduce ? false : { opacity: 0, x: isEven ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative flex-1"
              style={reduce ? undefined : { y: visualY }}
            >
              <div
                className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl"
                style={{ background: `radial-gradient(ellipse at 50% 50%, ${feature.glowColor}, transparent 70%)` }}
              />
              <Visual />
            </motion.div>
          </div>
        </Container>
      </motion.div>
    </section>
  );
}

export function FeatureShowcase() {
  return (
    <div id="features">
      {/* Section intro */}
      <div className="zone-features py-20 text-center">
        <Container>
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-wider text-accent">
            Capabilities
          </span>
          <h2 className="font-sans text-2xl font-light text-text-primary md:text-[40px]">
            Intelligence, not just analytics
          </h2>
          <p className="mx-auto mt-3 max-w-[560px] font-body text-base text-text-secondary">
            Every feature is designed around one question: which conversations
            need your attention right now?
          </p>
        </Container>
      </div>

      {/* Alternating feature sections */}
      {features.map((feature, i) => (
        <FeatureSection key={feature.title} feature={feature} index={i} />
      ))}
    </div>
  );
}
