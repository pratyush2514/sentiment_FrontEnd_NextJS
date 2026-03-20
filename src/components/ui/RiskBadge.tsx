import { getRiskColor, colorMixBg } from "@/lib/utils/emotionColor";
import type { EscalationRisk } from "@/lib/types";

interface RiskBadgeProps {
  risk: EscalationRisk;
  className?: string;
}

const RISK_LABELS: Record<EscalationRisk, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function RiskBadge({ risk, className = "" }: RiskBadgeProps) {
  const color = getRiskColor(risk);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${className}`}
      style={{
        color,
        backgroundColor: colorMixBg(color, 10),
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {RISK_LABELS[risk]}
    </span>
  );
}
