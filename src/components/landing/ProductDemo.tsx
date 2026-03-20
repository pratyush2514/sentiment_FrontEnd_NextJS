"use client";

import type { CSSProperties } from "react";
import {
  startTransition,
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { IconBrandSlack } from "@tabler/icons-react";
import { Container } from "./Container";

/* eslint-disable @next/next/no-img-element */

const MESSAGES = [
  {
    name: "Alice",
    time: "2:34 PM",
    seed: "alice",
    text: "Here\u2019s the updated design for the landing page",
  },
  {
    name: "Bob",
    time: "2:36 PM",
    seed: "bob",
    text: "Looks good, minor feedback on the header spacing",
  },
  {
    name: "Sarah K.",
    time: "2:41 PM",
    seed: "client",
    text: "Sure, whatever works. We\u2019ve only been waiting two weeks for this.",
    role: "Client",
  },
];

interface MessageAnalysis {
  tags: { label: string; color: string }[];
  confidence: number;
  risk: { level: string; percentage: number; color: string };
  explanation: string;
}

const MESSAGE_ANALYSES: MessageAnalysis[] = [
  {
    tags: [{ label: "Informative", color: "joy" }],
    confidence: 0.94,
    risk: { level: "Low", percentage: 12, color: "accent" },
    explanation:
      "Alice shares a design update in a straightforward, professional tone. No emotional subtext detected \u2014 routine project handoff with clear intent.",
  },
  {
    tags: [
      { label: "Supportive", color: "joy" },
      { label: "Constructive", color: "accent" },
    ],
    confidence: 0.88,
    risk: { level: "Low", percentage: 8, color: "accent" },
    explanation:
      "Bob provides constructive feedback on header spacing. Tone is collaborative and solution-oriented. No underlying tension detected in word choice or phrasing.",
  },
  {
    tags: [
      { label: "Frustration 82%", color: "anger" },
      { label: "Sarcasm detected", color: "surprise" },
    ],
    confidence: 0.89,
    risk: { level: "High", percentage: 82, color: "anger" },
    explanation:
      "Client expresses disappointment over repeated delivery delays. Passive-aggressive phrasing (\u2018sure, whatever works\u2019) combined with explicit timeline frustration suggests growing dissatisfaction. Historical context shows 3 prior escalations this month.",
  },
];

const COLOR_MAP: Record<string, string> = {
  anger: "var(--color-anger)",
  joy: "var(--color-joy)",
  surprise: "var(--color-surprise)",
  accent: "var(--color-accent)",
};

const demoAmbientStyle: CSSProperties = {
  background:
    "radial-gradient(ellipse at center, color-mix(in srgb, var(--theme-accent) 6%, transparent) 0%, transparent 68%)",
};

const conversationPanelStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, color-mix(in srgb, var(--theme-surface-secondary) 92%, var(--theme-accent) 8%) 0%, color-mix(in srgb, var(--theme-bg-tertiary) 70%, var(--theme-surface) 30%) 100%)",
  boxShadow: "var(--theme-shadow-raised)",
};

const analysisPanelStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, color-mix(in srgb, var(--theme-surface) 98%, transparent) 0%, color-mix(in srgb, var(--theme-surface-secondary) 100%, transparent) 100%)",
  boxShadow: "var(--theme-shadow-raised)",
};

type Phase =
  | "analyzing"
  | "emotion"
  | "confidence"
  | "risk"
  | "typing"
  | "complete";

const MESSAGE_SCROLL_OFFSET = 16;
const MESSAGE_COUNT = MESSAGES.length;

function SentimentReveal({
  isVisible,
  analysis,
}: {
  isVisible: boolean;
  analysis: MessageAnalysis;
}) {
  const [phase, setPhase] = useState<Phase>("analyzing");
  const [confidenceValue, setConfidenceValue] = useState(0);
  const [typedText, setTypedText] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef<number | null>(null);

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (typingRef.current) {
      clearInterval(typingRef.current);
      typingRef.current = null;
    }
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isVisible) {
      clearAllTimers();
      return;
    }

    const targetConfidence = analysis.confidence;
    const explanation = analysis.explanation;
    timeoutRef.current = setTimeout(() => {
      setPhase("emotion");
      timeoutRef.current = setTimeout(() => {
        setPhase("confidence");
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / 600, 1);
          const eased = 1 - Math.pow(1 - progress, 3);

          setConfidenceValue(parseFloat((eased * targetConfidence).toFixed(2)));

          if (progress < 1) {
            frameRef.current = requestAnimationFrame(animate);
            return;
          }

          frameRef.current = null;
        };
        frameRef.current = requestAnimationFrame(animate);

        timeoutRef.current = setTimeout(() => {
          setPhase("risk");
          timeoutRef.current = setTimeout(() => {
            setPhase("typing");
            let characterIndex = 0;

            typingRef.current = setInterval(() => {
              characterIndex += 1;
              setTypedText(explanation.slice(0, characterIndex));

              if (characterIndex < explanation.length) {
                return;
              }

              if (typingRef.current) {
                clearInterval(typingRef.current);
                typingRef.current = null;
              }

              timeoutRef.current = setTimeout(() => {
                setConfidenceValue(targetConfidence);
                setTypedText(explanation);
                setPhase("complete");
              }, 500);
            }, 35);
          }, 300);
        }, 600);
      }, 700);
    }, 1200);

    return clearAllTimers;
  }, [analysis, clearAllTimers, isVisible]);

  const showEmotion = phase !== "analyzing";
  const showConfidence = ["confidence", "risk", "typing", "complete"].includes(
    phase,
  );
  const showRisk = ["risk", "typing", "complete"].includes(phase);
  const showTyping = ["typing", "complete"].includes(phase);
  const showComplete = phase === "complete";

  const riskColor = COLOR_MAP[analysis.risk.color] || "var(--color-accent)";

  return (
    <div
      className="rounded-xl border border-border-default p-6"
      style={analysisPanelStyle}
    >
      <h4 className="mb-4 font-body text-xs font-medium uppercase tracking-wider text-text-tertiary">
        PulseBoard Analysis
      </h4>

      {phase === "analyzing" && (
        <div className="space-y-3">
          <div className="h-6 w-32 rounded bg-gradient-to-r from-bg-tertiary via-border-default to-bg-tertiary bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
          <div className="h-4 w-48 rounded bg-gradient-to-r from-bg-tertiary via-border-default to-bg-tertiary bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
          <p className="font-mono text-xs text-text-tertiary">
            Processing with conversation context...
          </p>
        </div>
      )}

      <div className="space-y-4">
        {showEmotion && (
          <div className="flex flex-wrap gap-2">
            {analysis.tags.map((tag) => {
              const tagColor = COLOR_MAP[tag.color] || "var(--color-neutral)";
              return (
                <span
                  key={tag.label}
                  className="inline-block rounded-full px-3 py-1 text-sm font-medium"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${tagColor} 12%, transparent)`,
                    color: tagColor,
                  }}
                >
                  {tag.label}
                </span>
              );
            })}
          </div>
        )}

        {showConfidence && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 font-body text-xs text-text-tertiary">
                Confidence
              </p>
              <p className="font-mono text-[28px] font-bold text-text-primary">
                {confidenceValue.toFixed(2)}
              </p>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-bg-tertiary">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
                  style={{ width: `${confidenceValue * 100}%` }}
                />
              </div>
            </div>
            {showRisk && (
              <div>
                <p className="mb-1 font-body text-xs text-text-tertiary">
                  Escalation Risk
                </p>
                <span
                  className="inline-block rounded-full px-3 py-1 text-sm font-bold"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${riskColor} 12%, transparent)`,
                    color: riskColor,
                  }}
                >
                  {analysis.risk.level}
                </span>
                <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-bg-tertiary">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${analysis.risk.percentage}%`,
                      backgroundColor: riskColor,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {showTyping && (
          <div>
            <p className="mb-1 font-body text-xs text-text-tertiary">
              AI Explanation
            </p>
            <p className="font-mono text-[12px] leading-[1.7] text-text-secondary">
              {typedText}
              {phase === "typing" && (
                <span className="ml-0.5 inline-block animate-[blink_1s_infinite]">
                  |
                </span>
              )}
            </p>
          </div>
        )}

        {showComplete && (
          <p className="text-sm font-medium text-joy">
            &#10003; Analysis complete
          </p>
        )}
      </div>
    </div>
  );
}

export function ProductDemo() {
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const messageViewportRef = useRef<HTMLDivElement | null>(null);
  const messageTrackRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const hasEntered = useInView(stickyRef, { once: true, amount: 0.1 });
  const reduce = useReducedMotion();
  const [activeMessageIndex, setActiveMessageIndex] = useState(-1);
  const [revealKey, setRevealKey] = useState(0);
  const [trackAnchors, setTrackAnchors] = useState<number[]>(() =>
    MESSAGES.map(() => 0),
  );
  const prevIndexRef = useRef(-1);

  const { scrollYProgress } = useScroll({
    target: scrollWrapperRef,
    offset: ["start start", "end end"],
  });

  const measureTrackAnchors = useEffectEvent(() => {
    const viewport = messageViewportRef.current;
    const track = messageTrackRef.current;
    const rows = messageRefs.current;

    if (
      !viewport ||
      !track ||
      rows.length !== MESSAGES.length ||
      rows.some((row) => row === null)
    ) {
      return;
    }

    const maxOffset = Math.max(track.scrollHeight - viewport.clientHeight, 0);
    const nextAnchors = rows.map((row, index) => {
      if (!row || index === 0) {
        return 0;
      }

      const nextOffset = Math.min(
        Math.max(row.offsetTop - MESSAGE_SCROLL_OFFSET, 0),
        maxOffset,
      );
      return -nextOffset;
    });

    setTrackAnchors((prev) => {
      const isSame =
        prev.length === nextAnchors.length &&
        prev.every(
          (anchor, index) => Math.abs(anchor - nextAnchors[index]) < 1,
        );

      return isSame ? prev : nextAnchors;
    });
  });

  // Scroll-driven message activation
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (reduce) return;

    if (progress < 0.05) {
      if (prevIndexRef.current !== -1) {
        prevIndexRef.current = -1;
        startTransition(() => {
          setActiveMessageIndex(-1);
        });
      }
      return;
    }

    const usableProgress = Math.min((progress - 0.05) / 0.95, 1);
    const rawIndex = Math.floor(usableProgress * MESSAGE_COUNT);
    const clampedIndex = Math.min(rawIndex, MESSAGE_COUNT - 1);

    if (clampedIndex !== prevIndexRef.current) {
      prevIndexRef.current = clampedIndex;
      startTransition(() => {
        setActiveMessageIndex(clampedIndex);
        setRevealKey((prev) => prev + 1);
      });
    }
  });

  useLayoutEffect(() => {
    if (!hasEntered) return;

    const frameId = requestAnimationFrame(() => {
      measureTrackAnchors();
    });

    return () => cancelAnimationFrame(frameId);
  }, [hasEntered]);

  useEffect(() => {
    if (!hasEntered || typeof ResizeObserver === "undefined") {
      return;
    }

    const viewport = messageViewportRef.current;
    const track = messageTrackRef.current;
    const rows = messageRefs.current.filter(
      (message): message is HTMLDivElement => message !== null,
    );

    if (!viewport || !track || rows.length === 0) {
      return;
    }

    let frameId: number | null = null;
    const observer = new ResizeObserver(() => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        measureTrackAnchors();
      });
    });

    observer.observe(viewport);
    observer.observe(track);
    rows.forEach((row) => observer.observe(row));

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      observer.disconnect();
    };
  }, [hasEntered]);

  const hasPlaybackStarted = activeMessageIndex >= 0;
  const activeTrackOffset = trackAnchors[activeMessageIndex] ?? 0;

  // Reduced motion: show all analyses statically
  if (reduce) {
    return (
      <section id="product-demo" className="zone-demo relative py-32 lg:py-40">
        <div className="section-divider" />
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={demoAmbientStyle}
        />
        <Container>
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block font-mono text-xs uppercase tracking-wider text-accent">
              Live Analysis
            </span>
            <h2 className="font-sans text-2xl font-light text-text-primary md:text-[36px]">
              Watch Pulse<span className="font-black">Board</span> analyze a
              real conversation
            </h2>
            <p className="mt-3 font-body text-base text-text-secondary">
              Contextual emotion detection — not keyword matching
            </p>
          </div>
          <div className="mx-auto max-w-[1000px] space-y-8">
            {MESSAGES.map((msg, i) => (
              <div key={msg.name} className="grid gap-6 lg:grid-cols-2">
                <div
                  className="flex gap-3 rounded-xl border border-border-default p-4"
                  style={conversationPanelStyle}
                >
                  <img
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${msg.seed}&backgroundColor=transparent`}
                    alt={`${msg.name} avatar`}
                    className="h-8 w-8 flex-shrink-0 rounded-md bg-bg-tertiary"
                  />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-body text-sm font-semibold text-text-primary">
                        {msg.name}
                      </span>
                      <span className="font-mono text-[11px] text-text-tertiary">
                        {msg.time}
                      </span>
                    </div>
                    <p className="mt-0.5 font-body text-sm leading-relaxed text-text-secondary">
                      {msg.text}
                    </p>
                  </div>
                </div>
                <SentimentReveal isVisible analysis={MESSAGE_ANALYSES[i]} />
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      ref={scrollWrapperRef}
      id="product-demo"
      className="relative"
      style={{ height: "var(--demo-scroll-height)" }}
    >
      <div
        ref={stickyRef}
        className="zone-demo sticky top-0 flex h-dvh items-center"
      >
        <div className="section-divider absolute top-0 left-0 right-0" />
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={demoAmbientStyle}
        />

        <Container>
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block font-mono text-xs uppercase tracking-wider text-accent">
              Live Analysis
            </span>
            <h2 className="font-sans text-2xl font-light text-text-primary md:text-[36px]">
              Watch Pulse<span className="font-black">Board</span> analyze a
              real conversation
            </h2>
            <p className="mt-3 font-body text-base text-text-secondary">
              Contextual emotion detection — not keyword matching
            </p>
          </div>

          <div className="mx-auto grid max-w-[1000px] gap-8 lg:grid-cols-2">
            {/* Left - Slack messages */}
            <motion.div
              initial={reduce ? false : { opacity: 0, x: -20 }}
              animate={hasEntered ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="overflow-hidden rounded-xl border border-border-default"
              style={conversationPanelStyle}
            >
              {/* Slack-style gradient top line */}
              <div className="h-[2px] bg-gradient-to-r from-[#7c3aed] via-[#10b981] to-[#f43f5e]" />
              <div className="p-6">
                <div className="mb-4 flex items-center gap-2 border-b border-border-default pb-3">
                  <IconBrandSlack size={16} className="text-text-tertiary" />
                  <span className="font-body text-sm text-text-secondary">
                    # client-beta
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-text-tertiary">
                    Today
                  </span>
                </div>
                <div
                  ref={messageViewportRef}
                  className="h-[170px] overflow-hidden sm:h-[185px] lg:h-[210px]"
                >
                  <motion.div
                    ref={messageTrackRef}
                    animate={{ y: activeTrackOffset }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
                    }
                    className="relative space-y-5 pr-2 will-change-transform"
                  >
                    {MESSAGES.map((msg, i) => {
                      const isActive =
                        hasPlaybackStarted && activeMessageIndex === i;

                      return (
                        <div
                          key={msg.name}
                          ref={(node) => {
                            messageRefs.current[i] = node;
                          }}
                          className={`flex gap-3 border-l-2 pl-3 transition-all duration-500 ${
                            isActive ? "border-anger" : "border-transparent"
                          }`}
                        >
                          <img
                            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${msg.seed}&backgroundColor=transparent`}
                            alt={`${msg.name} avatar`}
                            className="h-8 w-8 flex-shrink-0 rounded-md bg-bg-tertiary"
                          />
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-body text-sm font-semibold text-text-primary">
                                {msg.name}
                              </span>
                              <span className="font-mono text-[11px] text-text-tertiary">
                                {msg.time}
                              </span>
                              {"role" in msg && msg.role && (
                                <span className="font-mono text-[9px] text-text-tertiary/50">
                                  {msg.role}
                                </span>
                              )}
                            </div>
                            <p
                              className={`mt-0.5 font-body text-sm leading-relaxed transition-colors duration-300 ${
                                isActive
                                  ? "text-text-primary"
                                  : "text-text-secondary"
                              }`}
                            >
                              {msg.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </div>

                {/* Carousel indicator */}
                <div className="mt-5 flex items-center justify-center gap-2">
                  {MESSAGES.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        hasPlaybackStarted && activeMessageIndex === i
                          ? "w-6 bg-accent"
                          : "w-1.5 bg-border-default"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right - Sentiment analysis */}
            <motion.div
              initial={reduce ? false : { opacity: 0, x: 20 }}
              animate={hasEntered ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {hasPlaybackStarted && (
                <p className="mb-3 font-mono text-[11px] text-text-tertiary">
                  Analyzing message {activeMessageIndex + 1} of{" "}
                  {MESSAGES.length}
                  <span className="ml-2 inline-block h-1 w-1 rounded-full bg-accent animate-[pulse-dot_2s_infinite]" />
                </p>
              )}
              <SentimentReveal
                key={revealKey}
                isVisible={hasPlaybackStarted}
                analysis={
                  MESSAGE_ANALYSES[
                    activeMessageIndex >= 0 ? activeMessageIndex : 0
                  ]
                }
              />
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  );
}
