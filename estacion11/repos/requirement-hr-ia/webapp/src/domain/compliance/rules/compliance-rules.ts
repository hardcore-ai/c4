import type { AuditEventType } from '@/shared/types';
import type { AuditEvent } from '../entities/audit-event';
import { generateId, generateEventId } from '@/shared/utils/id';
import { nowISO } from '@/shared/utils/date';

export function createAuditEvent(params: {
  eventType: AuditEventType;
  entityId: string;
  entityType: AuditEvent['entityType'];
  actorId: string;
  actorType: AuditEvent['actorType'];
  details?: Record<string, unknown>;
}): AuditEvent {
  return {
    eventId: generateEventId(),
    eventType: params.eventType,
    entityId: params.entityId,
    entityType: params.entityType,
    details: params.details || {},
    actorId: params.actorId,
    actorType: params.actorType,
    timestamp: nowISO(),
  };
}
