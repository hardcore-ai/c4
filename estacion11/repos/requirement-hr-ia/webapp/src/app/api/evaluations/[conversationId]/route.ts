import { NextResponse } from 'next/server';
import { apiHandler } from '@/shared/utils/api-handler';
import { requireTenantContext } from '@/infrastructure/auth/get-tenant';
import { getEvaluationDetail } from '@/application/evaluation/get-evaluation-detail';

export const GET = apiHandler(async (_req, context) => {
  const ctx = await requireTenantContext();
  const { conversationId } = await context.params;

  const detail = await getEvaluationDetail(ctx.tenantId, conversationId);
  if (!detail) {
    return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
  }

  return NextResponse.json(detail);
});
