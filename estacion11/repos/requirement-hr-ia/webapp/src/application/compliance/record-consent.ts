import { consentRepository } from '@/infrastructure/dynamodb/repositories';
import { logAuditEvent } from './log-audit-event';
import type { ConsentRecord } from '@/domain/compliance/entities/consent-record';
import { nowISO } from '@/shared/utils/date';

export async function recordConsent(
  tenantId: string,
  params: {
    candidateId: string;
    telegramUserId: string;
    campaignId: string;
    granted: boolean;
  },
): Promise<ConsentRecord> {
  const record: ConsentRecord = {
    candidateId: params.candidateId,
    granted: params.granted,
    telegramUserId: params.telegramUserId,
    campaignId: params.campaignId,
    timestamp: nowISO(),
  };

  await consentRepository.save(tenantId, record);

  await logAuditEvent(tenantId, {
    eventType: params.granted ? 'consent_granted' : 'consent_denied',
    entityId: params.candidateId,
    entityType: 'candidate',
    actorId: params.telegramUserId,
    actorType: 'candidate',
    details: { campaignId: params.campaignId },
  });

  return record;
}
