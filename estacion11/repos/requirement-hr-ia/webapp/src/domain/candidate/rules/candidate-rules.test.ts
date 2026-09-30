import { describe, it, expect } from 'vitest';
import { canTransitionTo, requiresDisagreementReason, validateReviewDecision } from './candidate-rules';

describe('canTransitionTo', () => {
  it('allows valid transitions', () => {
    expect(canTransitionTo('initiated', 'in_screening')).toBe(true);
    expect(canTransitionTo('in_screening', 'completed')).toBe(true);
    expect(canTransitionTo('completed', 'pending_review')).toBe(true);
    expect(canTransitionTo('pending_review', 'approved')).toBe(true);
    expect(canTransitionTo('pending_review', 'rejected')).toBe(true);
  });

  it('blocks invalid transitions', () => {
    expect(canTransitionTo('initiated', 'completed')).toBe(false);
    expect(canTransitionTo('approved', 'rejected')).toBe(false);
    expect(canTransitionTo('rejected', 'approved')).toBe(false);
    expect(canTransitionTo('completed', 'initiated')).toBe(false);
  });
});

describe('requiresDisagreementReason', () => {
  it('requires reason when approving a not_recommended candidate', () => {
    expect(requiresDisagreementReason('approved', 'not_recommended')).toBe(true);
  });

  it('requires reason when rejecting a recommended candidate', () => {
    expect(requiresDisagreementReason('rejected', 'recommended')).toBe(true);
    expect(requiresDisagreementReason('rejected', 'highly_recommended')).toBe(true);
  });

  it('does not require reason when decision aligns', () => {
    expect(requiresDisagreementReason('approved', 'recommended')).toBe(false);
    expect(requiresDisagreementReason('approved', 'highly_recommended')).toBe(false);
    expect(requiresDisagreementReason('rejected', 'not_recommended')).toBe(false);
  });
});

describe('validateReviewDecision', () => {
  it('returns error when disagreement reason missing', () => {
    const errors = validateReviewDecision({
      decision: 'approved',
      recommendation: 'not_recommended',
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('passes when disagreement reason provided', () => {
    const errors = validateReviewDecision({
      decision: 'approved',
      recommendation: 'not_recommended',
      disagreementReason: 'Candidate showed strong potential',
    });
    expect(errors).toEqual([]);
  });

  it('passes when decision aligns with recommendation', () => {
    const errors = validateReviewDecision({
      decision: 'approved',
      recommendation: 'highly_recommended',
    });
    expect(errors).toEqual([]);
  });
});
