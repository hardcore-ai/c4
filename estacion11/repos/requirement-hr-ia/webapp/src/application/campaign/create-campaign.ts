import { campaignRepository } from '@/infrastructure/dynamodb/repositories';
import { generateTelegramLink, canActivate } from '@/domain/campaign/rules/campaign-rules';
import { createBPORubricTemplate, createTechRubricTemplate } from '@/domain/evaluation/entities/rubric-templates';
import { logAuditEvent } from '@/application/compliance/log-audit-event';
import type { Campaign, BasicRequirement } from '@/domain/campaign/entities/campaign';
import { generateId } from '@/shared/utils/id';
import { nowISO } from '@/shared/utils/date';

export interface CreateCampaignInput {
  tenantId: string;
  name: string;
  roleDescription: string;
  rubricTemplate: 'bpo' | 'tech';
  basicRequirements?: BasicRequirement[];
  knowledgeBaseContent?: string;
  careerPageUrl?: string;
}

export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  const campaignId = generateId();
  const now = nowISO();

  const rubric = input.rubricTemplate === 'bpo'
    ? createBPORubricTemplate(input.tenantId)
    : createTechRubricTemplate(input.tenantId);

  const campaign: Campaign = {
    campaignId,
    name: input.name,
    roleDescription: input.roleDescription,
    rubricId: rubric.rubricId,
    rubric,
    telegramLink: generateTelegramLink(campaignId),
    status: 'draft',
    basicRequirements: input.basicRequirements || [],
    knowledgeBaseContent: input.knowledgeBaseContent,
    careerPageUrl: input.careerPageUrl,
    createdAt: now,
    updatedAt: now,
  };

  await campaignRepository.save(input.tenantId, campaign);

  await logAuditEvent(input.tenantId, {
    eventType: 'screening_started',
    entityId: campaignId,
    entityType: 'campaign',
    actorId: input.tenantId,
    actorType: 'recruiter',
    details: { name: input.name, rubricTemplate: input.rubricTemplate },
  });

  return campaign;
}
