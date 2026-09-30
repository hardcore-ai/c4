import type { CandidateState } from '@/shared/types';
import type { Recommendation } from '@/shared/types';

const VALID_TRANSITIONS: Record<CandidateState, CandidateState[]> = {
  initiated: ['in_screening'],
  in_screening: ['completed'],
  completed: ['pending_review'],
  pending_review: ['approved', 'rejected'],
  approved: [],
  rejected: [],
};

export function canTransitionTo(current: CandidateState, target: CandidateState): boolean {
  return VALID_TRANSITIONS[current]?.includes(target) ?? false;
}

export function requiresDisagreementReason(
  decision: 'approved' | 'rejected',
  recommendation: Recommendation,
): boolean {
  const aiDecision = recommendation === 'not_recommended' ? 'rejected' : 'approved';
  return decision !== aiDecision;
}

export function validateReviewDecision(input: {
  decision: 'approved' | 'rejected';
  recommendation: Recommendation;
  disagreementReason?: string;
}): string[] {
  const errors: string[] = [];

  if (requiresDisagreementReason(input.decision, input.recommendation)) {
    if (!input.disagreementReason || input.disagreementReason.trim().length === 0) {
      errors.push('Disagreement reason is required when decision differs from AI recommendation');
    }
  }

  if (input.disagreementReason && input.disagreementReason.length > 1000) {
    errors.push('Disagreement reason must be 1000 characters or less');
  }

  return errors;
}
