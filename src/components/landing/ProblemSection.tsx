"use client";

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { Container } from "./Container";

/* eslint-disable @next/next/no-img-element */

const messages = [
  { user: "Alice", seed: "alice-pm", text: "Here's the updated timeline for Q2", time: "2:14 PM" },
  { user: "Bob", seed: "bob-eng", text: "Looks reasonable. Quick question about the deadline", time: "2:18 PM" },
  { user: "Sarah K.", seed: "sarah-client", text: "We've been going back and forth on this for weeks now", time: "2:22 PM" },
  { user: "Mike", seed: "mike-lead", text: "Sure, whatever works at this point", time: "2:25 PM" },
  { user: "Sarah K.", seed: "sarah-client", text: "Fine. Let's just go with the original plan then", time: "2:31 PM" },
];

const sentiments = [
  { label: "Neutral", color: "var(--color-neutral)" },
  { label: "Neutral", color: "var(--color-neutral)" },
  { label: "Frustration", color: "var(--color-error)" },
  { label: "Sarcasm", color: "var(--color-warning)" },
  { label: "Resignation", color: "var(--color-error)" },
];

const confusedThoughts = [
  { text: "Is she actually upset or just venting?", top: "38%", right: "-8%", delay: 0.1, rotate: -2 },
  { text: "Wait — was that sarcasm?", top: "56%", right: "2%", delay: 0.3, rotate: 1.5 },
  { text: "Should I say something... or let it go?", top: "74%", right: "-4%", delay: 0.55, rotate: -1 },
];

const comparisonPanelStyle = {
  boxShadow: "var(--theme-shadow-raised)",
};

const thoughtBubbleStyle = {
  boxShadow: "var(--theme-shadow-raised)",
};

function ThoughtBubble({
  text,
  visible,
  delay,
  style,
  rotate,
}: {
  text: string;
  visible: boolean;
  delay: number;
  style: React.CSSProperties;
  rotate: number;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          transition={{
            duration: 0.4,
            delay,
            ease: [0.23, 1, 0.32, 1],
          }}
          className="pointer-events-none absolute z-10"
          style={style}
        >
          {/* Trailing dots */}
          <div className="absolute -bottom-3 left-4 flex flex-col items-start gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-border-default/50" />
            <div className="ml-1 h-1 w-1 rounded-full bg-border-default/30" />
          </div>
          {/* Bubble */}
          <div className="rounded-2xl bg-bg-elevated/90 px-4 py-2.5 shadow-lg backdrop-blur-sm"
            style={thoughtBubbleStyle}
          >
            <p className="whitespace-nowrap font-body text-[12px] leading-snug text-text-secondary/90 italic">
              {text}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WithoutMockup() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative rounded-2xl border border-border-subtle bg-surface/85 p-5 transition-all duration-500"
      style={comparisonPanelStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-text-tertiary/30" />
        <span className="font-mono text-xs text-text-tertiary"># client-beta</span>
      </div>
      <div className="space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className="flex items-start gap-3">
            <img
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${msg.seed}&backgroundColor=transparent`}
              alt=""
              className="mt-0.5 h-6 w-6 shrink-0 rounded"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-body text-xs font-semibold text-text-primary">{msg.user}</span>
                <span className="font-mono text-[9px] text-text-tertiary">{msg.time}</span>
              </div>
              <p className="mt-0.5 font-body text-xs leading-relaxed text-text-secondary">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Confused thought bubbles — float up from behind on hover */}
      {confusedThoughts.map((thought, i) => (
        <ThoughtBubble
          key={i}
          text={thought.text}
          visible={isHovered}
          delay={thought.delay}
          rotate={thought.rotate}
          style={{ top: thought.top, right: thought.right }}
        />
      ))}
    </div>
  );
}

function WithMockup() {
  return (
    <div
      className="rounded-2xl border border-border-subtle bg-surface p-5 transition-all duration-500"
      style={comparisonPanelStyle}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-joy" />
        <span className="font-mono text-xs text-text-tertiary"># client-beta</span>
      </div>
      <div className="space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className="flex items-start gap-3">
            <img
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${msg.seed}&backgroundColor=transparent`}
              alt=""
              className="mt-0.5 h-6 w-6 shrink-0 rounded"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-body text-xs font-semibold text-text-primary">{msg.user}</span>
                <span className="font-mono text-[9px] text-text-tertiary">{msg.time}</span>
              </div>
              <p className={`mt-0.5 font-body text-xs leading-relaxed ${i >= 2 ? "text-text-primary" : "text-text-secondary"}`}>
                {msg.text}
              </p>
            </div>
            <span
              className="mt-1 shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-medium"
              style={{
                backgroundColor: `color-mix(in srgb, ${sentiments[i].color} 8%, transparent)`,
                color: sentiments[i].color,
              }}
            >
              {sentiments[i].label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-anger/5 px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-anger animate-[pulse-dot_2s_infinite]" />
        <span className="font-mono text-[10px] text-anger">Escalation risk detected — sentiment declining</span>
      </div>
    </div>
  );
}

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  const reduce = useReducedMotion();

  return (
    <section className="zone-problem relative py-32 lg:py-40">
      <Container>
        <motion.div
          ref={ref}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="mx-auto max-w-[760px] font-sans text-2xl font-light leading-tight text-text-primary md:text-[44px]">
            Your team reads messages.{" "}
            <span className="font-bold">
              Pulse<span className="font-black">Board</span> reads the room.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] font-body text-base text-text-secondary">
            The same conversation looks completely different when AI understands context, sarcasm, and emotional subtext.
          </p>
        </motion.div>

        {/* Before / After comparison */}
        <div className="mx-auto grid max-w-[960px] gap-6 lg:grid-cols-2">
          <motion.div
            initial={reduce ? false : { opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-text-tertiary">
              Without PulseBoard
            </p>
            <WithoutMockup />
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-accent">
              With PulseBoard
            </p>
            <WithMockup />
          </motion.div>
        </div>

        {/* Metric callouts */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mx-auto mt-16 flex max-w-[800px] flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16"
        >
          {[
            { metric: "3x", label: "Faster escalation detection" },
            { metric: "Zero", label: "Conversations slip through" },
            { metric: "∞", label: "Context that never expires" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-sans text-2xl font-black text-accent">{item.metric}</p>
              <p className="mt-1 font-body text-sm text-text-secondary">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
