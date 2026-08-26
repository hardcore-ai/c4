# Business Rules — Unit: infra

## Naming Convention
- All resources: `skillwall-{env}-{resource}` where env = dev | demo | prod
- S3 bucket includes account_id suffix for global uniqueness

## Tagging
All resources tagged with:
- `Project`: skillwall
- `Environment`: {env}
- `ManagedBy`: terraform

## Security Constraints
- S3: Block all public access, CORS only for PUT from allowed origins
- Lambda IAM: least-privilege (only DynamoDB, S3, CloudWatch actions needed)
- API Gateway: CORS restricted to Vercel domain + localhost
- API Gateway throttling: 5 TPS burst and rate limit on POST /join and POST /like
- Admin endpoints: no throttling (low frequency, protected by adminToken)
- No secrets in Terraform state — adminToken and New Relic key passed as variables (not committed)

## Environment Strategy
- Variables file per environment: `terraform.tfvars` (dev default)
- Override via `-var-file=demo.tfvars` or `-var-file=prod.tfvars`
- Key differences by env: CORS origin, admin token, New Relic key
