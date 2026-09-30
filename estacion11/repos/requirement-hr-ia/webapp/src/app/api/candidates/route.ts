import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/shared/utils/api-handler';
import { requireTenantContext } from '@/infrastructure/auth/get-tenant';
import { listCandidatesForReview } from '@/application/candidate/list-for-review';
import type { Recommendation, ReviewFilters } from '@/shared/types';

export const GET = apiHandler(async (req: NextRequest) => {
  const ctx = await requireTenantContext();
  const searchParams = req.nextUrl.searchParams;

  const filters: ReviewFilters = {
    campaignId: searchParams.get('campaignId') || undefined,
    recommendation: (searchParams.get('recommendation') as Recommendation) || undefined,
    scoreMin: searchParams.get('scoreMin') ? Number(searchParams.get('scoreMin')) : undefined,
    scoreMax: searchParams.get('scoreMax') ? Number(searchParams.get('scoreMax')) : undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  };

  const candidates = await listCandidatesForReview(ctx.tenantId, filters);

  return NextResponse.json({ candidates });
});
