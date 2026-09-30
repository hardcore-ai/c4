import { NextResponse } from 'next/server';
import { apiHandler } from '@/shared/utils/api-handler';
import { requireTenantContext } from '@/infrastructure/auth/get-tenant';
import { candidateRepository } from '@/infrastructure/dynamodb/repositories';
import { getEvaluationDetail } from '@/application/evaluation/get-evaluation-detail';

export const GET = apiHandler(async (_req, context) => {
  const ctx = await requireTenantContext();
  const { candidateId } = await context.params;

  const candidate = await candidateRepository.findById(ctx.tenantId, candidateId);
  if (!candidate) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
  }

  let evaluationDetail = null;
  if (candidate.conversationId) {
    evaluationDetail = await getEvaluationDetail(ctx.tenantId, candidate.conversationId);
  }

  return NextResponse.json({ candidate, evaluationDetail });
});
