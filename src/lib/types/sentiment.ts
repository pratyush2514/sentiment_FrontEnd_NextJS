// ─── Emotion & Sentiment Types ───────────────────────────────────────────

export type Emotion =
  | 'anger'
  | 'joy'
  | 'sadness'
  | 'neutral'
  | 'fear'
  | 'surprise'
  | 'disgust';

export type EscalationRisk = 'low' | 'medium' | 'high';

export type SentimentTrajectory = 'improving' | 'stable' | 'deteriorating';

export type InteractionTone =
  | 'collaborative'
  | 'corrective'
  | 'tense'
  | 'confrontational'
  | 'dismissive'
  | 'neutral';

export interface MessageAnalysis {
  messageTs: string;
  dominantEmotion: Emotion;
  confidence: number;
  escalationRisk: EscalationRisk;
  sarcasmDetected: boolean;
  themes: string[];
  explanation: string;
  triggerPhrases?: string[];
  llmProvider: string;
  llmModel: string;
  interactionTone?: InteractionTone | null;
  messageIntent?: 'request' | 'question' | 'decision' | 'commitment' | 'blocker' | 'escalation' | 'fyi' | 'acknowledgment' | null;
  isActionable?: boolean | null;
  isBlocking?: boolean;
  urgencyLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface ThreadAnalysis {
  threadTs: string;
  threadSentiment: Emotion;
  sentimentTrajectory: SentimentTrajectory;
  summary: string;
  messageCount: number;
  participantCount: number;
  openQuestions?: string[];
  interactionTone?: InteractionTone | null;
}

export interface TimelineDataPoint {
  timestamp: string;
  joy: number;
  neutral: number;
  anger: number;
  disgust: number;
  sadness: number;
  fear: number;
  surprise: number;
  total: number;
  highRiskCount: number;
  avgConfidence: number;
}

export interface TrendDataPoint {
  date: string;
  avgSentiment: number;
  escalationCount: number;
  messageVolume: number;
}
