import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/infrastructure/dynamodb/repositories', () => ({
  campaignRepository: {
    save: vi.fn(),
  },
  auditEventRepository: { append: vi.fn() },
}));

import { createCampaign } from './create-campaign';
import { campaignRepository } from '@/infrastructure/dynamodb/repositories';

beforeEach(() => { vi.clearAllMocks(); });

describe('createCampaign (US-3.1)', () => {
  it('creates a campaign with BPO rubric template', async () => {
    const campaign = await createCampaign({
      tenantId: 't1',
      name: 'Agentes Q1 2026',
      roleDescription: 'Agente de servicio al cliente',
      rubricTemplate: 'bpo',
    });

    expect(campaign.campaignId).toBeTruthy();
    expect(campaign.name).toBe('Agentes Q1 2026');
    expect(campaign.rubric.template).toBe('bpo');
    expect(campaign.rubric.competencies.length).toBeGreaterThanOrEqual(3);
    expect(campaign.status).toBe('draft');
    expect(campaign.telegramLink).toContain('?start=');
    expect(campaignRepository.save).toHaveBeenCalledWith('t1', expect.objectContaining({ name: 'Agentes Q1 2026' }));
  });

  it('creates a campaign with Tech rubric template', async () => {
    const campaign = await createCampaign({
      tenantId: 't1',
      name: 'Devs Backend',
      roleDescription: 'Desarrollador Node.js',
      rubricTemplate: 'tech',
    });

    expect(campaign.rubric.template).toBe('tech');
    expect(campaign.rubric.competencies.length).toBeGreaterThanOrEqual(3);
  });

  it('generates a unique Telegram link', async () => {
    const c1 = await createCampaign({
      tenantId: 't1', name: 'C1', roleDescription: 'R1', rubricTemplate: 'bpo',
    });
    const c2 = await createCampaign({
      tenantId: 't1', name: 'C2', roleDescription: 'R2', rubricTemplate: 'bpo',
    });

    expect(c1.telegramLink).not.toBe(c2.telegramLink);
    expect(c1.campaignId).not.toBe(c2.campaignId);
  });

  it('includes knowledge base content when provided', async () => {
    const campaign = await createCampaign({
      tenantId: 't1',
      name: 'With KB',
      roleDescription: 'Role',
      rubricTemplate: 'bpo',
      knowledgeBaseContent: 'Nuestra empresa fue fundada en 2020...',
    });

    expect(campaign.knowledgeBaseContent).toBe('Nuestra empresa fue fundada en 2020...');
  });

  it('starts in draft status', async () => {
    const campaign = await createCampaign({
      tenantId: 't1', name: 'Draft', roleDescription: 'R', rubricTemplate: 'bpo',
    });

    expect(campaign.status).toBe('draft');
  });
});
