# NFR Requirements — auth-lambda

**Unit**: Unit 6 — auth-lambda (`entrevista-auth`)
**Generated**: 2026-03-10
**Design Basis**: NFR-AUTH-01 through NFR-AUTH-12 + follow-up NFR-AUTH-03-FOLLOW

---

## Performance Requirements

| ID | Requirement | Target | Rationale |
|----|-------------|--------|-----------|
| PERF-AUTH-01 | Login endpoint p99 response time | ≤ 1,000 ms | Dashboard human interaction; argon2id adds ~100–300ms inherently |
| PERF-AUTH-02 | Token refresh p99 response time | ≤ 500 ms | Refresh is purely DB + JWT ops; no password hashing |
| PERF-AUTH-03 | All other endpoints (CRUD operators) p99 | ≤ 800 ms | DB read/write; no crypto overhead |
| PERF-AUTH-04 | Lambda cold start tolerance | Up to 3,000 ms extra | No Provisioned Concurrency; cold starts acceptable for dashboard login |
| PERF-AUTH-05 | MongoDB retry policy | 3 retries, 100ms exponential backoff | Reduces transient failure impact before returning 503 |

---

## Scalability Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| SCALE-AUTH-01 | Global API Gateway throttle on auth endpoint | 20 requests/second (burst: 50) |
| SCALE-AUTH-02 | Lambda concurrency | Unreserved (AWS default: up to account limit) |
| SCALE-AUTH-03 | MongoDB connection pool | motor async pool; max 10 connections per Lambda instance |

> Note: auth-lambda is low-volume by nature (operators only; not candidates). 20 req/s is intentionally conservative.

---

## Availability Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| AVAIL-AUTH-01 | Service availability | AWS Lambda SLA ~99.95% (no additional HA) |
| AVAIL-AUTH-02 | MongoDB unavailability behavior | Retry 3x with 100ms exponential backoff → 503 with user-friendly message |
| AVAIL-AUTH-03 | AWS SES unavailability behavior (MFA OTP) | Return 503 with message "Unable to send verification code — try again shortly" |
| AVAIL-AUTH-04 | Audit emission failure behavior | Fire-and-forget; auth operation succeeds even if compliance-lambda is unreachable |

---

## Security Requirements (SECURITY-01 to SECURITY-15 Baseline)

### MFA (SECURITY-12)

| ID | Requirement |
|----|-------------|
| SEC-AUTH-01 | ADMIN operators MUST complete Email OTP MFA on every login |
| SEC-AUTH-02 | RECRUITER operators are NOT required to complete MFA (SHOULD per SECURITY-12, not MUST) |
| SEC-AUTH-03 | MFA flow is 2-step: (1) password verified → OTP sent via AWS SES; (2) OTP verified → tokens issued |
| SEC-AUTH-04 | OTP is a 6-digit numeric code, cryptographically generated (`secrets.randbelow(1_000_000)`) |
| SEC-AUTH-05 | OTP TTL is 10 minutes; stored as SHA-256 hash in MongoDB `mfa_pending` collection |
| SEC-AUTH-06 | Maximum 3 failed OTP attempts before the pending MFA session is invalidated; operator must re-login |
| SEC-AUTH-07 | OTP email MUST be sent from verified AWS SES domain; sender address configurable via env var |

### Rate Limiting (SECURITY-11)

| ID | Requirement |
|----|-------------|
| SEC-AUTH-08 | API Gateway throttle: 20 requests/second (default), burst 50 on all auth endpoints |
| SEC-AUTH-09 | Per-account brute-force: 5 failures in 15 min → 15-min lockout (already in Functional Design) |
| SEC-AUTH-10 | OTP verification endpoint included in global throttle; separate per-session attempt limit (3 tries max) |

### CORS (SECURITY-08)

| ID | Requirement |
|----|-------------|
| SEC-AUTH-11 | CORS `Access-Control-Allow-Origin` set to single value from `ALLOWED_ORIGIN` environment variable |
| SEC-AUTH-12 | CORS must NOT use wildcard (`*`) |
| SEC-AUTH-13 | Allowed methods: `POST, GET, PATCH, OPTIONS` |
| SEC-AUTH-14 | Allowed headers: `Authorization, Content-Type` |
| SEC-AUTH-15 | `Access-Control-Allow-Credentials: true` (required for Bearer token auth from browser) |

### Logging (SECURITY-03)

| ID | Requirement |
|----|-------------|
| SEC-AUTH-16 | All log output MUST be structured JSON via `structlog` |
| SEC-AUTH-17 | Every log entry MUST include: `timestamp`, `request_id` (correlation), `level`, `message`, `operator_id` (where applicable) |
| SEC-AUTH-18 | Passwords, tokens (plaintext), and OTPs MUST NEVER appear in log output |
| SEC-AUTH-19 | Log output routed to AWS CloudWatch Logs via Lambda's stdout |
| SEC-AUTH-20 | CloudWatch log group retention: 90 days minimum (SECURITY-14) |

### Tracing (SECURITY-14)

| ID | Requirement |
|----|-------------|
| SEC-AUTH-21 | AWS X-Ray active tracing enabled on the Lambda function |
| SEC-AUTH-22 | X-Ray subsegments created for: MongoDB operations, AWS SES calls, JWT signing/validation |
| SEC-AUTH-23 | CloudWatch alarms configured for: login failure rate spike, 4xx/5xx error rate, latency p99 breaches |

---

## Reliability Requirements

| ID | Requirement |
|----|-------------|
| REL-AUTH-01 | All external calls (MongoDB, AWS SES, Secrets Manager, compliance-lambda) MUST have explicit error handling |
| REL-AUTH-02 | Global FastAPI exception handler MUST catch unhandled exceptions and return 500 with generic message (SECURITY-15) |
| REL-AUTH-03 | MongoDB connections MUST use try/finally to ensure connection cleanup in error paths |
| REL-AUTH-04 | Lambda timeout: 30 seconds (allows for 3 retries + argon2 hashing within budget) |
| REL-AUTH-05 | Lambda memory: 512 MB (argon2id is CPU-intensive; higher memory = faster execution) |

---

## Additional Entities Required (MFA Extension to Functional Design)

The Email OTP MFA decision adds one new MongoDB collection:

**Collection: `mfa_pending`**

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `operator_id` | string | |
| `tenant_id` | string | |
| `otp_hash` | string | SHA-256 of the 6-digit OTP |
| `attempts` | int | Failed OTP attempts; max 3 |
| `created_at` | datetime | |
| `expires_at` | datetime | `created_at + 10 minutes`; TTL index |

**New endpoint added to AuthRouter**:
- `POST /api/v1/auth/verify-otp` — accepts `{ pending_token, otp }` and issues final TokenPair on success

**Login flow update for ADMIN role**:
1. Password verified → `mfa_pending` record created → OTP sent via SES → HTTP 202 `{ "mfa_required": true, "pending_token": "<uuid>" }`
2. Dashboard prompts for OTP → `POST /auth/verify-otp` → tokens issued on success

---

## Security Compliance Summary (NFR Stage)

| Rule | Status | Notes |
|------|--------|-------|
| SECURITY-01: Encryption at rest/transit | N/A | MongoDB Atlas + TLS enforced in Infrastructure Design |
| SECURITY-02: Access logging on API Gateway | N/A | Infrastructure Design |
| SECURITY-03: Structured logging | Compliant | structlog + CloudWatch; no secrets in logs |
| SECURITY-04: HTTP security headers | N/A | auth-lambda is API-only, no HTML responses |
| SECURITY-05: Input validation | N/A | FastAPI/Pydantic enforced in Code Generation |
| SECURITY-06: Least-privilege IAM | N/A | Infrastructure Design |
| SECURITY-07: Network configuration | N/A | Infrastructure Design |
| SECURITY-08: Application-level access control | Compliant | CORS single origin; token validation per request; RBAC enforced |
| SECURITY-09: Hardening | N/A | Code Generation (no stack traces in responses) |
| SECURITY-10: Supply chain | N/A | Build and Test (lock file, dependency scan) |
| SECURITY-11: Rate limiting | Compliant | 20 req/s API Gateway throttle + per-account brute force lockout |
| SECURITY-12: Authentication | Compliant | argon2id; Email OTP MFA for ADMIN; brute-force protection; session invalidation on logout |
| SECURITY-13: Data integrity | Compliant | Audit events to compliance-lambda; CI/CD in Build & Test |
| SECURITY-14: Alerting and monitoring | Compliant | X-Ray tracing; CloudWatch alarms; 90-day log retention |
| SECURITY-15: Exception handling | N/A | Code Generation (global error handler) |

---

*End of nfr-requirements.md*
