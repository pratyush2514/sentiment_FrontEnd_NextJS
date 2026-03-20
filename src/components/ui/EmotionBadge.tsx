import { getEmotionColor, colorMixBg } from "@/lib/utils/emotionColor";
import type { Emotion } from "@/lib/types";

interface EmotionBadgeProps {
  emotion: Emotion;
  size?: "sm" | "md";
  className?: string;
}

export function EmotionBadge({ emotion, size = "sm", className = "" }: EmotionBadgeProps) {
  const color = getEmotionColor(emotion);
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const padding = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-medium capitalize ${textSize} ${padding} ${className}`}
      style={{
        color,
        backgroundColor: colorMixBg(color, 10),
      }}
    >
      {emotion}
    </span>
  );
}
