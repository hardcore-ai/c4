import { campaignRepository } from '@/infrastructure/dynamodb/repositories';
import { canTransitionTo, canActivate } from '@/domain/campaign/rules/campaign-rules';
import type { Campaign } from '@/domain/campaign/entities/campaign';
import type { CampaignStatus } from '@/shared/types';

export interface UpdateCampaignInput {
  tenantId: string;
  campaignId: string;
  name?: string;
  roleDescription?: string;
  status?: CampaignStatus;
  knowledgeBaseContent?: string;
  careerPageUrl?: string;
}

export async function updateCampaign(input: UpdateCampaignInput): Promise<Campaign> {
  const campaign = await campaignRepository.findById(input.tenantId, input.campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (input.status && input.status !== campaign.status) {
    if (!canTransitionTo(campaign.status, input.status)) {
      throw new Error(`Cannot transition campaign from ${campaign.status} to ${input.status}`);
    }
    if (input.status === 'active') {
      const merged = { ...campaign, ...input } as Campaign;
      const validation = canActivate(merged);
      if (!validation.valid) {
        throw new Error(`Cannot activate: ${validation.errors.join(', ')}`);
      }
    }
  }

  const updates: Partial<Campaign> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.roleDescription !== undefined) updates.roleDescription = input.roleDescription;
  if (input.status !== undefined) updates.status = input.status;
  if (input.knowledgeBaseContent !== undefined) updates.knowledgeBaseContent = input.knowledgeBaseContent;
  if (input.careerPageUrl !== undefined) updates.careerPageUrl = input.careerPageUrl;

  await campaignRepository.update(input.tenantId, input.campaignId, updates);

  return { ...campaign, ...updates };
}
