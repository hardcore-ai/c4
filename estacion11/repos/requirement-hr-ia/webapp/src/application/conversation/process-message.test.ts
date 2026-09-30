import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock repositories and compliance before imports
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

function createMockConversation(phase: string): Conversation {
  return {
    conversationId: 'conv-1', campaignId: 'camp-1', candidateId: 'cand-1',
    telegramUserId: 'tg-123', telegramChatId: 123,
    telegramUserIdCampaignId: 'tg-123#camp-1',
    state: 'active',
    sessionState: { ...createInitialSessionState(), currentPhase: phase as never },
    messages: [], createdAt: '', updatedAt: '',
  };
}

const mockGenerateResponse = vi.fn().mockResolvedValue('Respuesta del agente');

function buildInput(conversation: Conversation, message: string): ProcessMessageInput {
  return {
    tenantId: 't1', conversation, message, rubric: mockRubric,
    generateAgentResponse: mockGenerateResponse,
  };
}

beforeEach(() => { vi.clearAllMocks(); });

describe('processMessage - Onboarding (US-1.1)', () => {
  it('transitions from onboarding to consent phase', async () => {
    const conv = createMockConversation('onboarding');
    const result = await processMessage(buildInput(conv, 'hola'));
    expect(result.updatedSessionState.currentPhase).toBe('consent');
    expect(result.agentResponse).toContain('inteligencia artificial');
    expect(result.agentResponse).toContain('Sí');
  });
});

describe('processMessage - Consent (US-1.2)', () => {
  it('grants consent and moves to verification', async () => {
    const conv = createMockConversation('consent');
    const result = await processMessage(buildInput(conv, 'Sí, acepto'));
    expect(result.updatedSessionState.currentPhase).toBe('verification');
  });

  it('denies consent and completes conversation', async () => {
    const conv = createMockConversation('consent');
    const result = await processMessage(buildInput(conv, 'No acepto'));
    expect(result.conversationState).toBe('completed');
    expect(result.agentResponse).toContain('éxito');
  });

  it('asks again on ambiguous response', async () => {
    const conv = createMockConversation('consent');
    const result = await processMessage(buildInput(conv, 'no sé'));
    expect(result.updatedSessionState.currentPhase).toBe('consent');
    expect(result.agentResponse).toContain('Responde');
  });
});

describe('processMessage - Screening (US-1.4, US-1.5, US-1.6)', () => {
  it('responds to AI identity question without advancing', async () => {
    const conv = createMockConversation('screening');
    conv.sessionState.currentPhase = 'screening';
    const result = await processMessage(buildInput(conv, '¿Eres IA?'));
    expect(result.agentResponse).toContain('inteligencia artificial');
    expect(result.shouldEvaluate).toBe(false);
  });

  it('handles salary question with escalation', async () => {
    const conv = createMockConversation('screening');
    conv.sessionState.currentPhase = 'screening';
    const result = await processMessage(buildInput(conv, '¿Cuánto pagan?'));
    expect(result.agentResponse).toContain('No tengo esa información');
    expect(result.escalationTriggered).toBe(true);
    expect(result.updatedSessionState.escalationCount).toBe(1);
  });

  it('escalates to Level 2 on repeated salary questions', async () => {
    const conv = createMockConversation('screening');
    conv.sessionState.currentPhase = 'screening';
    conv.sessionState.escalationCount = 1;
    const result = await processMessage(buildInput(conv, '¿Y los beneficios?'));
    expect(result.updatedSessionState.escalationCount).toBe(2);
    expect(result.agentResponse).toContain('siguiente etapa del proceso');
  });

  it('handles human contact request', async () => {
    const conv = createMockConversation('screening');
    conv.sessionState.currentPhase = 'screening';
    const result = await processMessage(buildInput(conv, 'Quiero hablar con una persona'));
    expect(result.agentResponse).toContain('notificar');
    expect(result.escalationTriggered).toBe(true);
  });
});

describe('processMessage - Closing (US-1.8)', () => {
  it('responds that interview is already complete', async () => {
    const conv = createMockConversation('closing');
    const result = await processMessage(buildInput(conv, 'otra pregunta'));
    expect(result.agentResponse).toContain('completada');
  });
});
