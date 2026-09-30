import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/shared/utils/api-handler';
import { requireTenantContext } from '@/infrastructure/auth/get-tenant';
import { createCampaign } from '@/application/campaign/create-campaign';
import { listCampaigns } from '@/application/campaign/list-campaigns';
import type { CampaignStatus } from '@/shared/types';

const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  roleDescription: z.string().min(1).max(2000),
  rubricTemplate: z.enum(['bpo', 'tech']),
  knowledgeBaseContent: z.string().optional(),
  careerPageUrl: z.string().url().optional(),
});

export const GET = apiHandler(async () => {
  const ctx = await requireTenantContext();
  const campaigns = await listCampaigns(ctx.tenantId);
  return NextResponse.json({ campaigns });
});

export const POST = apiHandler(async (req: NextRequest) => {
  const ctx = await requireTenantContext();
  const body = CreateCampaignSchema.parse(await req.json());

  const campaign = await createCampaign({
    tenantId: ctx.tenantId,
    ...body,
  });

  return NextResponse.json({ campaign }, { status: 201 });
});
