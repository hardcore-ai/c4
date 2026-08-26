# Business Logic Model — Unit: infra

## Resource Inventory

### 1. API Gateway HTTP API v2
- Name: `skillwall-{env}-api`
- Protocol: HTTP
- CORS: allowed origins = [Vercel domain, localhost:3000]
- Stage: `$default` with auto-deploy
- Access logging: enabled → CloudWatch log group
- Routes:
  - `POST /upload-url` → Lambda integration
  - `POST /join` → Lambda integration
  - `GET /wall` → Lambda integration
  - `POST /like` → Lambda integration
  - `GET /leaderboard` → Lambda integration
  - `POST /admin/sessions` → Lambda integration
  - `DELETE /admin/sessions/{sessionCode}` → Lambda integration
  - `GET /health` → Lambda integration
- Throttling: 5 TPS burst/rate on `POST /join` and `POST /like` routes

### 2. Lambda Function
- Name: `skillwall-{env}-api`
- Runtime: nodejs22.x
- Handler: index.handler
- Memory: 256 MB
- Timeout: 30s
- Environment variables:
  - `DYNAMODB_TABLE_NAME`
  - `S3_BUCKET_NAME`
  - `ADMIN_TOKEN`
  - `NEW_RELIC_LICENSE_KEY`
  - `CORS_ORIGIN`
  - `SESSION_CODE` (default: LATAM2026)
  - `NODE_OPTIONS=--enable-source-maps`
- Log group: `/aws/lambda/skillwall-{env}-api`, retention 7 days

### 3. IAM Role (Lambda Execution)
- Name: `skillwall-{env}-lambda-role`
- Trust policy: lambda.amazonaws.com
- Policies:
  - DynamoDB: GetItem, PutItem, Query, UpdateItem, DeleteItem, BatchWriteItem on table ARN
  - S3: PutObject, GetObject on bucket ARN (photos prefix)
  - CloudWatch Logs: CreateLogGroup, CreateLogStream, PutLogEvents

### 4. DynamoDB Table
- Name: `skillwall-{env}-participants`
- Billing: PAY_PER_REQUEST (on-demand)
- Partition Key: `PK` (String)
- Sort Key: `SK` (String)
- No GSIs (all access patterns served by PK/SK)
- Point-in-time recovery: disabled (demo)
- TTL: disabled

### 5. S3 Bucket
- Name: `skillwall-{env}-photos-{account_id}`
- Versioning: disabled
- Public access: blocked (all)
- CORS: allowed origins = [Vercel domain, localhost:3000], methods = [PUT], max age = 3600
- Lifecycle: none (data deleted via admin API)

### 6. CloudWatch Log Groups
- Lambda logs: `/aws/lambda/skillwall-{env}-api` (7 day retention)
- API Gateway access logs: `/aws/apigateway/skillwall-{env}-api` (7 day retention)

### 7. API Gateway Access Logging
- IAM role for API Gateway to write to CloudWatch
- Log format: JSON with requestId, ip, method, path, status, latency, protocol
