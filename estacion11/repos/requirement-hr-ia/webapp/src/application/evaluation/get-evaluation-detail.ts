import { evaluationRepository, conversationRepository } from '@/infrastructure/dynamodb/repositories';
import type { Evaluation } from '@/domain/evaluation/entities/evaluation';
import type { Conversation } from '@/domain/conversation/entities/conversation';

export interface EvaluationDetail {
  evaluation: Evaluation;
  conversation: Conversation;
}

export async function getEvaluationDetail(
  tenantId: string,
  conversationId: string,
): Promise<EvaluationDetail | null> {
  const [evaluation, conversation] = await Promise.all([
    evaluationRepository.findByConversation(tenantId, conversationId),
    conversationRepository.findById(tenantId, conversationId),
  ]);

  if (!evaluation || !conversation) return null;

  return { evaluation, conversation };
}
