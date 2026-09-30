import type { Recommendation } from '@/shared/types';

export interface Evidence {
  quote: string;
  messageIndex: number;
  relevance: string;
}

export interface CompetencyScore {
  competencyId: string;
  competencyName: string;
  score: number;
  weight: number;
  evidence: Evidence[];
  justification: string;
}

export interface Evaluation {
  conversationId: string;
  campaignId: string;
  candidateId: string;
  globalScore: number;
  recommendation: Recommendation;
  competencyScores: CompetencyScore[];
  keySignals: string[];
  generatedAt: string;
}
