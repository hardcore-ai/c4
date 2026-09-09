# Deployment Architecture — auth-lambda

**Unit**: Unit 6 — auth-lambda (`entrevista-auth`)
**Generated**: 2026-03-10

---

## Architecture Diagram

```
Internet
   |
   | HTTPS (TLS 1.2+)
   v
+---------------------------+
|    AWS WAF v2             |
|  (entrevista-auth-waf)    |
|  - CRS managed rules      |
|  - IP reputation          |
|  - /auth/login rate rule  |
+----------+----------------+
           |
           v
+----------+----------------+
|  API Gateway HTTP API v2  |
|  (entrevista-auth-api)    |
|  Throttle: 20 req/s       |
|  Access logging: enabled  |
+----------+----------------+
           |
           | Lambda Proxy Integration
           | (AWS service network — no VPC crossing here)
           v
+----------+-------------------------------------------+
|               entrevista-vpc (10.0.0.0/16)            |
|                                                        |
|  Private Subnet A (us-east-1a)  10.0.1.0/24           |
|  Private Subnet B (us-east-1b)  10.0.2.0/24           |
|                                                        |
|  +--------------------------------------------------+  |
|  |    AWS Lambda: entrevista-auth                   |  |
|  |    arm64 | 512MB | 30s timeout                   |  |
|  |    sg-auth-lambda                                |  |
|  |                                                  |  |
|  |  FastAPI + Mangum                                |  |
|  |  +-----------+  +----------+  +-----------+      |  |
|  |  |AuthRouter |  |AuthSvc   |  |OpMgr      |      |  |
|  |  +-----------+  +----+-----+  +-----+-----+      |  |
|  |                      |              |             |  |
|  |             +--------+----+---------+--------+    |  |
|  |             |             |         |         |   |  |
|  |        +----+----+  +-----+---+ +---+----+ +-++  |  |
|  |        |TokenMgr |  |BFProt   | |MFAMgr  | |..| |  |
|  |        +---------+  +---------+ +----+---+ +--+  |  |
|  |                                      |            |  |
|  +----------------------------------+---+------------+  |
|                                     |                   |
|    VPC Interface Endpoints          |                   |
|    (sg-lambda-endpoints)            |                   |
|                                     |                   |
|  +-------------------+  +-----------+--------+          |
|  | vpce-secretsmanager|  |  vpce-ses          |          |
|  +-------------------+  +--------------------+          |
|  +-------------------+  +--------------------+          |
|  | vpce-xray         |  |  vpce-lambda       |          |
|  +-------------------+  +--------------------+          |
|                                                        |
|  +-------------------------------------------------+   |
|  |   MongoDB Atlas PrivateLink Endpoint            |   |
|  |   (sg-atlas-privatelink)                        |   |
|  +------------------------+------------------------+   |
+----------------------------|--------------------------+
                             |
                             | AWS PrivateLink
                             v
                    +--------+--------+
                    | MongoDB Atlas   |
                    | (us-east-1)     |
                    | TLS enforced    |
                    | Encryption @rest|
                    +-----------------+

Outside VPC (AWS service network):
+------------------+  +------------------+  +------------------+
| AWS Secrets Mgr  |  | AWS SES          |  | AWS X-Ray        |
| (via vpce)       |  | (via vpce)       |  | (via vpce)       |
+------------------+  +------------------+  +------------------+

+------------------+  +------------------+
| compliance-lambda|  | CloudWatch Logs  |
| (via vpce-lambda)|  | + Alarms         |
+------------------+  +------------------+
```

---

## Request Flow: Operator Login (ADMIN)

```
1. Browser → WAF → API Gateway → Lambda (cold start or warm)
2. Lambda: CorrelationIdMiddleware generates request_id
3. Lambda: BruteForceProtector queries MongoDB (via PrivateLink) — check lockout
4. Lambda: AuthService loads Operator from MongoDB
5. Lambda: AuthService.verify_password() — argon2id comparison (constant-time)
6. Lambda: MFAManager.initiate() — creates mfa_pending in MongoDB
7. Lambda: SESClient.send_otp_email() — sends via SES VPC endpoint
8. Lambda: Returns 202 { mfa_required: true, pending_token: "..." }
9. Browser: user enters OTP
10. Browser → WAF → API Gateway → Lambda
11. Lambda: MFAManager.verify() — checks OTP hash in MongoDB
12. Lambda: TokenManager.issue_access_token() — RS256 JWT (private key from Secrets Manager cache)
13. Lambda: TokenManager.issue_refresh_token() — stores hash in MongoDB
14. Lambda: ComplianceClient.emit(LOGIN_SUCCESS) — async fire-and-forget via vpce-lambda
15. Lambda: Returns 200 TokenPair
16. All steps: X-Ray subsegments recorded; structlog entries with request_id
```

---

## Deployment Sequence

For initial deployment, apply in this order:

```
Step 1: Provision VPC + subnets + security groups
Step 2: Provision VPC Interface Endpoints (SES, Secrets Manager, X-Ray, Lambda)
Step 3: Provision MongoDB Atlas Private Endpoint (Atlas console + AWS acceptance)
Step 4: Create Secrets Manager secrets (RS256 key pair + MongoDB URI)
Step 5: Create IAM execution role + policies
Step 6: Deploy Lambda function (entrevista-auth)
Step 7: Create API Gateway HTTP API + routes + Lambda integration
Step 8: Create WAF WebACL + managed rule groups + custom rate rule
Step 9: Associate WAF with API Gateway
Step 10: Create CloudWatch Log Groups with retention policies
Step 11: Create CloudWatch Alarms + SNS topic subscriptions
Step 12: Run smoke test: GET /api/v1/health → 200
Step 13: Run bootstrap: POST /api/v1/operators/bootstrap → 201
Step 14: Run login flow end-to-end
```

---

## IaC Strategy

**Tool**: AWS CDK (TypeScript) or Terraform — to be decided at Build & Test stage

**Recommended structure** (one stack per unit):

```
entrevista-auth/
  infra/
    shared-vpc/         # VPC + subnets + SGs + endpoints (shared across units)
    auth-lambda/        # Lambda + API Gateway + WAF + IAM + CloudWatch
  src/
    ...                 # Application code
```

> Note: The VPC, subnets, security groups, and VPC endpoints are **shared infrastructure** reused by all lambdas (auth, compliance, campaign, evaluation, conversation). They should be provisioned once in a `shared-vpc` stack, not duplicated per lambda.

---

## Shared Infrastructure Note

The following resources are shared across ALL lambda units and should be provisioned once:

| Resource | Shared By |
|----------|-----------|
| VPC `entrevista-vpc` | All 6 lambdas |
| Private Subnet A + B | All 6 lambdas |
| `sg-lambda-endpoints` | All 6 lambdas |
| VPC Interface Endpoints (SES, SM, X-Ray, Lambda) | All 6 lambdas |
| MongoDB Atlas Private Endpoint | All 6 lambdas |
| SNS Topic `entrevista-ops-alerts` | All 6 lambdas |

Per-lambda resources (provisioned separately per unit):

| Resource | Scope |
|----------|-------|
| Lambda function | Per unit |
| API Gateway HTTP API | Per unit |
| WAF WebACL | Per unit |
| IAM execution role | Per unit |
| CloudWatch Log Group `/aws/lambda/...` | Per unit |
| CloudWatch Alarms | Per unit |

---

*End of deployment-architecture.md*
