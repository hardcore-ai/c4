import type { SessionState } from '../entities/conversation';
import type { Rubric } from '@/domain/evaluation/entities/rubric';
import { CONVERSATION_LIMITS } from '@/shared/constants';

const AFFIRMATIVE_RESPONSES = ['sí', 'si', 'acepto', 'de acuerdo', 'ok', 'vale', 'claro', 'por supuesto'];
const NEGATIVE_RESPONSES = ['no acepto', 'no quiero', 'rechazo', 'declino', 'no deseo', 'no estoy de acuerdo'];
const NEGATIVE_EXACT = ['no'];

export function isAffirmativeConsent(response: string): boolean {
  const normalized = response.trim().toLowerCase();
  return AFFIRMATIVE_RESPONSES.some((word) => normalized.includes(word));
}

export function isNegativeConsent(response: string): boolean {
  const normalized = response.trim().toLowerCase();
  // Check exact match for short negatives like "no"
  if (NEGATIVE_EXACT.includes(normalized)) return true;
  // Check phrase-based negatives
  return NEGATIVE_RESPONSES.some((phrase) => normalized.includes(phrase));
}

export function canProceedToScreening(consentGranted: boolean, requirementsMet: boolean): boolean {
  return consentGranted && requirementsMet;
}

export function shouldAskFollowUp(sessionState: SessionState): boolean {
  return !sessionState.followUpAsked;
}

export function getNextCompetency(sessionState: SessionState, rubric: Rubric): string | null {
  const uncovered = rubric.competencies.find(
    (c) => !sessionState.competenciesCovered.includes(c.competencyId)
  );
  return uncovered?.competencyId ?? null;
}

export function isScreeningComplete(sessionState: SessionState, rubric: Rubric): boolean {
  return rubric.competencies.every((c) =>
    sessionState.competenciesCovered.includes(c.competencyId)
  );
}

export function getInactivityAction(lastActivityAt: string): 'none' | '5min' | '24h' | '48h' | '72h_abandon' {
  const now = Date.now();
  const last = new Date(lastActivityAt).getTime();
  const minutesElapsed = Math.floor((now - last) / (1000 * 60));

  if (minutesElapsed >= CONVERSATION_LIMITS.ABANDON_72H) return '72h_abandon';
  if (minutesElapsed >= CONVERSATION_LIMITS.REENGAGEMENT_48H) return '48h';
  if (minutesElapsed >= CONVERSATION_LIMITS.REENGAGEMENT_24H) return '24h';
  if (minutesElapsed >= CONVERSATION_LIMITS.INACTIVITY_PAUSE_MINUTES) return '5min';
  return 'none';
}

export function isAIIdentityQuestion(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  const patterns = [
    'eres ia', 'eres una ia', 'eres un bot', 'eres un robot',
    'eres inteligencia artificial', 'eres humano', 'eres una persona',
    'hablo con una persona', 'hablo con un humano',
  ];
  return patterns.some((p) => normalized.includes(p));
}

export function isHumanRequestMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  const patterns = [
    'hablar con una persona', 'hablar con un humano', 'hablar con alguien',
    'quiero hablar con', 'necesito hablar con', 'contactar a alguien',
    'persona real', 'humano real', 'agente real',
  ];
  return patterns.some((p) => normalized.includes(p));
}

export function isSalaryOrBenefitsQuestion(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  const patterns = [
    'salario', 'sueldo', 'pago', 'compensación', 'compensacion',
    'beneficios', 'prestaciones', 'cuánto pagan', 'cuanto pagan',
    'cuánto ganaré', 'cuanto ganare', 'remuneración', 'remuneracion',
  ];
  return patterns.some((p) => normalized.includes(p));
}

export function createInitialSessionState(): SessionState {
  return {
    currentPhase: 'onboarding',
    competenciesCovered: [],
    currentCompetencyId: undefined,
    followUpAsked: false,
    questionsAsked: 0,
    verificationResults: {},
    escalationCount: 0,
    lastActivityAt: new Date().toISOString(),
  };
}
