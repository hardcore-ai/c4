import { GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../client';
import { getTableName, DYNAMODB_TABLES } from '@/shared/constants';
import type { Candidate } from '@/domain/candidate/entities/candidate';
import type { CandidateState, ReviewFilters } from '@/shared/types';

const TABLE = () => getTableName(DYNAMODB_TABLES.CANDIDATES);

export const candidateRepository = {
  async save(tenantId: string, candidate: Candidate): Promise<void> {
    await dynamodb.send(new PutCommand({
      TableName: TABLE(),
      Item: { tenantId, ...candidate },
    }));
  },

  async findById(tenantId: string, candidateId: string): Promise<Candidate | null> {
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLE(),
      Key: { tenantId, candidateId },
    }));
    return (result.Item as Candidate) || null;
  },

  async findByTelegramUser(telegramUserId: string, tenantId: string): Promise<Candidate[]> {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLE(),
      IndexName: 'ByTelegram',
      KeyConditionExpression: 'telegramUserId = :tuid AND tenantId = :tid',
      ExpressionAttributeValues: {
        ':tuid': telegramUserId,
        ':tid': tenantId,
      },
    }));
    return (result.Items as Candidate[]) || [];
  },

  async findForReview(tenantId: string, filters: ReviewFilters): Promise<Candidate[]> {
    if (filters.campaignId) {
      const result = await dynamodb.send(new QueryCommand({
        TableName: TABLE(),
        IndexName: 'ByCampaign',
        KeyConditionExpression: 'campaignId = :cid AND #st = :state',
        ExpressionAttributeNames: { '#st': 'state' },
        ExpressionAttributeValues: {
          ':cid': filters.campaignId,
          ':state': 'pending_review',
        },
      }));
      return (result.Items as Candidate[]) || [];
    }

    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLE(),
      KeyConditionExpression: 'tenantId = :tid',
      FilterExpression: '#st = :state',
      ExpressionAttributeNames: { '#st': 'state' },
      ExpressionAttributeValues: {
        ':tid': tenantId,
        ':state': 'pending_review',
      },
    }));
    return (result.Items as Candidate[]) || [];
  },

  async updateState(tenantId: string, candidateId: string, state: CandidateState, extra?: Record<string, unknown>): Promise<void> {
    let updateExpr = 'SET #st = :state, updatedAt = :now';
    const names: Record<string, string> = { '#st': 'state' };
    const values: Record<string, unknown> = { ':state': state, ':now': new Date().toISOString() };

    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        updateExpr += `, #${key} = :${key}`;
        names[`#${key}`] = key;
        values[`:${key}`] = value;
      });
    }

    await dynamodb.send(new UpdateCommand({
      TableName: TABLE(),
      Key: { tenantId, candidateId },
      UpdateExpression: updateExpr,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    }));
  },
};
