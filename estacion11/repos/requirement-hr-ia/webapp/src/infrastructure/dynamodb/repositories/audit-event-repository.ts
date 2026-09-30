import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb } from '../client';
import { getTableName, DYNAMODB_TABLES } from '@/shared/constants';
import type { AuditEvent } from '@/domain/compliance/entities/audit-event';

const TABLE = () => getTableName(DYNAMODB_TABLES.AUDIT_EVENTS);

export const auditEventRepository = {
  async append(tenantId: string, event: AuditEvent): Promise<void> {
    await dynamodb.send(new PutCommand({
      TableName: TABLE(),
      Item: { tenantId, ...event },
    }));
  },

  async findByEntity(tenantId: string, entityId: string): Promise<AuditEvent[]> {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLE(),
      KeyConditionExpression: 'tenantId = :tid',
      FilterExpression: 'entityId = :eid',
      ExpressionAttributeValues: {
        ':tid': tenantId,
        ':eid': entityId,
      },
    }));
    return (result.Items as AuditEvent[]) || [];
  },
};
