import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../client';
import { getTableName, DYNAMODB_TABLES } from '@/shared/constants';
import type { Evaluation } from '@/domain/evaluation/entities/evaluation';

const TABLE = () => getTableName(DYNAMODB_TABLES.EVALUATIONS);

export const evaluationRepository = {
  async save(tenantId: string, evaluation: Evaluation): Promise<void> {
    await dynamodb.send(new PutCommand({
      TableName: TABLE(),
      Item: { tenantId, ...evaluation },
    }));
  },

  async findByConversation(tenantId: string, conversationId: string): Promise<Evaluation | null> {
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLE(),
      Key: { tenantId, conversationId },
    }));
    return (result.Item as Evaluation) || null;
  },
};
