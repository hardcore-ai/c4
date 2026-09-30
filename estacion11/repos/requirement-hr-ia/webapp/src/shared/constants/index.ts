export const RECOMMENDATION_THRESHOLDS = {
  HIGHLY_RECOMMENDED: 4.0,
  RECOMMENDED: 3.0,
} as const;

export const CONVERSATION_LIMITS = {
  MAX_FOLLOWUPS_PER_COMPETENCY: 1,
  INACTIVITY_PAUSE_MINUTES: 5,
  REENGAGEMENT_24H: 24 * 60,
  REENGAGEMENT_48H: 48 * 60,
  ABANDON_72H: 72 * 60,
  SLIDING_WINDOW_MESSAGES: 10,
} as const;

export const OPENAI_CONFIG = {
  RETRY_DELAY_MS: 3000,
  MAX_RETRIES: 1,
  TIMEOUT_MS: 15000,
  CONVERSATION_MODEL: 'gpt-4o',
  EVALUATOR_MODEL: 'gpt-4o',
} as const;

export const DYNAMODB_TABLES = {
  CONVERSATIONS: 'conversations',
  CAMPAIGNS: 'campaigns',
  CANDIDATES: 'candidates',
  EVALUATIONS: 'evaluations',
  AUDIT_EVENTS: 'audit-events',
  CONSENT: 'consent',
} as const;

export function getTableName(table: string): string {
  const prefix = process.env.DYNAMODB_TABLE_PREFIX || 'entrevista-dev';
  return `${prefix}-${table}`;
}
