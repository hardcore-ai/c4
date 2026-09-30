import { conversationRepository, evaluationRepository, candidateRepository } from '@/infrastructure/dynamodb/repositories';
import { calculateGlobalScore, determineRecommendation, validateEvaluation } from '@/domain/evaluation/rules/evaluation-rules';
import { logAuditEvent } from '@/application/compliance/log-audit-event';
import type { Evaluation, CompetencyScore } from '@/domain/evaluation/entities/evaluation';
import type { Rubric } from '@/domain/evaluation/entities/rubric';
import type { Message } from '@/domain/conversation/entities/conversation';
import { nowISO } from '@/shared/utils/date';
import { logger } from '@/infrastructure/logging/logger';

export interface EvaluateConversationInput {
  tenantId: string;
  conversationId: string;
  rubric: Rubric;
  runEvaluatorPrompt: (params: {
    transcript: Message[];
    rubric: Rubric;
  }) => Promise<{
    competencyScores: CompetencyScore[];
    keySignals: string[];
  }>;
}

export async function evaluateConversation(input: EvaluateConversationInput): Promise<Evaluation> {
  const { tenantId, conversationId, rubric, runEvaluatorPrompt } = input;

  const conversation = await conversationRepository.findById(tenantId, conversationId);
  if (!conversation) {
    throw new Error(`Conversation ${conversationId} not found`);
  }

  // Dual-pass: evaluator prompt scores the full transcript
  const evaluatorResult = await runEvaluatorPrompt({
    transcript: conversation.messages,
    rubric,
  });

  const globalScore = calculateGlobalScore(evaluatorResult.competencyScores);
  const recommendation = determineRecommendation(globalScore);

  const evaluation: Evaluation = {
    conversationId,
    campaignId: conversation.campaignId,
    candidateId: conversation.candidateId,
    globalScore,
    recommendation,
    competencyScores: evaluatorResult.competencyScores,
    keySignals: evaluatorResult.keySignals,
    generatedAt: nowISO(),
  };

  // Validate evaluation integrity
  const errors = validateEvaluation(evaluation);
  if (errors.length > 0) {
    logger.warn('evaluation', 'Evaluation validation warnings', {
      context: { conversationId, errors },
    });
  }

  await evaluationRepository.save(tenantId, evaluation);

  // Update candidate state to pending_review
  await candidateRepository.updateState(tenantId, conversation.candidateId, 'pending_review');

  await logAuditEvent(tenantId, {
    eventType: 'evaluation_generated',
    entityId: conversationId,
    entityType: 'evaluation',
    actorId: 'system',
    actorType: 'system',
    details: { globalScore, recommendation },
  });

  return evaluation;
}
