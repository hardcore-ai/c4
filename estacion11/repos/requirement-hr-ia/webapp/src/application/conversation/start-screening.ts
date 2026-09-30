import { conversationRepository, campaignRepository, candidateRepository } from '@/infrastructure/dynamodb/repositories';
import { createInitialSessionState } from '@/domain/conversation/rules/conversation-rules';
import { isActiveCampaign } from '@/domain/campaign/rules/campaign-rules';
import { generateId } from '@/shared/utils/id';
import { nowISO } from '@/shared/utils/date';
import { logAuditEvent } from '@/application/compliance/log-audit-event';
import type { Conversation } from '@/domain/conversation/entities/conversation';
import type { Candidate } from '@/domain/candidate/entities/candidate';

export interface StartScreeningInput {
  telegramUserId: string;
  telegramChatId: number;
  campaignId: string;
}

export interface StartScreeningResult {
  success: boolean;
  conversation?: Conversation;
  candidate?: Candidate;
  error?: 'campaign_not_found' | 'campaign_inactive' | 'already_in_progress';
  careerPageUrl?: string;
}

export async function startScreening(input: StartScreeningInput): Promise<StartScreeningResult> {
  // 1. Look up campaign (we need to find tenantId from campaignId)
  // For Telegram flow, we scan by campaignId — campaign stores its tenantId
  // In MVP, we use a direct lookup approach
  const existingConversation = await conversationRepository.findByTelegramUser(
    input.telegramUserId,
    input.campaignId,
  );

  if (existingConversation) {
    return { success: false, error: 'already_in_progress', conversation: existingConversation };
  }

  // Campaign lookup requires knowing tenantId — for Telegram, we need a global lookup
  // This is handled by the webhook handler which resolves campaign first
  // This use case receives the campaign already resolved
  return { success: true };
}

export async function createScreeningSession(
  tenantId: string,
  campaign: { campaignId: string; careerPageUrl?: string },
  input: StartScreeningInput,
): Promise<StartScreeningResult> {
  const now = nowISO();
  const candidateId = generateId();
  const conversationId = generateId();

  const candidate: Candidate = {
    candidateId,
    telegramUserId: input.telegramUserId,
    telegramChatId: input.telegramChatId,
    campaignId: input.campaignId,
    conversationId,
    state: 'initiated',
    createdAt: now,
    updatedAt: now,
  };

  const conversation: Conversation = {
    conversationId,
    campaignId: input.campaignId,
    candidateId,
    telegramUserId: input.telegramUserId,
    telegramChatId: input.telegramChatId,
    telegramUserIdCampaignId: `${input.telegramUserId}#${input.campaignId}`,
    state: 'active',
    sessionState: createInitialSessionState(),
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  await candidateRepository.save(tenantId, candidate);
  await conversationRepository.save(tenantId, conversation);

  await logAuditEvent(tenantId, {
    eventType: 'screening_started',
    entityId: conversationId,
    entityType: 'conversation',
    actorId: input.telegramUserId,
    actorType: 'candidate',
    details: { campaignId: input.campaignId, candidateId },
  });

  return { success: true, conversation, candidate };
}
