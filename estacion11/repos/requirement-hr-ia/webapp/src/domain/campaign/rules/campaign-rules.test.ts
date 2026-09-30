import { describe, it, expect, vi } from 'vitest';
import { canTransitionTo, canActivate, generateTelegramLink, isActiveCampaign } from './campaign-rules';
import type { Campaign } from '../entities/campaign';

const baseCampaign: Campaign = {
  campaignId: 'c1',
  name: 'Test Campaign',
  roleDescription: 'Test role',
  rubricId: 'r1',
  rubric: { rubricId: 'r1', tenantId: 't1', name: 'R', template: 'bpo', competencies: [], createdAt: '' },
  telegramLink: '',
  status: 'draft',
  basicRequirements: [],
  createdAt: '',
  updatedAt: '',
};

describe('canTransitionTo', () => {
  it('allows draft to active', () => {
    expect(canTransitionTo('draft', 'active')).toBe(true);
  });

  it('allows active to inactive and archived', () => {
    expect(canTransitionTo('active', 'inactive')).toBe(true);
    expect(canTransitionTo('active', 'archived')).toBe(true);
  });

  it('allows inactive to active and archived', () => {
    expect(canTransitionTo('inactive', 'active')).toBe(true);
    expect(canTransitionTo('inactive', 'archived')).toBe(true);
  });

  it('blocks transitions from archived', () => {
    expect(canTransitionTo('archived', 'active')).toBe(false);
    expect(canTransitionTo('archived', 'draft')).toBe(false);
  });
});

describe('canActivate', () => {
  it('passes with name, role, and rubric', () => {
    const result = canActivate(baseCampaign);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('fails without name', () => {
    const result = canActivate({ ...baseCampaign, name: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Campaign name is required');
  });

  it('fails without role description', () => {
    const result = canActivate({ ...baseCampaign, roleDescription: '' });
    expect(result.valid).toBe(false);
  });
});

describe('generateTelegramLink (US-3.1)', () => {
  it('generates link with campaign ID', () => {
    const link = generateTelegramLink('campaign-123');
    expect(link).toContain('?start=campaign-123');
    expect(link.startsWith('https://t.me/')).toBe(true);
  });

  it('generates unique links for different campaigns', () => {
    const link1 = generateTelegramLink('c1');
    const link2 = generateTelegramLink('c2');
    expect(link1).not.toBe(link2);
  });
});

describe('isActiveCampaign (US-3.1)', () => {
  it('returns true for active campaigns', () => {
    expect(isActiveCampaign({ ...baseCampaign, status: 'active' })).toBe(true);
  });

  it('returns false for non-active campaigns', () => {
    expect(isActiveCampaign({ ...baseCampaign, status: 'draft' })).toBe(false);
    expect(isActiveCampaign({ ...baseCampaign, status: 'inactive' })).toBe(false);
    expect(isActiveCampaign({ ...baseCampaign, status: 'archived' })).toBe(false);
  });
});
