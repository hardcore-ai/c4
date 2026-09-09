# Logical Components — auth-lambda

**Unit**: Unit 6 — auth-lambda (`entrevista-auth`)
**Generated**: 2026-03-10

This document maps NFR design patterns to concrete logical components — the building blocks that code generation will implement.

---

## Component Map

```
Lambda Entry Point (Mangum)
        |
        v
+---------------------------+
|    FastAPI Application     |
|                           |
|  Middleware stack:        |
|  1. CORSMiddleware        |
|  2. CorrelationIdMiddleware|
|  3. XRayTracingMiddleware |
|                           |
|  Global exception handler |
+----------+----------------+
           |
           v
+----------+----------------+
|       AuthRouter          |
|  (FastAPI APIRouter)      |
|  POST /auth/login         |
|  POST /auth/verify-otp   |
|  POST /auth/refresh       |
|  POST /auth/logout        |
|  POST /operators/bootstrap|
|  POST /operators          |
|  GET  /operators/{id}     |
|  PATCH /operators/{id}    |
|  PATCH /operators/{id}/pw |
|  POST /operators/{id}/deactivate|
|  GET  /health             |
+----------+----------------+
           |
    +------+------+
    |             |
    v             v
+-------+   +----------+
|AuthSvc|   |OpMgr     |
+---+---+   +----+-----+
    |             |
    |    +--------+--------+--------+
    |    |        |        |        |
    v    v        v        v        v
+--------+ +-------+ +--------+ +----------+
|TokenMgr| |BFProt | |MFAMgr  | |MongoRepo |
+--------+ +-------+ +--------+ +----------+
    |                    |            |
    v                    v            v
+----------+      +----------+  +----------+
|SecretsLdr|      |SESClient |  |MotorDB   |
+----------+      +----------+  +----------+
                                     |
                                +----+----+
                                |         |
                           MongoDB Atlas  mongo_retry
                                          wrapper
```

---

## Logical Component Definitions

---

### LC-01: CorrelationIdMiddleware

**Type**: FastAPI ASGI middleware
**Pattern**: Pattern 5 (Correlation ID)

**Responsibilities**:
- Generate `request_id = uuid.uuid4()` for every incoming request
- Bind `request_id` to `structlog.contextvars`
- Annotate AWS X-Ray trace with `request_id`
- Add `X-Request-Id: {request_id}` to every response header
- Clear structlog context after response

**Inputs**: Raw HTTP request
**Outputs**: HTTP response with `X-Request-Id` header; structlog context populated

---

### LC-02: CORSMiddleware

**Type**: FastAPI `starlette.middleware.cors.CORSMiddleware`
**Pattern**: Pattern 9 (CORS)

**Responsibilities**:
- Set `Access-Control-Allow-Origin` to `settings.ALLOWED_ORIGIN` (single value)
- Set `Access-Control-Allow-Credentials: true`
- Allow methods: GET, POST, PATCH, OPTIONS
- Allow headers: Authorization, Content-Type
- Reject preflight requests from non-allowed origins

**Configuration source**: `ALLOWED_ORIGIN` environment variable (required; startup fails if unset)

---

### LC-03: GlobalExceptionHandler

**Type**: FastAPI `@app.exception_handler(Exception)`
**Pattern**: Pattern 7 (Fail-Closed)

**Responsibilities**:
- Catch any unhandled exception that escapes route handlers
- Log full exception with stack trace to CloudWatch via structlog (includes `request_id`)
- Return `HTTP 500 { "error": "internal_error" }` with no internal details
- Never expose stack traces, module paths, or DB details in response body

---

### LC-04: SecretsLoader

**Type**: Module-level singleton (initialized at cold start)
**Pattern**: Pattern 2 (Secrets Caching)

**Responsibilities**:
- On cold start: call `boto3 secretsmanager.get_secret_value()` for RS256 private key and MongoDB URI
- Parse and cache as module-level variables: `_PRIVATE_KEY`, `_MONGO_URI`
- Provide accessor functions: `get_private_key() -> RSAPrivateKey`, `get_mongo_uri() -> str`
- Wrap in X-Ray subsegment: `## secretsmanager.get_secret_value`

**Failure handling**: If Secrets Manager is unreachable at cold start, raise `RuntimeError` — Lambda will not start. This is intentional (fail-safe: do not start without secrets).

---

### LC-05: MongoRepository

**Type**: Async data access layer using `motor`
**Pattern**: Pattern 1 (Retry with Exponential Backoff)

**Responsibilities**:
- Wrap all MongoDB operations with `mongo_retry()` decorator
- Expose typed async methods per collection:
  - `operators`: find_by_email_tenant, find_by_id_tenant, insert, update, soft_delete
  - `refresh_tokens`: insert, find_by_hash, revoke_by_jti, revoke_all_for_operator
  - `revoked_tokens`: insert, exists_by_jti
  - `login_attempts`: insert, count_failures_in_window
  - `mfa_pending`: insert, find_by_pending_token, increment_attempts, delete

**X-Ray subsegments**: Each method wraps its MongoDB call in `## mongodb.{collection}.{operation}`

**Connection**: `motor.AsyncIOMotorClient` initialized once at cold start from `SecretsLoader.get_mongo_uri()`; connection pool max_size=10

---

### LC-06: TokenManager

**Type**: Pure module (no I/O) + MongoRepository for revocation
**Pattern**: Pattern 2 (Secrets Caching for private key)

**Responsibilities**:
- `issue_access_token(operator_id, tenant_id, role) -> str`: Sign RS256 JWT with cached private key; include `jti=uuid4()`, `exp=now+3600`
- `validate_access_token(token) -> JWTPayload`: Verify RS256 signature using public key env var; check expiry; check JTI not revoked (MongoDB lookup)
- `issue_refresh_token(operator_id, tenant_id) -> str`: Generate opaque UUID v4; store SHA-256 hash in `refresh_tokens`; return plaintext
- `revoke_access_jti(jti, operator_id, expires_at, reason)`: Insert into `revoked_tokens`
- `revoke_refresh_token(token_hash)`: Mark `refresh_tokens.revoked=true`

---

### LC-07: BruteForceProtector

**Type**: Stateless — all state in MongoRepository
**Pattern**: Brute-force lockout (5 failures / 15 min → 15-min lockout)

**Responsibilities**:
- `is_locked(email, tenant_id) -> tuple[bool, int]`: Count `login_attempts` failures in last 15 min; return (locked, remaining_seconds)
- `record_attempt(email, tenant_id, success: bool)`: Insert `LoginAttempt` document

**No state in Lambda memory** — all state is in MongoDB. Consistent across Lambda instances.

---

### LC-08: MFAManager

**Type**: Orchestrates mfa_pending collection + SESClient
**Pattern**: Pattern 4 (MFA Two-Step Flow)

**Responsibilities**:
- `initiate(operator_id, tenant_id, email) -> str`: Generate 6-digit OTP, SHA-256 hash it, store in `mfa_pending`, send via SESClient, return `pending_token` (UUID v4)
- `verify(pending_token, otp) -> bool`: Load `mfa_pending`; compare `SHA-256(otp)` vs stored hash; increment attempts or delete record
- Raises `MFADeliveryError` if SES call fails → caller returns 503

---

### LC-09: SESClient

**Type**: Thin wrapper over `boto3.client('ses')`
**Pattern**: Fire-and-forget (single attempt, no retry)

**Responsibilities**:
- `send_otp_email(to_email, otp_code, operator_name) -> None`
- Formats HTML + plaintext OTP email
- Raises `SESDeliveryError` on any boto3 exception (caller handles as 503)
- Wraps call in X-Ray subsegment: `## ses.send_email`

**Sender**: `settings.SES_SENDER_EMAIL` (required env var)

---

### LC-10: ComplianceClient

**Type**: Thin async HTTP client (fire-and-forget)
**Pattern**: Single attempt, no retry, no await in critical path

**Responsibilities**:
- `emit(event_type, operator_id, tenant_id, metadata) -> None`
- Creates `asyncio.Task` (fire-and-forget) — does not `await` the result
- Logs emission failure at WARNING level (does not propagate exception)
- Wraps call in X-Ray subsegment: `## compliance.emit_event`

---

### LC-11: LoggingProcessor (structlog)

**Type**: structlog processor pipeline
**Pattern**: Pattern 6 (Structured Logging)

**Processor chain**:
```
structlog.contextvars.merge_contextvars   # injects request_id, operator_id, tenant_id
→ structlog.processors.TimeStamper(fmt="iso", utc=True)
→ structlog.stdlib.add_log_level
→ SensitiveFieldFilter                    # strips password/token/otp/hash/secret fields
→ structlog.processors.StackInfoRenderer
→ structlog.processors.ExceptionRenderer
→ structlog.processors.JSONRenderer
```

**SensitiveFieldFilter**: Custom processor — scans event dict for keys matching `{password, token, otp, otp_hash, hash, secret, plaintext}` and replaces values with `"[REDACTED]"`.

---

## Environment Variables Reference

| Variable | Required | Source | Notes |
|----------|----------|--------|-------|
| `RS256_PUBLIC_KEY` | Yes | Env var | PEM-encoded public key; set at deploy |
| `RS256_SECRET_NAME` | Yes | Env var | AWS Secrets Manager secret name for private key |
| `MONGO_SECRET_NAME` | Yes | Env var | AWS Secrets Manager secret name for MongoDB URI |
| `SES_SENDER_EMAIL` | Yes | Env var | Verified SES sender address |
| `ALLOWED_ORIGIN` | Yes | Env var | Single dashboard domain for CORS |
| `COMPLIANCE_LAMBDA_URL` | Yes | Env var | HTTP endpoint for compliance-lambda |
| `AWS_REGION` | Yes | Lambda runtime | Provided by Lambda automatically |
| `LOG_LEVEL` | No | Env var | Default: `INFO` |

---

*End of logical-components.md*
