# Unit of Work Dependencies — SkillWall Live

## Dependency Matrix

| Unit | Depends On | Dependency Type | Details |
|---|---|---|---|
| infra | — | None | Standalone, provisions all AWS resources |
| backend | infra | Deploy-time | Needs Lambda ARN, DynamoDB table name, S3 bucket name, API GW URL |
| frontend | infra + backend | Deploy-time | Needs API Gateway URL (NEXT_PUBLIC_API_URL) |

## Execution Order

```
infra (terraform apply)
  |
  +---> backend (deploy.sh: esbuild → zip → update-function-code)
          |
          +---> frontend (vercel deploy with NEXT_PUBLIC_API_URL)
```

**Strict order**: infra → backend → frontend

## Integration Points

| From | To | Interface | Protocol |
|---|---|---|---|
| frontend | backend | REST API (8 endpoints) | HTTPS + JSON + traceparent |
| frontend | S3 | Pre-signed PUT URL | HTTPS (direct upload) |
| backend | DynamoDB | AWS SDK v3 | IAM-authenticated |
| backend | S3 | AWS SDK v3 (pre-signed gen) | IAM-authenticated |
| backend | New Relic | OTLP/HTTP | HTTPS + api-key |
| frontend | New Relic | OTLP/HTTP | HTTPS (browser SDK) |

## Shared Artifacts

| Artifact | Units | Sync Strategy |
|---|---|---|
| Skills catalog (15 items) | backend, frontend | Duplicate in both `/backend/src/constants/skills.ts` and `/frontend/src/constants/skills.ts` |
| TypeScript types (Participant, Skill, etc.) | backend, frontend | Duplicate — types are simple, manual sync acceptable for demo |

## Environment Variables Flow

```
infra outputs → backend env vars → frontend env vars

infra outputs:
  - api_gateway_url
  - dynamodb_table_name
  - s3_bucket_name
  - lambda_function_name

backend env vars (Lambda):
  - DYNAMODB_TABLE_NAME (from infra)
  - S3_BUCKET_NAME (from infra)
  - ADMIN_TOKEN (manual/secret)
  - NEW_RELIC_LICENSE_KEY (manual/secret)
  - CORS_ORIGIN (Vercel domain)
  - SESSION_CODE (LATAM2026)

frontend env vars (Vercel):
  - NEXT_PUBLIC_API_URL (from infra: api_gateway_url)
  - NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY (for browser SDK)
```
