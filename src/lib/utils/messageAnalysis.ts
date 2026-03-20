import type { ThreadMessage } from "@/lib/types";

export function hasAnalysisPayload(message: ThreadMessage): boolean {
  return Boolean(
    message.emotion ||
      message.explanation ||
      typeof message.confidence === "number" ||
      message.escalationRisk ||
      message.sarcasmDetected ||
      message.behavioralPattern,
  );
}

export function needsPerMessageAnalysis(message: ThreadMessage): boolean {
  if (message.triage?.signalType === "operational_incident") {
    return false;
  }

  if (message.analysisStatus === "failed") {
    return true;
  }

  if (message.analysisStatus === "completed") {
    return !hasAnalysisPayload(message);
  }

  return message.analysisStatus === "pending";
}
