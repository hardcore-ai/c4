import { NextResponse } from 'next/server';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';

// Health check: una llamada barata a DynamoDB que funciona igual en AWS y en
// LocalStack. (DescribeEndpoints no está implementado en el emulador y devolvía 503.)
export async function GET() {
  const startedAt = Date.now();
  try {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT }),
    });

    await client.send(new ListTablesCommand({ Limit: 1 }));

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      checks: { dynamodb: 'ok', latencyMs: Date.now() - startedAt },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: { dynamodb: error instanceof Error ? error.name : 'error', latencyMs: Date.now() - startedAt },
      },
      { status: 503 },
    );
  }
}
