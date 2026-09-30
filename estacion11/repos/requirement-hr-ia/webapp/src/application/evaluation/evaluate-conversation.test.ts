import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/infrastructure/dynamodb/repositories', () => ({
  conversationRepository: {
    findById: vi.fn(),
  },
  evaluationRepository: {
    save: vi.fn(),
  },
  candidateRepository: {
    updateState: vi.fn(),
  },
  auditEventRepository: { append: vi.fn() },
}));

import { evaluateConversation } from './evaluate-conversation';
import { conversationRepository, evaluationRepository, candidateRepository } from '@/infrastructure/dynamodb/repositories';
import type { Rubric } from '@/domain/evaluation/entities/rubric';

const mockRubric: Rubric = {
  rubricId: 'r1', tenantId: 't1', name: 'Test', template: 'bpo', createdAt: '',
  competencies: [
    { competencyId: 'c1', name: 'Comunicación', description: 'd', weight: 0.5, sampleQuestion: 'q', criteria: { 1: '', 2: '', 3: '', 4: '', 5: '' } },
    { competencyId: 'c2', name: 'Resolución', description: 'd', weight: 0.5, sampleQuestion: 'q', criteria: { 1: '', 2: '', 3: '', 4: '', 5: '' } },
  ],
};

const mockConversation: import('@/domain/conversation/entities/conversation').Conversation = {
  conversationId: 'conv-1', campaignId: 'camp-1', candidateId: 'cand-1',
  telegramUserId: 'tg-1', telegramChatId: 1,
  telegramUserIdCampaignId: 'tg-1#camp-1',
  state: 'completed', sessionState: { currentPhase: 'closing', competenciesCovered: [], followUpAsked: false, questionsAsked: 0, verificationResults: {}, escalationCount: 0, lastActivityAt: '' },
  messages: [
    { messageId: 'm1', role: 'agent', content: 'Cuéntame...', timestamp: '', phase: 'screening' },
    { messageId: 'm2', role: 'candidate', content: 'En mi trabajo anterior...', timestamp: '', phase: 'screening' },
  ],
  createdAt: '', updatedAt: '',
};

const mockEvaluatorResult = {
  competencyScores: [
    { competencyId: 'c1', competencyName: 'Comunicación', score: 4, weight: 0.5, evidence: [{ quote: 'En mi trabajo anterior...', messageIndex: 1, relevance: 'Demuestra claridad' }], justification: 'Buena comunicación' },
    { competencyId: 'c2', competencyName: 'Resolución', score: 3, weight: 0.5, evidence: [{ quote: 'Resolví el problema...', messageIndex: 1, relevance: 'Proceso metódico' }], justification: 'Adecuada' },
  ],
  keySignals: ['Buena comunicación verbal', 'Experiencia limitada en resolución de conflictos'],
};

beforeEach(() => { vi.clearAllMocks(); });

describe('evaluateConversation (US-2.3)', () => {
  it('generates evaluation with correct global score and recommendation', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(mockConversation);

    const evaluation = await evaluateConversation({
      tenantId: 't1',
      conversationId: 'conv-1',
      rubric: mockRubric,
      runEvaluatorPrompt: vi.fn().mockResolvedValue(mockEvaluatorResult),
    });

    // (4 * 0.5 + 3 * 0.5) = 3.5
    expect(evaluation.globalScore).toBe(3.5);
    expect(evaluation.recommendation).toBe('recommended');
    expect(evaluation.competencyScores).toHaveLength(2);
    expect(evaluation.keySignals).toHaveLength(2);
    expect(evaluation.generatedAt).toBeTruthy();
  });

  it('ensures every competency score has evidence', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(mockConversation);

    const evaluation = await evaluateConversation({
      tenantId: 't1',
      conversationId: 'conv-1',
      rubric: mockRubric,
      runEvaluatorPrompt: vi.fn().mockResolvedValue(mockEvaluatorResult),
    });

    for (const cs of evaluation.competencyScores) {
      expect(cs.evidence.length).toBeGreaterThanOrEqual(1);
      expect(cs.evidence[0].quote).toBeTruthy();
    }
  });

  it('saves evaluation to repository', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(mockConversation);

    await evaluateConversation({
      tenantId: 't1',
      conversationId: 'conv-1',
      rubric: mockRubric,
      runEvaluatorPrompt: vi.fn().mockResolvedValue(mockEvaluatorResult),
    });

    expect(evaluationRepository.save).toHaveBeenCalledWith('t1', expect.objectContaining({
      conversationId: 'conv-1',
      globalScore: 3.5,
      recommendation: 'recommended',
    }));
  });

  it('updates candidate state to pending_review', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(mockConversation);

    await evaluateConversation({
      tenantId: 't1',
      conversationId: 'conv-1',
      rubric: mockRubric,
      runEvaluatorPrompt: vi.fn().mockResolvedValue(mockEvaluatorResult),
    });

    expect(candidateRepository.updateState).toHaveBeenCalledWith('t1', 'cand-1', 'pending_review');
  });

  it('throws when conversation not found', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(null);

    await expect(evaluateConversation({
      tenantId: 't1',
      conversationId: 'conv-x',
      rubric: mockRubric,
      runEvaluatorPrompt: vi.fn(),
    })).rejects.toThrow('Conversation conv-x not found');
  });

  it('determines highly_recommended for score >= 4.0', async () => {
    vi.mocked(conversationRepository.findById).mockResolvedValue(mockConversation);

    const highScoreResult = {
      competencyScores: [
        { competencyId: 'c1', competencyName: 'Comunicación', score: 5, weight: 0.5, evidence: [{ quote: 'q', messageIndex: 0, relevance: 'r' }], justification: 'j' },
        { competencyId: 'c2', competencyName: 'Resolución', score: 4, weight: 0.5, evidence: [{ quote: 'q', messageIndex: 0, relevance: 'r' }], justification: 'j' },
      ],
      keySignals: ['Excelente'],
    };

    const evaluation = await evaluateConversation({
      tenantId: 't1',
      conversationId: 'conv-1',
      rubric: mockRubric,
      runEvaluatorPrompt: vi.fn().mockResolvedValue(highScoreResult),
    });

    expect(evaluation.globalScore).toBe(4.5);
    expect(evaluation.recommendation).toBe('highly_recommended');
  });
});
