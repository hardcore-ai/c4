import { campaignRepository } from '@/infrastructure/dynamodb/repositories';
import type { Campaign } from '@/domain/campaign/entities/campaign';

export async function getCampaignDetail(
  tenantId: string,
  campaignId: string,
): Promise<Campaign | null> {
  return campaignRepository.findById(tenantId, campaignId);
}
