import { campaignRepository } from '@/infrastructure/dynamodb/repositories';
import type { Campaign } from '@/domain/campaign/entities/campaign';
import type { CampaignStatus } from '@/shared/types';

export async function listCampaigns(
  tenantId: string,
  status?: CampaignStatus,
): Promise<Campaign[]> {
  return campaignRepository.findByTenant(tenantId, status);
}
