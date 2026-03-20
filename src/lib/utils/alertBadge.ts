import { getEmotionColor, getRiskColor, colorMixBg } from "./emotionColor";
import type { DashboardAlert } from "@/lib/types";
import type { Emotion } from "@/lib/types/sentiment";

export const EMOTION_LABELS: Record<string, string> = {
  anger: "Anger",
  joy: "Joy",
  sadness: "Sadness",
  neutral: "Neutral",
  fear: "Fear",
  surprise: "Surprise",
  disgust: "Disgust",
};

export interface AlertBadgeData {
  label: string;
  color: string;
  bg: string;
}

export function getAlertBadge(alert: DashboardAlert): AlertBadgeData {
  const metaEmotion = alert.metadata?.emotion as Emotion | undefined;
  if (metaEmotion && EMOTION_LABELS[metaEmotion]) {
    const color = getEmotionColor(metaEmotion);
    return { label: EMOTION_LABELS[metaEmotion], color, bg: colorMixBg(color, 12) };
  }

  const riskColor = getRiskColor(alert.severity);
  const severityLabels: Record<string, string> = {
    high: "High risk",
    medium: "Medium risk",
    low: "Low risk",
  };
  return {
    label: severityLabels[alert.severity] ?? "Alert",
    color: riskColor,
    bg: colorMixBg(riskColor, 12),
  };
}
