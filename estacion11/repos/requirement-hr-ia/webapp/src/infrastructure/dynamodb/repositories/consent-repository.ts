import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../client';
import { getTableName, DYNAMODB_TABLES } from '@/shared/constants';
import type { ConsentRecord } from '@/domain/compliance/entities/consent-record';

const TABLE = () => getTableName(DYNAMODB_TABLES.CONSENT);

export const consentRepository = {
  async save(tenantId: string, record: ConsentRecord): Promise<void> {
    await dynamodb.send(new PutCommand({
      TableName: TABLE(),
      Item: { tenantId, ...record },
      ConditionExpression: 'attribute_not_exists(candidateId)',
    }));
  },

  async findByCandidate(tenantId: string, candidateId: string): Promise<ConsentRecord | null> {
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLE(),
      Key: { tenantId, candidateId },
    }));
    return (result.Item as ConsentRecord) || null;
  },
};
