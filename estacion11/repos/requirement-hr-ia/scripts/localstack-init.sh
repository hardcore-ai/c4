#!/bin/bash
# Bootstrap LocalStack with DynamoDB tables and Secrets Manager entries
# Usage: ./scripts/localstack-init.sh [endpoint]

ENDPOINT=${1:-http://localhost:4566}
PREFIX="entrevista-ai-local"
REGION="us-east-1"

AWS_CMD="aws --endpoint-url=$ENDPOINT --region=$REGION"

echo "=== Initializing LocalStack at $ENDPOINT ==="

# ── DynamoDB Tables ──

echo "Creating DynamoDB tables..."

$AWS_CMD dynamodb create-table \
  --table-name "${PREFIX}-conversations" \
  --attribute-definitions \
    AttributeName=tenantId,AttributeType=S \
    AttributeName=conversationId,AttributeType=S \
    AttributeName=telegramUserIdCampaignId,AttributeType=S \
  --key-schema AttributeName=tenantId,KeyType=HASH AttributeName=conversationId,KeyType=RANGE \
  --global-secondary-indexes '[{"IndexName":"ByTelegram","KeySchema":[{"AttributeName":"telegramUserIdCampaignId","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]' \
  --billing-mode PAY_PER_REQUEST 2>/dev/null && echo "  ✓ conversations" || echo "  - conversations (exists)"

$AWS_CMD dynamodb create-table \
  --table-name "${PREFIX}-campaigns" \
  --attribute-definitions \
    AttributeName=tenantId,AttributeType=S \
    AttributeName=campaignId,AttributeType=S \
  --key-schema AttributeName=tenantId,KeyType=HASH AttributeName=campaignId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST 2>/dev/null && echo "  ✓ campaigns" || echo "  - campaigns (exists)"

$AWS_CMD dynamodb create-table \
  --table-name "${PREFIX}-candidates" \
  --attribute-definitions \
    AttributeName=tenantId,AttributeType=S \
    AttributeName=candidateId,AttributeType=S \
    AttributeName=campaignId,AttributeType=S \
    AttributeName=state,AttributeType=S \
    AttributeName=telegramUserId,AttributeType=S \
  --key-schema AttributeName=tenantId,KeyType=HASH AttributeName=candidateId,KeyType=RANGE \
  --global-secondary-indexes \
    '[{"IndexName":"ByCampaign","KeySchema":[{"AttributeName":"campaignId","KeyType":"HASH"},{"AttributeName":"state","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}},{"IndexName":"ByTelegram","KeySchema":[{"AttributeName":"telegramUserId","KeyType":"HASH"},{"AttributeName":"tenantId","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}}]' \
  --billing-mode PAY_PER_REQUEST 2>/dev/null && echo "  ✓ candidates" || echo "  - candidates (exists)"

$AWS_CMD dynamodb create-table \
  --table-name "${PREFIX}-evaluations" \
  --attribute-definitions \
    AttributeName=tenantId,AttributeType=S \
    AttributeName=conversationId,AttributeType=S \
  --key-schema AttributeName=tenantId,KeyType=HASH AttributeName=conversationId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST 2>/dev/null && echo "  ✓ evaluations" || echo "  - evaluations (exists)"

$AWS_CMD dynamodb create-table \
  --table-name "${PREFIX}-audit-events" \
  --attribute-definitions \
    AttributeName=tenantId,AttributeType=S \
    AttributeName=eventId,AttributeType=S \
  --key-schema AttributeName=tenantId,KeyType=HASH AttributeName=eventId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST 2>/dev/null && echo "  ✓ audit-events" || echo "  - audit-events (exists)"

$AWS_CMD dynamodb create-table \
  --table-name "${PREFIX}-consent" \
  --attribute-definitions \
    AttributeName=tenantId,AttributeType=S \
    AttributeName=candidateId,AttributeType=S \
  --key-schema AttributeName=tenantId,KeyType=HASH AttributeName=candidateId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST 2>/dev/null && echo "  ✓ consent" || echo "  - consent (exists)"

# ── Secrets Manager ──

echo ""
echo "Creating Secrets Manager entries..."

$AWS_CMD secretsmanager create-secret \
  --name "${PREFIX}-openai-api-key" \
  --secret-string "sk-test-local-key" 2>/dev/null && echo "  ✓ openai-api-key" || echo "  - openai-api-key (exists)"

$AWS_CMD secretsmanager create-secret \
  --name "${PREFIX}-telegram-bot-token" \
  --secret-string "test-telegram-token" 2>/dev/null && echo "  ✓ telegram-bot-token" || echo "  - telegram-bot-token (exists)"

$AWS_CMD secretsmanager create-secret \
  --name "${PREFIX}-nextauth-secret" \
  --secret-string "local-nextauth-secret-32chars!!" 2>/dev/null && echo "  ✓ nextauth-secret" || echo "  - nextauth-secret (exists)"

$AWS_CMD secretsmanager create-secret \
  --name "${PREFIX}-cognito-client-secret" \
  --secret-string "local-cognito-secret" 2>/dev/null && echo "  ✓ cognito-client-secret" || echo "  - cognito-client-secret (exists)"

# ── Seed Tenant ──

echo ""
echo "Seeding test tenant..."

$AWS_CMD dynamodb put-item \
  --table-name "${PREFIX}-campaigns" \
  --item '{
    "tenantId": {"S": "tenant-demo"},
    "campaignId": {"S": "__tenant_record__"},
    "name": {"S": "Demo Company"},
    "careerPageUrl": {"S": "https://example.com/careers"},
    "createdAt": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}
  }' 2>/dev/null && echo "  ✓ tenant-demo seeded" || echo "  - tenant-demo (exists)"

echo ""
echo "=== LocalStack initialization complete ==="
echo ""
echo "Tables: $($AWS_CMD dynamodb list-tables --query 'TableNames' --output text)"
echo "Secrets: $($AWS_CMD secretsmanager list-secrets --query 'SecretList[].Name' --output text)"
