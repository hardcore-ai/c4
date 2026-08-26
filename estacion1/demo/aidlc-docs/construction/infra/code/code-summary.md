# Code Summary — Unit: infra

## Files Generated

| File | Purpose |
|---|---|
| `infra/main.tf` | Provider config (AWS ~>5.0), default tags, data sources |
| `infra/variables.tf` | 9 input variables (env, region, cors_origins as list, secrets, lambda config) |
| `infra/outputs.tf` | 8 outputs (API URL, Lambda ARN, DynamoDB table, S3 bucket) |
| `infra/dynamodb.tf` | DynamoDB table (PK/SK, on-demand) |
| `infra/s3.tf` | S3 bucket + public access block + CORS (PUT only, list of origins) |
| `infra/lambda.tf` | IAM role/policy (least-privilege incl. DescribeTable, TransactWriteItems) + Lambda function (Node.js 22) |
| `infra/api-gateway.tf` | HTTP API v2, 8 routes, Lambda integration, stage, access logs, throttling (5 TPS join/like) |
| `infra/cloudwatch.tf` | Log groups for Lambda and API GW + IAM role for API GW logging |
| `infra/terraform.tfvars` | Dev defaults (secrets via TF_VAR_*) |
| `infra/.gitignore` | Excludes .terraform, state files, dummy.zip |
| `infra/dummy.zip` | Placeholder Lambda code for initial terraform apply |

## Troubleshooting Improvements Applied
- **#3**: IAM policy includes DescribeTable, TransactWriteItems, BatchWriteItem
- **#20**: CORS only in API Gateway (source of truth)
- **#21**: `cors_origins` as `list(string)` for multi-origin support

## Validation
- `terraform init` — ✅ Success
- `terraform validate` — ✅ Success
- `terraform plan` — ✅ 24 resources to add

## Stories Covered
- TS-01 Infrastructure: All AWS resources provisioned
- TS-03 Security: CORS restricted, throttling 5 TPS on join/like, IAM least-privilege, S3 block public
