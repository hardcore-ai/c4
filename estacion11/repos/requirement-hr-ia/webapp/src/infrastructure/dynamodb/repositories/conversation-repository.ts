import { GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../client';
import { getTableName, DYNAMODB_TABLES } from '@/shared/constants';
import type { Conversation } from '@/domain/conversation/entities/conversation';

const TABLE = () => getTableName(DYNAMODB_TABLES.CONVERSATIONS);

export const conversationRepository = {
  async save(tenantId: string, conversation: Conversation): Promise<void> {
    await dynamodb.send(new PutCommand({
      TableName: TABLE(),
      Item: { tenantId, ...conversation },
    }));
  },

  async findById(tenantId: string, conversationId: string): Promise<Conversation | null> {
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLE(),
      Key: { tenantId, conversationId },
    }));
    return (result.Item as Conversation) || null;
  },

  async findByTelegramUser(telegramUserId: string, campaignId: string): Promise<Conversation | null> {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLE(),
      IndexName: 'ByTelegram',
      KeyConditionExpression: 'telegramUserIdCampaignId = :pk',
      ExpressionAttributeValues: {
        ':pk': `${telegramUserId}#${campaignId}`,
      },
      Limit: 1,
    }));
    return (result.Items?.[0] as Conversation) || null;
  },

  async updateSessionState(
    tenantId: string,
    conversationId: string,
    sessionState: Conversation['sessionState'],
    state: Conversation['state'],
  ): Promise<void> {
    await dynamodb.send(new UpdateCommand({
      TableName: TABLE(),
      Key: { tenantId, conversationId },
      UpdateExpression: 'SET sessionState = :ss, #st = :state, updatedAt = :now',
      ExpressionAttributeNames: { '#st': 'state' },
      ExpressionAttributeValues: {
        ':ss': sessionState,
        ':state': state,
        ':now': new Date().toISOString(),
      },
    }));
  },

  async addMessage(
    tenantId: string,
    conversationId: string,
    message: Conversation['messages'][number],
  ): Promise<void> {
    await dynamodb.send(new UpdateCommand({
      TableName: TABLE(),
      Key: { tenantId, conversationId },
      UpdateExpression: 'SET messages = list_append(messages, :msg), updatedAt = :now',
      ExpressionAttributeValues: {
        ':msg': [message],
        ':now': new Date().toISOString(),
      },
    }));
  },
};
