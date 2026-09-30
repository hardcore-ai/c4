import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/infrastructure/dynamodb/repositories', () => ({
  candidateRepository: {
    findById: vi.fn(),
    updateState: vi.fn(),
  },
  evaluationRepository: {
    findByConversation: vi.fn(),
  },
  auditEventRepository: { append: vi.fn() },
}));

import { reviewCandidate } from './review-candidate';
import { candidateRepository, evaluationRepository } from '@/infrastructure/dynamodb/repositories';

const mockCandidate = {
  candidateId: 'cand-1', telegramUserId: 'tg-1', telegramChatId: 1,
  campaignId: 'camp-1', conversationId: 'conv-1', state: 'pending_review' as const,
  createdAt: '', updatedAt: '',
};

const mockEvaluation = {
  conversationId: 'conv-1', campaignId: 'camp-1', candidateId: 'cand-1',
  globalScore: 4.2, recommendation: 'highly_recommended' as const,
  competencyScores: [], keySignals: [], generatedAt: '',
};

beforeEach(() => { vi.clearAllMocks(); });

describe('reviewCandidate (US-3.3)', () => {
  it('approves a candidate successfully when decision aligns', async () => {
    vi.mocked(candidateRepository.findById).mockResolvedValue(mockCandidate);
    vi.mocked(evaluationRepository.findByConversation).mockResolvedValue(mockEvaluation);

    await expect(reviewCandidate({
      tenantId: 't1', candidateId: 'cand-1', reviewerId: 'rec-1', decision: 'approved',
    })).resolves.toBeUndefined();

    expect(candidateRepository.updateState).toHaveBeenCalledWith('t1', 'cand-1', 'approved', expect.objectContaining({
      reviewDecision: expect.objectContaining({ decision: 'approved', disagreesWithAI: false }),
    }));
  });

  it('rejects when disagreement reason is missing and decision differs', async () => {
    vi.mocked(candidateRepository.findById).mockResolvedValue(mockCandidate);
    vi.mocked(evaluationRepository.findByConversation).mockResolvedValue(mockEvaluation);

    await expect(reviewCandidate({
      tenantId: 't1', candidateId: 'cand-1', reviewerId: 'rec-1', decision: 'rejected',
    })).rejects.toThrow('Disagreement reason is required');
  });

  it('allows rejection with disagreement reason', async () => {
    vi.mocked(candidateRepository.findById).mockResolvedValue(mockCandidate);
    vi.mocked(evaluationRepository.findByConversation).mockResolvedValue(mockEvaluation);

    await expect(reviewCandidate({
      tenantId: 't1', candidateId: 'cand-1', reviewerId: 'rec-1', decision: 'rejected',
      disagreementReason: 'No tiene experiencia suficiente',
    })).resolves.toBeUndefined();

    expect(candidateRepository.updateState).toHaveBeenCalledWith('t1', 'cand-1', 'rejected', expect.objectContaining({
      reviewDecision: expect.objectContaining({ disagreesWithAI: true, disagreementReason: 'No tiene experiencia suficiente' }),
    }));
  });

  it('throws if candidate not found', async () => {
    vi.mocked(candidateRepository.findById).mockResolvedValue(null);
    await expect(reviewCandidate({
      tenantId: 't1', candidateId: 'cand-x', reviewerId: 'rec-1', decision: 'approved',
    })).rejects.toThrow('Candidate not found');
  });

  it('throws if candidate is not in pending_review state', async () => {
    vi.mocked(candidateRepository.findById).mockResolvedValue({ ...mockCandidate, state: 'in_screening' });
    await expect(reviewCandidate({
      tenantId: 't1', candidateId: 'cand-1', reviewerId: 'rec-1', decision: 'approved',
    })).rejects.toThrow('Cannot review candidate in state');
  });
});
