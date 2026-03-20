import type { SentimentSnapshot, ChannelHealth, HealthCounts } from '../types/channel';

/**
 * Derive channel health from a composite of three signal tiers:
 *
 *   Tier 1 (heaviest): Active alerts — concrete unresolved problems
 *   Tier 2 (medium):   Flagged messages — volume of concerning content
 *   Tier 3 (lightest):  Emotion distribution — background tone / tiebreaker
 */
export function deriveHealth(snapshot: SentimentSnapshot, counts?: HealthCounts): ChannelHealth {
  const c = counts ?? {
    openAlertCount: 0,
    highSeverityAlertCount: 0,
    flaggedMessageCount: 0,
    highRiskMessageCount: 0,
  };

  // Tier 1: Alerts (heaviest signal)
  if (c.highSeverityAlertCount >= 3) return 'at-risk';
  if (c.highSeverityAlertCount >= 1 || c.openAlertCount >= 5) return 'attention';

  // Tier 2: Flagged messages
  if (c.highRiskMessageCount >= 3) return 'at-risk';
  if (c.flaggedMessageCount >= 10) return 'attention';

  // Tier 3: Snapshot emotion data
  if (snapshot.highRiskCount > 0) return 'at-risk';
  if (snapshot.totalAnalyzed === 0) return 'healthy';

  const total = Object.values(snapshot.emotionDistribution).reduce((a, b) => a + b, 0) || 1;
  const negativeRatio =
    ((snapshot.emotionDistribution.anger ?? 0) +
     (snapshot.emotionDistribution.sadness ?? 0) +
     (snapshot.emotionDistribution.fear ?? 0) +
     (snapshot.emotionDistribution.disgust ?? 0)) / total;

  if (negativeRatio > 0.3) return 'at-risk';
  if (negativeRatio > 0.15 || c.openAlertCount >= 2 || c.flaggedMessageCount >= 5) return 'attention';

  return 'healthy';
}
