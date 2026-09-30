import type { CampaignStatus } from '@/shared/types';
import type { Rubric } from '@/domain/evaluation/entities/rubric';

export interface BasicRequirement {
  id: string;
  field: string;
  question: string;
  type: 'text' | 'boolean' | 'choice';
  mandatory: boolean;
  options?: string[];
  expectedAnswer?: string;
}

export interface Campaign {
  campaignId: string;
  name: string;
  roleDescription: string;
  rubricId: string;
  rubric: Rubric;
  telegramLink: string;
  status: CampaignStatus;
  basicRequirements: BasicRequirement[];
  knowledgeBaseContent?: string;
  careerPageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
