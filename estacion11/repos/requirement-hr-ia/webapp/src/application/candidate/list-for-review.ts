import { candidateRepository, evaluationRepository } from '@/infrastructure/dynamodb/repositories';
import type { Candidate } from '@/domain/candidate/entities/candidate';
import type { Evaluation } from '@/domain/evaluation/entities/evaluation';
import type { ReviewFilters } from '@/shared/types';

export interface CandidateForReview {
  candidate: Candidate;
  evaluation: Evaluation | null;
}

export async function listCandidatesForReview(
  tenantId: string,
  filters: ReviewFilters,
): Promise<CandidateForReview[]> {
  const candidates = await candidateRepository.findForReview(tenantId, filters);

  const results: CandidateForReview[] = await Promise.all(
    candidates.map(async (candidate) => {
      const evaluation = candidate.conversationId
        ? await evaluationRepository.findByConversation(tenantId, candidate.conversationId)
        : null;
      return { candidate, evaluation };
    }),
  );

  // Apply client-side filters that DynamoDB can't handle natively
  let filtered = results;

  if (filters.recommendation) {
    filtered = filtered.filter((r) => r.evaluation?.recommendation === filters.recommendation);
  }

  if (filters.scoreMin !== undefined) {
    filtered = filtered.filter((r) => (r.evaluation?.globalScore ?? 0) >= filters.scoreMin!);
  }

  if (filters.scoreMax !== undefined) {
    filtered = filtered.filter((r) => (r.evaluation?.globalScore ?? 0) <= filters.scoreMax!);
  }

  return filtered;
}
