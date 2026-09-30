import type { AuditEventType } from '@/shared/types';

export interface AuditEvent {
  eventId: string;
  eventType: AuditEventType;
  entityId: string;
  entityType: 'conversation' | 'candidate' | 'evaluation' | 'campaign';
  details: Record<string, unknown>;
  actorId: string;
  actorType: 'system' | 'recruiter' | 'candidate';
  timestamp: string;
}
