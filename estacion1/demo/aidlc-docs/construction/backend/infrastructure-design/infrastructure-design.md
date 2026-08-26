# Infrastructure Design — Backend

## Compute
- **AWS Lambda** (nodejs22.x, 256MB, 30s timeout)
- Single function `skillwall-dev-api` handles all routes
- Bundled with esbuild (`format: 'cjs'`, single `index.js`)
- Deployed via `aws lambda update-function-code --zip-file`

## Storage
- **DynamoDB** table `skillwall-dev-participants` (on-demand billing, single-table design)
- **S3** bucket `skillwall-dev-photos-<ACCOUNT_ID>` for participant photos

## API
- **API Gateway HTTP API v2** (payload format 2.0)
- CORS configured at API Gateway level (preflight) + Lambda level (response headers)
- Throttling: 5 TPS on join/like routes via stage route_settings

## IAM Permissions
- `dynamodb:GetItem, PutItem, Query, UpdateItem, DeleteItem, BatchWriteItem, DescribeTable, TransactWriteItems`
- `s3:PutObject, GetObject`
- `logs:CreateLogGroup, CreateLogStream, PutLogEvents`

## Observability
- OpenTelemetry NodeSDK with OTLP/HTTP exporter to New Relic
- Structured JSON logs with traceId correlation
- CloudWatch log group `/aws/lambda/skillwall-dev-api`

## Environment Variables
| Variable | Purpose |
|---|---|
| DYNAMODB_TABLE_NAME | DynamoDB table name |
| S3_BUCKET_NAME | S3 bucket for photos |
| ADMIN_TOKEN | Admin authentication token |
| CORS_ORIGIN | Allowed CORS origin |
| NEW_RELIC_LICENSE_KEY | OTel export auth |
| NODE_OPTIONS | `--enable-source-maps` |
