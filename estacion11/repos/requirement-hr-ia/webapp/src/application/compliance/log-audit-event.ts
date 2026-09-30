import { auditEventRepository } from '@/infrastructure/dynamodb/repositories';
import { createAuditEvent } from '@/domain/compliance/rules/compliance-rules';
import type { AuditEvent } from '@/domain/compliance/entities/audit-event';

export async function logAuditEvent(
  tenantId: string,
  params: {
    eventType: AuditEvent['eventType'];
    entityId: string;
    entityType: AuditEvent['entityType'];
    actorId: string;
    actorType: AuditEvent['actorType'];
    details?: Record<string, unknown>;
  },
): Promise<void> {
  const event = createAuditEvent(params);
  await auditEventRepository.append(tenantId, event);
}
