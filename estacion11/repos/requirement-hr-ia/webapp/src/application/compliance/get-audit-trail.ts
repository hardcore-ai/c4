import { auditEventRepository } from '@/infrastructure/dynamodb/repositories';
import type { AuditEvent } from '@/domain/compliance/entities/audit-event';

export async function getAuditTrail(
  tenantId: string,
  entityId: string,
): Promise<AuditEvent[]> {
  return auditEventRepository.findByEntity(tenantId, entityId);
}
