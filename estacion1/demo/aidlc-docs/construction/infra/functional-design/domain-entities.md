# Domain Entities — Unit: infra

## Terraform Variables (Inputs)

| Variable | Type | Default | Description |
|---|---|---|---|
| `environment` | string | `"dev"` | Environment name (dev/demo/prod) |
| `aws_region` | string | `"us-east-1"` | AWS region |
| `cors_origin` | string | `"http://localhost:3000"` | Allowed CORS origin |
| `admin_token` | string | (sensitive) | Admin API token |
| `new_relic_license_key` | string | (sensitive) | New Relic license key |
| `session_code` | string | `"LATAM2026"` | Default session code |
| `lambda_memory` | number | `256` | Lambda memory in MB |
| `lambda_timeout` | number | `30` | Lambda timeout in seconds |
| `log_retention_days` | number | `7` | CloudWatch log retention |

## Terraform Outputs

| Output | Description |
|---|---|
| `api_gateway_url` | HTTP API invoke URL |
| `api_gateway_id` | HTTP API ID |
| `lambda_function_name` | Lambda function name |
| `lambda_function_arn` | Lambda function ARN |
| `dynamodb_table_name` | DynamoDB table name |
| `dynamodb_table_arn` | DynamoDB table ARN |
| `s3_bucket_name` | S3 bucket name |
| `s3_bucket_arn` | S3 bucket ARN |

## Resource Dependency Graph

```
api_gateway_http_api
  +---> api_gateway_stage (depends on api)
  +---> api_gateway_routes (depends on api + integration)
  +---> api_gateway_integration (depends on api + lambda)

lambda_function
  +---> lambda_iam_role (depends on role)
  +---> lambda_iam_policy (depends on role + dynamodb + s3 + cloudwatch)
  +---> lambda_permission (allows API GW to invoke)
  +---> lambda_log_group

dynamodb_table (independent)

s3_bucket (independent)
  +---> s3_bucket_cors_configuration

cloudwatch_log_group_apigw
  +---> api_gateway_account (for access logging role)
  +---> iam_role_apigw_cloudwatch
```
