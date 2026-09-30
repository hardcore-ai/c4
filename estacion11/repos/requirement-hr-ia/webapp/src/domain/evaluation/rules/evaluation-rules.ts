import type { CompetencyScore, Evaluation } from '../entities/evaluation';
import type { Rubric } from '../entities/rubric';
import type { Recommendation } from '@/shared/types';
import { RECOMMENDATION_THRESHOLDS } from '@/shared/constants';

export function calculateGlobalScore(scores: CompetencyScore[]): number {
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = scores.reduce((sum, s) => sum + s.score * s.weight, 0);
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

export function determineRecommendation(globalScore: number): Recommendation {
  if (globalScore >= RECOMMENDATION_THRESHOLDS.HIGHLY_RECOMMENDED) return 'highly_recommended';
  if (globalScore >= RECOMMENDATION_THRESHOLDS.RECOMMENDED) return 'recommended';
  return 'not_recommended';
}

export function validateEvidence(score: CompetencyScore): boolean {
  return score.evidence.length >= 1;
}

export function validateAllEvidence(scores: CompetencyScore[]): boolean {
  return scores.every(validateEvidence);
}

export function validateRubricWeights(rubric: Rubric): boolean {
  const totalWeight = rubric.competencies.reduce((sum, c) => sum + c.weight, 0);
  return Math.abs(totalWeight - 1.0) <= 0.01;
}

export function validateCompetencyCount(rubric: Rubric): boolean {
  const count = rubric.competencies.length;
  return count >= 3 && count <= 5;
}

export function validateScoreRange(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 5;
}

export function validateEvaluation(evaluation: Omit<Evaluation, 'generatedAt'>): string[] {
  const errors: string[] = [];

  if (!validateAllEvidence(evaluation.competencyScores)) {
    errors.push('Every competency score must have at least one evidence quote');
  }

  for (const cs of evaluation.competencyScores) {
    if (!validateScoreRange(cs.score)) {
      errors.push(`Score for ${cs.competencyName} must be between 1 and 5`);
    }
  }

  const expectedRecommendation = determineRecommendation(evaluation.globalScore);
  if (evaluation.recommendation !== expectedRecommendation) {
    errors.push(`Recommendation mismatch: expected ${expectedRecommendation} for score ${evaluation.globalScore}`);
  }

  return errors;
}
