import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/shared/utils/api-handler';
import { requireTenantContext } from '@/infrastructure/auth/get-tenant';
import { reviewCandidate } from '@/application/candidate/review-candidate';

const ReviewSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  reason: z.string().max(1000).optional(),
  disagreementReason: z.string().max(1000).optional(),
});

export const POST = apiHandler(async (req: NextRequest, context) => {
  const ctx = await requireTenantContext();
  const { candidateId } = await context.params;
  const body = ReviewSchema.parse(await req.json());

  await reviewCandidate({
    tenantId: ctx.tenantId,
    candidateId,
    reviewerId: ctx.userId,
    ...body,
  });

  return NextResponse.json({ success: true });
});
