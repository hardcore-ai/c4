import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

let _dynamodb: DynamoDBDocumentClient | null = null;

export function getDynamoDB(): DynamoDBDocumentClient {
  if (!_dynamodb) {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      ...(process.env.DYNAMODB_ENDPOINT && {
        endpoint: process.env.DYNAMODB_ENDPOINT,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
        },
      }),
    });

    _dynamodb = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }
  return _dynamodb;
}

// Backward-compatible export — lazy getter
export const dynamodb = new Proxy({} as DynamoDBDocumentClient, {
  get(_target, prop) {
    return (getDynamoDB() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
