import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/shared/utils/api-handler';
import { requireTenantContext } from '@/infrastructure/auth/get-tenant';
import { getCampaignDetail } from '@/application/campaign/get-campaign-detail';
import { updateCampaign } from '@/application/campaign/update-campaign';

const UpdateCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  roleDescription: z.string().min(1).max(2000).optional(),
  status: z.enum(['draft', 'active', 'inactive', 'archived']).optional(),
  knowledgeBaseContent: z.string().optional(),
  careerPageUrl: z.string().url().optional(),
});

export const GET = apiHandler(async (_req, context) => {
  const ctx = await requireTenantContext();
  const { campaignId } = await context.params;

  const campaign = await getCampaignDetail(ctx.tenantId, campaignId);
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  return NextResponse.json({ campaign });
});

export const PUT = apiHandler(async (req: NextRequest, context) => {
  const ctx = await requireTenantContext();
  const { campaignId } = await context.params;
  const body = UpdateCampaignSchema.parse(await req.json());

  const campaign = await updateCampaign({
    tenantId: ctx.tenantId,
    campaignId,
    ...body,
  });

  return NextResponse.json({ campaign });
});
