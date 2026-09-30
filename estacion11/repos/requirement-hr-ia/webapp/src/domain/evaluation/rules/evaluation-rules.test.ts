import { describe, it, expect } from 'vitest';
import {
  calculateGlobalScore,
  determineRecommendation,
  validateEvidence,
  validateScoreRange,
  validateRubricWeights,
  validateCompetencyCount,
  validateEvaluation,
} from './evaluation-rules';
import { createBPORubricTemplate, createTechRubricTemplate } from '../entities/rubric-templates';
import type { CompetencyScore } from '../entities/evaluation';
import type { Rubric } from '../entities/rubric';

const mockScores: CompetencyScore[] = [
  { competencyId: 'c1', competencyName: 'Comm', score: 4, weight: 0.5, evidence: [{ quote: 'test', messageIndex: 0, relevance: 'r' }], justification: 'good' },
  { competencyId: 'c2', competencyName: 'Problem', score: 3, weight: 0.5, evidence: [{ quote: 'test', messageIndex: 1, relevance: 'r' }], justification: 'ok' },
];

describe('calculateGlobalScore', () => {
  it('calculates weighted average correctly', () => {
    expect(calculateGlobalScore(mockScores)).toBe(3.5);
  });

  it('returns 0 for empty scores', () => {
    expect(calculateGlobalScore([])).toBe(0);
  });
});

describe('determineRecommendation', () => {
  it('returns highly_recommended for >= 4.0', () => {
    expect(determineRecommendation(4.0)).toBe('highly_recommended');
    expect(determineRecommendation(4.5)).toBe('highly_recommended');
  });

  it('returns recommended for >= 3.0 and < 4.0', () => {
    expect(determineRecommendation(3.0)).toBe('recommended');
    expect(determineRecommendation(3.9)).toBe('recommended');
  });

  it('returns not_recommended for < 3.0', () => {
    expect(determineRecommendation(2.9)).toBe('not_recommended');
    expect(determineRecommendation(1.0)).toBe('not_recommended');
  });
});

describe('validateEvidence', () => {
  it('passes with at least one evidence', () => {
    expect(validateEvidence(mockScores[0])).toBe(true);
  });

  it('fails with no evidence', () => {
    const noEvidence = { ...mockScores[0], evidence: [] };
    expect(validateEvidence(noEvidence)).toBe(false);
  });
});

describe('validateScoreRange', () => {
  it('accepts 1-5', () => {
    for (let i = 1; i <= 5; i++) {
      expect(validateScoreRange(i)).toBe(true);
    }
  });

  it('rejects out of range', () => {
    expect(validateScoreRange(0)).toBe(false);
    expect(validateScoreRange(6)).toBe(false);
    expect(validateScoreRange(3.5)).toBe(false);
  });
});

describe('validateRubricWeights', () => {
  it('accepts weights summing to 1.0', () => {
    const rubric = { competencies: [{ weight: 0.5 }, { weight: 0.5 }] } as Rubric;
    expect(validateRubricWeights(rubric)).toBe(true);
  });

  it('rejects weights not summing to 1.0', () => {
    const rubric = { competencies: [{ weight: 0.3 }, { weight: 0.3 }] } as Rubric;
    expect(validateRubricWeights(rubric)).toBe(false);
  });
});

describe('validateCompetencyCount', () => {
  it('accepts 3-5 competencies', () => {
    expect(validateCompetencyCount({ competencies: new Array(3) } as Rubric)).toBe(true);
    expect(validateCompetencyCount({ competencies: new Array(5) } as Rubric)).toBe(true);
  });

  it('rejects less than 3 or more than 5', () => {
    expect(validateCompetencyCount({ competencies: new Array(2) } as Rubric)).toBe(false);
    expect(validateCompetencyCount({ competencies: new Array(6) } as Rubric)).toBe(false);
  });
});

describe('Rubric Templates (US-2.1)', () => {
  it('BPO template has valid weights summing to 1.0', () => {
    const bpo = createBPORubricTemplate('tenant-test');
    expect(validateRubricWeights(bpo)).toBe(true);
  });

  it('BPO template has 3-5 competencies', () => {
    const bpo = createBPORubricTemplate('tenant-test');
    expect(validateCompetencyCount(bpo)).toBe(true);
  });

  it('BPO template has criteria for all 5 levels per competency', () => {
    const bpo = createBPORubricTemplate('tenant-test');
    for (const comp of bpo.competencies) {
      expect(comp.criteria[1]).toBeTruthy();
      expect(comp.criteria[2]).toBeTruthy();
      expect(comp.criteria[3]).toBeTruthy();
      expect(comp.criteria[4]).toBeTruthy();
      expect(comp.criteria[5]).toBeTruthy();
    }
  });

  it('Tech template has valid weights summing to 1.0', () => {
    const tech = createTechRubricTemplate('tenant-test');
    expect(validateRubricWeights(tech)).toBe(true);
  });

  it('Tech template has 3-5 competencies', () => {
    const tech = createTechRubricTemplate('tenant-test');
    expect(validateCompetencyCount(tech)).toBe(true);
  });

  it('Tech template has sample questions for each competency', () => {
    const tech = createTechRubricTemplate('tenant-test');
    for (const comp of tech.competencies) {
      expect(comp.sampleQuestion.length).toBeGreaterThan(0);
    }
  });

  it('templates have distinct rubricIds', () => {
    const bpo = createBPORubricTemplate('t1');
    const tech = createTechRubricTemplate('t1');
    expect(bpo.rubricId).not.toBe(tech.rubricId);
  });
});

describe('validateEvaluation (US-2.3)', () => {
  it('passes for a valid evaluation', () => {
    const errors = validateEvaluation({
      conversationId: 'c1',
      campaignId: 'camp1',
      candidateId: 'cand1',
      globalScore: 3.5,
      recommendation: 'recommended',
      competencyScores: mockScores,
      keySignals: ['good'],
    });
    expect(errors).toEqual([]);
  });

  it('fails when evidence is missing', () => {
    const errors = validateEvaluation({
      conversationId: 'c1',
      campaignId: 'camp1',
      candidateId: 'cand1',
      globalScore: 3.5,
      recommendation: 'recommended',
      competencyScores: [{ ...mockScores[0], evidence: [] }, mockScores[1]],
      keySignals: [],
    });
    expect(errors).toContain('Every competency score must have at least one evidence quote');
  });

  it('fails when recommendation mismatches score', () => {
    const errors = validateEvaluation({
      conversationId: 'c1',
      campaignId: 'camp1',
      candidateId: 'cand1',
      globalScore: 4.5,
      recommendation: 'not_recommended',
      competencyScores: mockScores,
      keySignals: [],
    });
    expect(errors.some((e) => e.includes('Recommendation mismatch'))).toBe(true);
  });

  it('fails when score is out of range', () => {
    const errors = validateEvaluation({
      conversationId: 'c1',
      campaignId: 'camp1',
      candidateId: 'cand1',
      globalScore: 3.5,
      recommendation: 'recommended',
      competencyScores: [{ ...mockScores[0], score: 6 }, mockScores[1]],
      keySignals: [],
    });
    expect(errors.some((e) => e.includes('must be between 1 and 5'))).toBe(true);
  });
});
