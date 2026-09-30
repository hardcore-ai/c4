import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/infrastructure/dynamodb/repositories', () => ({
  conversationRepository: {
    addMessage: vi.fn(),
    updateSessionState: vi.fn(),
  },
  consentRepository: { save: vi.fn() },
  auditEventRepository: { append: vi.fn() },
}));

import { processMessage, type ProcessMessageInput } from './process-message';
import type { Conversation } from '@/domain/conversation/entities/conversation';
import type { Rubric } from '@/domain/evaluation/entities/rubric';
import { createInitialSessionState } from '@/domain/conversation/rules/conversation-rules';

const mockRubric: Rubric = {
  rubricId: 'r1', tenantId: 't1', name: 'Test', template: 'bpo', createdAt: '',
  competencies: [
    { competencyId: 'c1', name: 'Comm', description: 'd', weight: 0.5, sampleQuestion: 'q', criteria: { 1: '', 2: '', 3: '', 4: '', 5: '' } },
    { competencyId: 'c2', name: 'Problem', description: 'd', weight: 0.5, sampleQuestion: 'q', criteria: { 1: '', 2: '', 3: '', 4: '', 5: '' } },
  ],
};

const mockGenerateResponse = vi.fn().mockResolvedValue('Pregunta de screening del agente');

function createConversationAtPhase(phase: string): Conversation {
  return {
    conversationId: 'conv-1', campaignId: 'camp-1', candidateId: 'cand-1',
    telegramUserId: 'tg-123', telegramChatId: 123,
    telegramUserIdCampaignId: 'tg-123#camp-1',
    state: 'active',
    sessionState: { ...createInitialSessionState(), currentPhase: phase as never },
    messages: [], createdAt: '', updatedAt: '',
  };
}

function buildInput(conversation: Conversation, message: string): ProcessMessageInput {
  return {
    tenantId: 't1', conversation, message, rubric: mockRubric,
    generateAgentResponse: mockGenerateResponse,
  };
}

beforeEach(() => { vi.clearAllMocks(); });

describe('processMessage - Verification Phase (US-1.3)', () => {
  it('passes verification and transitions to screening phase', async () => {
    const conv = createConversationAtPhase('verification');
    const result = await processMessage(buildInput(conv, 'Sí, tengo disponibilidad completa'));

    expect(result.updatedSessionState.currentPhase).toBe('screening');
    expect(mockGenerateResponse).toHaveBeenCalled();
  });

  it('sets first competency when entering screening', async () => {
    const conv = createConversationAtPhase('verification');
    const result = await processMessage(buildInput(conv, 'Disponible'));

    expect(result.updatedSessionState.currentCompetencyId).toBe('c1');
    expect(result.updatedSessionState.followUpAsked).toBe(false);
  });

  it('calls OpenAI to generate first screening question', async () => {
    const conv = createConversationAtPhase('verification');
    await processMessage(buildInput(conv, 'Listo para comenzar'));

    expect(mockGenerateResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        systemPrompt: expect.stringContaining('entrevistador'),
        sessionState: expect.objectContaining({ currentPhase: 'screening' }),
      })
    );
  });
});
