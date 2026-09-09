# Infrastructure Design — auth-lambda

**Unit**: Unit 6 — auth-lambda (`entrevista-auth`)
**Generated**: 2026-03-10
**Cloud Provider**: AWS
**Design Basis**: INFRA-AUTH-01=B (PrivateLink), INFRA-AUTH-02=A (HTTP API), INFRA-AUTH-03=A (WAF)

---

## Infrastructure Component Inventory

| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| Lambda Function | AWS Lambda (arm64) | auth-lambda runtime |
| API Gateway | API Gateway HTTP API (v2) | Public HTTPS endpoint; throttling |
| WAF | AWS WAF v2 | OWASP CRS + IP reputation protection |
| VPC | Amazon VPC | Isolates Lambda; enables PrivateLink |
| Private Subnets | VPC Subnets (2 AZs) | Lambda execution environment |
| MongoDB Atlas PrivateLink | AWS PrivateLink (Interface Endpoint) | Private connectivity to Atlas |
| Secrets Manager Endpoint | VPC Interface Endpoint | Private access to secrets (no internet) |
| SES Endpoint | VPC Interface Endpoint | Private email sending (no internet) |
| X-Ray Endpoint | VPC Interface Endpoint | Private trace upload (no internet) |
| Lambda Endpoint | VPC Interface Endpoint | Private calls to compliance-lambda |
| IAM Role | AWS IAM | Lambda execution role (least privilege) |
| Secrets Manager | AWS Secrets Manager | RS256 private key + MongoDB URI |
| CloudWatch Log Group | Amazon CloudWatch Logs | Structured log retention (90 days) |
| CloudWatch Alarms | Amazon CloudWatch Alarms | Security + performance alerting |
| Security Groups | VPC Security Groups | Network-level access control |

---

## Networking Architecture

### VPC Design

```
VPC: entrevista-vpc (CIDR: 10.0.0.0/16)
  |
  +-- Private Subnet A (AZ: us-east-1a) — 10.0.1.0/24
  |   Lambda ENIs attach here
  |
  +-- Private Subnet B (AZ: us-east-1b) — 10.0.2.0/24
      Lambda ENIs attach here (multi-AZ for resilience)

No public subnets required.
No Internet Gateway required.
No NAT Gateway required.
```

> All outbound connectivity to AWS services uses VPC Interface Endpoints (PrivateLink), keeping traffic entirely within the AWS network.

### VPC Interface Endpoints

| Endpoint | Service | Subnets | Security Group |
|----------|---------|---------|----------------|
| `vpce-secretsmanager` | `com.amazonaws.{region}.secretsmanager` | Private A + B | sg-lambda-endpoints |
| `vpce-ses` | `com.amazonaws.{region}.email-smtp` | Private A + B | sg-lambda-endpoints |
| `vpce-xray` | `com.amazonaws.{region}.xray` | Private A + B | sg-lambda-endpoints |
| `vpce-lambda` | `com.amazonaws.{region}.lambda` | Private A + B | sg-lambda-endpoints |

### MongoDB Atlas PrivateLink

- Atlas Private Endpoint provisioned in `entrevista-vpc`
- Endpoint connects to Atlas cluster's PrivateLink service
- Atlas only accepts connections from `sg-auth-lambda` security group
- No public Atlas endpoint enabled (Atlas project network policy: deny public)

### Security Groups

**sg-auth-lambda** (Lambda function's SG):
```
Inbound:  NONE (Lambda has no inbound; API Gateway invokes via Lambda service)
Outbound:
  TCP 27017  → sg-atlas-privatelink    (MongoDB Atlas PrivateLink)
  TCP 443    → sg-lambda-endpoints     (AWS service endpoints: SES, SM, X-Ray, Lambda)
```

**sg-lambda-endpoints** (VPC Interface Endpoints' SG):
```
Inbound:
  TCP 443    from sg-auth-lambda       (allow Lambda to reach endpoints)
Outbound: NONE (endpoints are destination, not source)
```

**sg-atlas-privatelink** (Atlas PrivateLink endpoint's SG):
```
Inbound:
  TCP 27017  from sg-auth-lambda       (allow Lambda MongoDB connections)
Outbound: NONE
```

---

## Compute: Lambda Function

| Attribute | Value |
|-----------|-------|
| Function name | `entrevista-auth` |
| Runtime | Python 3.12 |
| Architecture | arm64 (Graviton2) |
| Memory | 512 MB |
| Timeout | 30 seconds |
| Provisioned Concurrency | None (cold starts acceptable) |
| VPC | `entrevista-vpc` |
| Subnets | Private Subnet A + B |
| Security Group | `sg-auth-lambda` |
| Reserved Concurrency | None (unreserved) |
| X-Ray tracing | Active |
| Log group | `/aws/lambda/entrevista-auth` (retention: 90 days) |
| Environment variables | See table below |

**Environment variables**:

| Variable | Value | Source |
|----------|-------|--------|
| `RS256_PUBLIC_KEY` | PEM string | Set at deploy (IaC) |
| `RS256_SECRET_NAME` | `entrevista/auth/rs256-private-key` | IaC constant |
| `MONGO_SECRET_NAME` | `entrevista/auth/mongodb-uri` | IaC constant |
| `SES_SENDER_EMAIL` | `noreply@entrevista.ai` | IaC constant |
| `ALLOWED_ORIGIN` | `https://app.entrevista.ai` | IaC constant |
| `COMPLIANCE_LAMBDA_URL` | `https://...lambda-url.../` | Set after compliance-lambda deployed |
| `LOG_LEVEL` | `INFO` | IaC constant |
| `AWS_REGION` | (injected by Lambda runtime) | Automatic |

---

## API Gateway: HTTP API

| Attribute | Value |
|-----------|-------|
| Type | HTTP API (API Gateway v2) |
| Name | `entrevista-auth-api` |
| Protocol | HTTPS only (TLS 1.2+) |
| Stage | `$default` (single-stage) |
| Access logging | Enabled → CloudWatch Log Group `/aws/apigateway/entrevista-auth-api` (90 days) |
| Execution logging | Disabled (HTTP API does not support execution logging; access logging sufficient) |
| Default throttle | 20 req/s burst, 20 req/s rate |
| CORS | Disabled at gateway level (handled by FastAPI CORS middleware in Lambda) |

**Routes** (all proxied to Lambda):
```
POST   /api/v1/auth/login
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/operators/bootstrap
POST   /api/v1/operators
GET    /api/v1/operators/{operator_id}
PATCH  /api/v1/operators/{operator_id}
PATCH  /api/v1/operators/{operator_id}/password
POST   /api/v1/operators/{operator_id}/deactivate
GET    /api/v1/health
ANY    /{proxy+}   → Lambda (Mangum handles routing)
```

All routes use `$default` integration (Lambda proxy).

---

## WAF: WebACL

| Attribute | Value |
|-----------|-------|
| WebACL name | `entrevista-auth-waf` |
| Scope | REGIONAL (HTTP API is regional) |
| Association | `entrevista-auth-api` (API Gateway) |
| Default action | Allow |

**Managed Rule Groups**:

| Rule Group | Priority | Action | Purpose |
|------------|----------|--------|---------|
| `AWSManagedRulesCommonRuleSet` | 10 | Block | OWASP Core Rule Set — SQLi, XSS, LFI |
| `AWSManagedRulesKnownBadInputsRuleSet` | 20 | Block | Known malicious patterns |
| `AWSManagedRulesAmazonIpReputationList` | 30 | Block | AWS IP reputation (botnets, scanners) |

**Custom rules**:

| Rule | Priority | Description |
|------|----------|-------------|
| Rate limit `/auth/login` | 5 | Count: 20 req/5min per IP; Block on exceed |

> Note: WAF rate limit on `/auth/login` per IP (20 req/5min) is independent from and complementary to the per-account brute-force lockout in Lambda.

---

## IAM Execution Role

**Role name**: `entrevista-auth-lambda-role`

**Trust policy**: Lambda service (`lambda.amazonaws.com`)

**Attached policies**:

| Policy | Type | Permissions |
|--------|------|-------------|
| `AWSLambdaVPCAccessExecutionRole` | AWS Managed | EC2 ENI management for VPC |
| `entrevista-auth-secretsmanager-policy` | Customer Managed | `secretsmanager:GetSecretValue` on specific ARNs only |
| `entrevista-auth-ses-policy` | Customer Managed | `ses:SendEmail` on specific identity ARN only |
| `entrevista-auth-xray-policy` | Customer Managed | `xray:PutTraceSegments`, `xray:PutTelemetryRecords` |
| `entrevista-auth-logs-policy` | Customer Managed | `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` on specific log group ARN |
| `entrevista-auth-lambda-policy` | Customer Managed | `lambda:InvokeFunction` on compliance-lambda ARN only |

> SECURITY-06 compliance: No wildcard resources or actions. Each policy is scoped to specific resource ARNs.

---

## Secrets Manager

| Secret Name | Contents | Rotation |
|-------------|----------|---------|
| `entrevista/auth/rs256-private-key` | RSA 2048-bit private key (PEM) | Manual (key rotation out of MVP scope) |
| `entrevista/auth/mongodb-uri` | `mongodb+srv://...` connection string | Manual |

---

## CloudWatch Observability

**Log Groups**:

| Log Group | Retention | Contents |
|-----------|-----------|---------|
| `/aws/lambda/entrevista-auth` | 90 days | Structured JSON Lambda logs (structlog) |
| `/aws/apigateway/entrevista-auth-api` | 90 days | API Gateway access logs |
| `aws-waf-logs-entrevista-auth` | 90 days | WAF allow/block decisions |

**CloudWatch Alarms**:

| Alarm | Metric | Threshold | Action |
|-------|--------|-----------|--------|
| `auth-lambda-errors` | Lambda Errors | > 5 in 5 min | SNS notification |
| `auth-lambda-duration-p99` | Lambda Duration p99 | > 1000ms sustained 3 periods | SNS notification |
| `auth-login-failures-spike` | CloudWatch Metric Filter on `LOGIN_FAILURE` log pattern | > 20 in 5 min | SNS notification |
| `auth-4xx-rate` | API Gateway 4XXError | > 50% of requests in 5 min | SNS notification |
| `auth-waf-blocks` | WAF BlockedRequests | > 100 in 5 min | SNS notification |

**SNS Topic**: `entrevista-ops-alerts` (shared across all lambdas; subscriptions configured at deploy)

---

## Security Compliance Summary (Infrastructure Design Stage)

| Rule | Status | Notes |
|------|--------|-------|
| SECURITY-01: Encryption at rest/transit | Compliant | MongoDB Atlas: TLS enforced + encryption at rest (Atlas default); Secrets Manager: KMS encrypted; Lambda env vars: encrypted at rest |
| SECURITY-02: Access logging on network intermediaries | Compliant | API Gateway HTTP API access logging enabled (90 days); WAF logging enabled |
| SECURITY-03: Application-level logging | Compliant (prior stage) | structlog → CloudWatch; 90-day retention |
| SECURITY-04: HTTP security headers | N/A | API-only service; no HTML |
| SECURITY-05: Input validation | N/A | Code Generation |
| SECURITY-06: Least-privilege access | Compliant | All IAM policies scoped to specific resource ARNs; no wildcards |
| SECURITY-07: Restrictive network configuration | Compliant | Lambda in private VPC subnets; no inbound SG rules; no internet gateway; MongoDB via PrivateLink; AWS services via Interface Endpoints |
| SECURITY-08: Application-level access control | Compliant (prior stage) | CORS, RBAC, token validation |
| SECURITY-09: Hardening | N/A | Code Generation |
| SECURITY-10: Supply chain | N/A | Build and Test |
| SECURITY-11: Rate limiting | Compliant | API Gateway 20 req/s throttle + WAF custom rate rule on /auth/login |
| SECURITY-12: Authentication | Compliant (prior stage) | MFA, brute-force, argon2id |
| SECURITY-13: Data integrity | Compliant | Atlas encrypted + immutable audit log via compliance-lambda |
| SECURITY-14: Alerting and monitoring | Compliant | 5 CloudWatch alarms; 90-day log retention; X-Ray tracing |
| SECURITY-15: Exception handling | N/A | Code Generation |

---

*End of infrastructure-design.md*
