import type { CandidateState } from '@/shared/types';

export interface ReviewDecision {
  decision: 'approved' | 'rejected';
  reviewerId: string;
  reason?: string;
  disagreesWithAI: boolean;
  disagreementReason?: string;
  decidedAt: string;
}

export interface Candidate {
  candidateId: string;
  telegramUserId: string;
  telegramChatId: number;
  campaignId: string;
  conversationId?: string;
  name?: string;
  state: CandidateState;
  reviewDecision?: ReviewDecision;
  createdAt: string;
  updatedAt: string;
}
