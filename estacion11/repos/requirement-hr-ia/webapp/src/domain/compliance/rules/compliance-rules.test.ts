import { describe, it, expect } from 'vitest';
import { createAuditEvent } from './compliance-rules';

describe('createAuditEvent (US-4.1)', () => {
  it('creates audit event with all required fields', () => {
    const event = createAuditEvent({
      eventType: 'consent_granted',
      entityId: 'candidate-123',
      entityType: 'candidate',
      actorId: 'telegram-user-456',
      actorType: 'candidate',
      details: { campaignId: 'camp-1' },
    });

    expect(event.eventId).toBeTruthy();
    expect(event.eventType).toBe('consent_granted');
    expect(event.entityId).toBe('candidate-123');
    expect(event.entityType).toBe('candidate');
    expect(event.actorId).toBe('telegram-user-456');
    expect(event.actorType).toBe('candidate');
    expect(event.timestamp).toBeTruthy();
    expect(event.details.campaignId).toBe('camp-1');
  });

  it('generates unique eventIds', () => {
    const event1 = createAuditEvent({
      eventType: 'screening_started',
      entityId: 'conv-1',
      entityType: 'conversation',
      actorId: 'system',
      actorType: 'system',
    });
    const event2 = createAuditEvent({
      eventType: 'screening_started',
      entityId: 'conv-2',
      entityType: 'conversation',
      actorId: 'system',
      actorType: 'system',
    });
    expect(event1.eventId).not.toBe(event2.eventId);
  });

  it('includes ISO 8601 timestamp', () => {
    const event = createAuditEvent({
      eventType: 'candidate_approved',
      entityId: 'cand-1',
      entityType: 'candidate',
      actorId: 'recruiter-1',
      actorType: 'recruiter',
    });
    expect(() => new Date(event.timestamp)).not.toThrow();
    expect(event.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('defaults details to empty object when not provided', () => {
    const event = createAuditEvent({
      eventType: 'escalation_triggered',
      entityId: 'conv-1',
      entityType: 'conversation',
      actorId: 'system',
      actorType: 'system',
    });
    expect(event.details).toEqual({});
  });

  it('supports all audit event types', () => {
    const eventTypes = [
      'consent_granted', 'consent_denied', 'screening_started',
      'screening_completed', 'screening_abandoned', 'evaluation_generated',
      'candidate_approved', 'candidate_rejected', 'escalation_triggered',
    ] as const;

    for (const eventType of eventTypes) {
      const event = createAuditEvent({
        eventType,
        entityId: 'e1',
        entityType: 'conversation',
        actorId: 'a1',
        actorType: 'system',
      });
      expect(event.eventType).toBe(eventType);
    }
  });
});
