import type { Emotion, EscalationRisk } from '../types/sentiment';
import type { ChannelHealth } from '../types/channel';

// ─── Emotion → Color Mapping ─────────────────────────────────────────────
// Uses CSS custom properties so colors adapt to light/dark theme automatically.

const EMOTION_COLORS: Record<Emotion, { token: string; cssVar: string }> = {
  anger:    { token: 'anger',    cssVar: 'var(--color-anger)' },
  joy:      { token: 'joy',      cssVar: 'var(--color-joy)' },
  sadness:  { token: 'sadness',  cssVar: 'var(--color-sadness)' },
  neutral:  { token: 'neutral',  cssVar: 'var(--color-neutral)' },
  fear:     { token: 'fear',     cssVar: 'var(--color-fear)' },
  surprise: { token: 'surprise', cssVar: 'var(--color-surprise)' },
  disgust:  { token: 'neutral',  cssVar: 'var(--color-neutral)' },
};

export function getEmotionColor(emotion: Emotion): string {
  return EMOTION_COLORS[emotion]?.cssVar ?? 'var(--color-neutral)';
}

// ─── Risk → Color Mapping ────────────────────────────────────────────────

const RISK_COLORS: Record<EscalationRisk, string> = {
  low: 'var(--color-positive)',
  medium: 'var(--color-warning)',
  high: 'var(--color-error)',
};

export function getRiskColor(risk: EscalationRisk): string {
  return RISK_COLORS[risk];
}

// ─── Health → Color Mapping ──────────────────────────────────────────────

const HEALTH_COLORS: Record<ChannelHealth, string> = {
  healthy: 'var(--color-positive)',
  attention: 'var(--color-warning)',
  'at-risk': 'var(--color-error)',
};

export function getHealthColor(health: ChannelHealth): string {
  return HEALTH_COLORS[health];
}

const INACTIVE_COLOR = 'var(--color-neutral)';

export function getChannelDotColor(status: string, health: ChannelHealth): string {
  if (status !== 'ready') return INACTIVE_COLOR;
  return HEALTH_COLORS[health] ?? HEALTH_COLORS.healthy;
}

/** Build a `color-mix()` background string at a given opacity percent. */
export function colorMixBg(cssColor: string, percent: number = 10): string {
  return `color-mix(in srgb, ${cssColor} ${percent}%, transparent)`;
}
