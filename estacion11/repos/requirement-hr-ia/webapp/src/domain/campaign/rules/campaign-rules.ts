import type { Campaign } from '../entities/campaign';
import type { CampaignStatus } from '@/shared/types';

const VALID_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ['active'],
  active: ['inactive', 'archived'],
  inactive: ['active', 'archived'],
  archived: [],
};

export function canTransitionTo(current: CampaignStatus, target: CampaignStatus): boolean {
  return VALID_TRANSITIONS[current]?.includes(target) ?? false;
}

export function canActivate(campaign: Campaign): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!campaign.name || campaign.name.trim().length === 0) {
    errors.push('Campaign name is required');
  }
  if (!campaign.roleDescription || campaign.roleDescription.trim().length === 0) {
    errors.push('Role description is required');
  }
  if (!campaign.rubric || !campaign.rubricId) {
    errors.push('Rubric must be assigned');
  }

  return { valid: errors.length === 0, errors };
}

export function generateTelegramLink(campaignId: string): string {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'EntrevistasConAIBot';
  return `https://t.me/${botUsername}?start=${campaignId}`;
}

export function isActiveCampaign(campaign: Campaign): boolean {
  return campaign.status === 'active';
}
