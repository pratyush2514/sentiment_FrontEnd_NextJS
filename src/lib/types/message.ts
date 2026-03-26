export type AnalysisStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "skipped";
export type AnalysisEligibility =
  | "eligible"
  | "not_candidate"
  | "policy_suppressed"
  | "privacy_suppressed";
export type AnalysisExecution =
  | "not_run"
  | "pending"
  | "processing"
  | "completed"
  | "failed";
export type AnalysisQuality = "none" | "fallback" | "partial" | "verified";
export type AnalysisSuppressionReason =
  | "channel_not_ready"
  | "cooldown"
  | "importance_tier"
  | "privacy_skip"
  | "budget_exceeded"
  | "not_candidate";
