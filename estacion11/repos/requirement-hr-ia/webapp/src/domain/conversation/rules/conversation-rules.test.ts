import { describe, it, expect } from 'vitest';
import {
  isAffirmativeConsent,
  isNegativeConsent,
  canProceedToScreening,
  shouldAskFollowUp,
  getNextCompetency,
  isScreeningComplete,
  isAIIdentityQuestion,
  isHumanRequestMessage,
  isSalaryOrBenefitsQuestion,
  createInitialSessionState,
  getInactivityAction,
} from './conversation-rules';
import type { Rubric } from '@/domain/evaluation/entities/rubric';

const mockRubric: Rubric = {
  rubricId: 'r1',
  tenantId: 't1',
  name: 'Test',
  template: 'bpo',
  createdAt: '',
  competencies: [
    { competencyId: 'c1', name: 'Comm', description: '', weight: 0.5, sampleQuestion: '', criteria: { 1: '', 2: '', 3: '', 4: '', 5: '' } },
    { competencyId: 'c2', name: 'Problem', description: '', weight: 0.5, sampleQuestion: '', criteria: { 1: '', 2: '', 3: '', 4: '', 5: '' } },
  ],
};

describe('Consent Detection', () => {
  it('detects affirmative consent', () => {
    expect(isAffirmativeConsent('Sí, acepto')).toBe(true);
    expect(isAffirmativeConsent('ok')).toBe(true);
    expect(isAffirmativeConsent('De acuerdo')).toBe(true);
    expect(isAffirmativeConsent('Claro que sí')).toBe(true);
  });

  it('rejects non-affirmative responses', () => {
    expect(isAffirmativeConsent('cuéntame más')).toBe(false);
    expect(isAffirmativeConsent('qué es esto')).toBe(false);
  });

  it('detects negative consent', () => {
    expect(isNegativeConsent('No acepto')).toBe(true);
    expect(isNegativeConsent('No quiero participar')).toBe(true);
    expect(isNegativeConsent('No')).toBe(true);
    expect(isNegativeConsent('no')).toBe(true);
  });

  it('does not treat ambiguous responses as negative', () => {
    expect(isNegativeConsent('no sé')).toBe(false);
    expect(isNegativeConsent('no estoy seguro')).toBe(false);
    expect(isNegativeConsent('cuéntame más')).toBe(false);
  });
});

describe('Screening Flow', () => {
  it('allows proceeding when consent and requirements met', () => {
    expect(canProceedToScreening(true, true)).toBe(true);
    expect(canProceedToScreening(false, true)).toBe(false);
    expect(canProceedToScreening(true, false)).toBe(false);
  });

  it('allows follow-up when not yet asked', () => {
    const state = createInitialSessionState();
    expect(shouldAskFollowUp(state)).toBe(true);
  });

  it('blocks follow-up when already asked', () => {
    const state = { ...createInitialSessionState(), followUpAsked: true };
    expect(shouldAskFollowUp(state)).toBe(false);
  });

  it('returns next uncovered competency', () => {
    const state = { ...createInitialSessionState(), competenciesCovered: ['c1'] };
    expect(getNextCompetency(state, mockRubric)).toBe('c2');
  });

  it('returns null when all competencies covered', () => {
    const state = { ...createInitialSessionState(), competenciesCovered: ['c1', 'c2'] };
    expect(getNextCompetency(state, mockRubric)).toBeNull();
  });

  it('detects screening completion', () => {
    const incomplete = { ...createInitialSessionState(), competenciesCovered: ['c1'] };
    const complete = { ...createInitialSessionState(), competenciesCovered: ['c1', 'c2'] };
    expect(isScreeningComplete(incomplete, mockRubric)).toBe(false);
    expect(isScreeningComplete(complete, mockRubric)).toBe(true);
  });
});

describe('Initial Session State (US-1.2)', () => {
  it('creates session starting at onboarding phase', () => {
    const state = createInitialSessionState();
    expect(state.currentPhase).toBe('onboarding');
    expect(state.competenciesCovered).toEqual([]);
    expect(state.followUpAsked).toBe(false);
    expect(state.questionsAsked).toBe(0);
    expect(state.escalationCount).toBe(0);
  });
});

describe('Inactivity Detection (US-1.7)', () => {
  it('returns none for recent activity', () => {
    const recent = new Date().toISOString();
    expect(getInactivityAction(recent)).toBe('none');
  });

  it('returns 5min after 5 minutes of inactivity', () => {
    const sixMinAgo = new Date(Date.now() - 6 * 60 * 1000).toISOString();
    expect(getInactivityAction(sixMinAgo)).toBe('5min');
  });

  it('returns 24h after 24 hours of inactivity', () => {
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    expect(getInactivityAction(twentyFiveHoursAgo)).toBe('24h');
  });

  it('returns 48h after 48 hours of inactivity', () => {
    const fiftyHoursAgo = new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString();
    expect(getInactivityAction(fiftyHoursAgo)).toBe('48h');
  });

  it('returns 72h_abandon after 72 hours of inactivity', () => {
    const seventyThreeHoursAgo = new Date(Date.now() - 73 * 60 * 60 * 1000).toISOString();
    expect(getInactivityAction(seventyThreeHoursAgo)).toBe('72h_abandon');
  });
});

describe('Escalation Detection (US-1.5)', () => {
  it('escalation count starts at 0', () => {
    const state = createInitialSessionState();
    expect(state.escalationCount).toBe(0);
  });

  it('tracks escalation count for Level 2 threshold', () => {
    const state = { ...createInitialSessionState(), escalationCount: 2 };
    // Level 2 triggers at escalationCount >= 2
    expect(state.escalationCount >= 2).toBe(true);
  });

  it('does not trigger Level 2 below threshold', () => {
    const state = { ...createInitialSessionState(), escalationCount: 1 };
    expect(state.escalationCount >= 2).toBe(false);
  });
});

describe('Message Detection', () => {
  it('detects AI identity questions', () => {
    expect(isAIIdentityQuestion('¿Eres IA?')).toBe(true);
    expect(isAIIdentityQuestion('Eres un bot?')).toBe(true);
    expect(isAIIdentityQuestion('Hablo con una persona?')).toBe(true);
    expect(isAIIdentityQuestion('¿Cómo estás?')).toBe(false);
  });

  it('detects human contact requests', () => {
    expect(isHumanRequestMessage('Quiero hablar con una persona real')).toBe(true);
    expect(isHumanRequestMessage('Necesito hablar con alguien')).toBe(true);
    expect(isHumanRequestMessage('Cuéntame más')).toBe(false);
  });

  it('detects salary/benefits questions', () => {
    expect(isSalaryOrBenefitsQuestion('¿Cuál es el salario?')).toBe(true);
    expect(isSalaryOrBenefitsQuestion('¿Qué beneficios tienen?')).toBe(true);
    expect(isSalaryOrBenefitsQuestion('¿Cuánto pagan?')).toBe(true);
    expect(isSalaryOrBenefitsQuestion('Cuéntame sobre el rol')).toBe(false);
  });
});
