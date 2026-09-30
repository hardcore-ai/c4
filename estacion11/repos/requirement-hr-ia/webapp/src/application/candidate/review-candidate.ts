import { candidateRepository, evaluationRepository } from '@/infrastructure/dynamodb/repositories';
import { canTransitionTo, validateReviewDecision } from '@/domain/candidate/rules/candidate-rules';
import { logAuditEvent } from '@/application/compliance/log-audit-event';
import type { ReviewDecision } from '@/domain/candidate/entities/candidate';
import { nowISO } from '@/shared/utils/date';

export interface ReviewCandidateInput {
  tenantId: string;
  candidateId: string;
  reviewerId: string;
  decision: 'approved' | 'rejected';
  reason?: string;
  disagreementReason?: string;
}

export async function reviewCandidate(input: ReviewCandidateInput): Promise<void> {
  const candidate = await candidateRepository.findById(input.tenantId, input.candidateId);
  if (!candidate) {
    throw new Error('Candidate not found');
  }

  if (candidate.state !== 'pending_review') {
    throw new Error(`Cannot review candidate in state: ${candidate.state}`);
  }

  const targetState = input.decision === 'approved' ? 'approved' as const : 'rejected' as const;
  if (!canTransitionTo(candidate.state, targetState)) {
    throw new Error(`Invalid state transition: ${candidate.state} → ${targetState}`);
  }

  // Get evaluation to check for disagreement
  let disagreesWithAI = false;
  if (candidate.conversationId) {
    const evaluation = await evaluationRepository.findByConversation(input.tenantId, candidate.conversationId);
    if (evaluation) {
      const errors = validateReviewDecision({
        decision: input.decision,
        recommendation: evaluation.recommendation,
        disagreementReason: input.disagreementReason,
      });
      if (errors.length > 0) {
        throw new Error(errors.join('. '));
      }

      const aiDecision = evaluation.recommendation === 'not_recommended' ? 'rejected' : 'approved';
      disagreesWithAI = input.decision !== aiDecision;
    }
  }

  const reviewDecision: ReviewDecision = {
    decision: input.decision,
    reviewerId: input.reviewerId,
    reason: input.reason,
    disagreesWithAI,
    disagreementReason: disagreesWithAI ? input.disagreementReason : undefined,
    decidedAt: nowISO(),
  };

  await candidateRepository.updateState(input.tenantId, input.candidateId, targetState, {
    reviewDecision,
  });

  await logAuditEvent(input.tenantId, {
    eventType: input.decision === 'approved' ? 'candidate_approved' : 'candidate_rejected',
    entityId: input.candidateId,
    entityType: 'candidate',
    actorId: input.reviewerId,
    actorType: 'recruiter',
    details: {
      decision: input.decision,
      disagreesWithAI,
      reason: input.reason,
      disagreementReason: input.disagreementReason,
    },
  });
}
