import { GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../client';
import { getTableName, DYNAMODB_TABLES } from '@/shared/constants';
import type { Campaign } from '@/domain/campaign/entities/campaign';
import type { CampaignStatus } from '@/shared/types';

const TABLE = () => getTableName(DYNAMODB_TABLES.CAMPAIGNS);

export const campaignRepository = {
  async save(tenantId: string, campaign: Campaign): Promise<void> {
    await dynamodb.send(new PutCommand({
      TableName: TABLE(),
      Item: { tenantId, ...campaign },
    }));
  },

  async findById(tenantId: string, campaignId: string): Promise<Campaign | null> {
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLE(),
      Key: { tenantId, campaignId },
    }));
    return (result.Item as Campaign) || null;
  },

  async findByTenant(tenantId: string, status?: CampaignStatus): Promise<Campaign[]> {
    if (status) {
      const result = await dynamodb.send(new QueryCommand({
        TableName: TABLE(),
        KeyConditionExpression: 'tenantId = :tid',
        FilterExpression: '#st = :status',
        ExpressionAttributeNames: { '#st': 'status' },
        ExpressionAttributeValues: { ':tid': tenantId, ':status': status },
      }));
      return (result.Items as Campaign[]) || [];
    }

    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLE(),
      KeyConditionExpression: 'tenantId = :tid',
      ExpressionAttributeValues: { ':tid': tenantId },
    }));
    return (result.Items as Campaign[]) || [];
  },

  async update(tenantId: string, campaignId: string, updates: Partial<Campaign>): Promise<void> {
    const expressions: string[] = [];
    const names: Record<string, string> = {};
    const values: Record<string, unknown> = {};

    Object.entries(updates).forEach(([key, value]) => {
      const attrName = `#${key}`;
      const attrValue = `:${key}`;
      expressions.push(`${attrName} = ${attrValue}`);
      names[attrName] = key;
      values[attrValue] = value;
    });

    expressions.push('#updatedAt = :now');
    names['#updatedAt'] = 'updatedAt';
    values[':now'] = new Date().toISOString();

    await dynamodb.send(new UpdateCommand({
      TableName: TABLE(),
      Key: { tenantId, campaignId },
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    }));
  },
};
