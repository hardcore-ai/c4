# NFR Design Patterns — auth-lambda

**Unit**: Unit 6 — auth-lambda (`entrevista-auth`)
**Generated**: 2026-03-10
**Design Basis**: NFR Requirements + NFRD-AUTH-01/02/03 answers

---

## Pattern 1: Retry with Exponential Backoff (MongoDB only)

**Addresses**: PERF-AUTH-05, REL-AUTH-02

**Scope**: Applied ONLY to MongoDB operations. SES and compliance-lambda use single-attempt fire-and-forget.

**Policy**:
```
max_attempts = 3
base_delay_ms = 100
backoff_factor = 2

Attempt 1: immediate
Attempt 2: wait 100ms
Attempt 3: wait 200ms
After 3 failures: raise ServiceUnavailableError → HTTP 503
```

**Retry-eligible errors** (transient only):
- `pymongo.errors.NetworkTimeout`
- `pymongo.errors.ConnectionFailure`
- `motor.motor_asyncio` connection reset

**Non-retry errors** (fail immediately):
- `pymongo.errors.DuplicateKeyError` — data conflict, not transient
- `pymongo.errors.OperationFailure` — auth/schema error, not transient
- Any `ValidationError` — always deterministic

**Implementation approach** (decorator pattern):
```python
async def with_mongo_retry(coro_func, *args, **kwargs):
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            return await coro_func(*args, **kwargs)
        except RETRYABLE_ERRORS as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(BASE_DELAY_MS * (2 ** attempt) / 1000)
    raise ServiceUnavailableError() from last_error
```

---

## Pattern 2: Secrets Caching (Cold-Start Load)

**Addresses**: PERF-AUTH-01 (avoid Secrets Manager latency on every request)

**Policy**: Load secrets from AWS Secrets Manager ONCE at Lambda cold start. Cache in module-level variables. Never reload during warm invocations.

**Secrets loaded at cold start**:
- RS256 Private Key → `_private_key` module variable (for JWT signing)
- MongoDB Atlas connection string → passed to `motor.AsyncIOMotorClient` once

**RS256 Public Key**: Loaded from `RS256_PUBLIC_KEY` environment variable (not Secrets Manager — read-only, safe as env var).

**Design rationale**: Lambda execution environments are single-threaded; no concurrency risk for module-level caching. Cold starts incur the Secrets Manager latency (~50–200ms) once, not on every request.

```
Cold Start:                     Warm Invocation:
  load_secrets()                  (skip — already cached)
  init_motor_client()             (reuse existing pool)
  init_dummy_hash()               (skip — already cached)
  → handler ready                 → handler ready (fast path)
```

---

## Pattern 3: Constant-Time Authentication (Timing Attack Prevention)

**Addresses**: SECURITY-12 (BR-AUTH-03), credential timing enumeration prevention

**Pattern**: Always execute `argon2.verify()` regardless of whether the email was found or the account is active.

```
Login request received
        |
        v
[Load operator by email+tenant]
        |
   Found?  ──No──> verify(password, DUMMY_HASH) → FAIL
        |
      Yes
        |
   Active? ──No──> verify(password, DUMMY_HASH) → FAIL
        |
      Yes
        |
[verify(password, operator.password_hash)]
        |
  Match? ──No──> FAIL
        |
      Yes → proceed to MFA / token issuance
```

`DUMMY_HASH` is pre-computed at cold start using `argon2id.hash("__dummy__")`.

---

## Pattern 4: MFA Two-Step Login Flow

**Addresses**: SEC-AUTH-01 to SEC-AUTH-07 (ADMIN Email OTP)

**Two-step state machine**:

```
Step 1: POST /auth/login
  [password OK] → create mfa_pending record → send OTP via SES
                   ↓ SES fails?
                   → 503 "Unable to send verification code"
                   ↓ SES succeeds?
                   → 202 { mfa_required: true, pending_token: "<uuid>" }

Step 2: POST /auth/verify-otp
  [OTP matches + not expired + attempts < 3]
    → delete mfa_pending record
    → issue TokenPair
    → 200 TokenPair

  [OTP wrong, attempt < 3]
    → increment attempts
    → 401 { error: "invalid_otp", attempts_remaining: N }

  [OTP wrong, attempts == 3]
    → delete mfa_pending record (invalidate session)
    → 401 { error: "max_otp_attempts_exceeded" }
    → operator must restart login from Step 1

  [pending_token not found or expired]
    → 401 { error: "invalid_token" }
```

**RECRUITER role**: Skips MFA. Step 1 returns 200 TokenPair directly if password verified.

**SES failure handling** (NFRD-AUTH-01=A):
- Return 503 immediately
- Do NOT create `mfa_pending` record
- Do NOT issue partial tokens
- Operator retries the full login sequence

---

## Pattern 5: Correlation ID Middleware

**Addresses**: SEC-AUTH-17, distributed tracing

**Pattern**: Generate UUID v4 per request in FastAPI middleware. Inject into:
1. `structlog` context (all subsequent log calls in the request automatically include it)
2. AWS X-Ray trace annotations
3. HTTP response header `X-Request-Id` (for dashboard debugging)

```python
@app.middleware("http")
async def correlation_id_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    structlog.contextvars.bind_contextvars(request_id=request_id)
    xray_recorder.put_annotation("request_id", request_id)
    response = await call_next(request)
    response.headers["X-Request-Id"] = request_id
    structlog.contextvars.clear_contextvars()
    return response
```

---

## Pattern 6: Structured Logging with Context Binding

**Addresses**: SECURITY-03, SEC-AUTH-16 to SEC-AUTH-19

**structlog processor chain**:
```
TimeStamper(fmt="iso") →
add_log_level →
StackInfoRenderer →
ExceptionRenderer →
JSONRenderer
```

**Context binding** (per-request, cleared after each invocation):
- `request_id`: UUID v4 from middleware
- `operator_id`: bound after authentication
- `tenant_id`: bound after authentication

**Sensitive field guard**: A custom processor strips any field named `password`, `token`, `otp`, `hash`, `secret` from log records before rendering.

---

## Pattern 7: Global Exception Handler (Fail-Closed)

**Addresses**: SECURITY-15, REL-AUTH-02

**Design**: FastAPI `@app.exception_handler(Exception)` catches all unhandled exceptions.

```
Unhandled exception caught
        |
        v
Log full stack trace to CloudWatch (structured, with request_id)
        |
        v
Return HTTP 500 { "error": "internal_error" }
(NO stack trace, NO internal details in response body)
```

**Fail-closed principle**: On any unexpected error in auth/authorization logic, default response is 500 (deny), never 200.

---

## Pattern 8: X-Ray Subsegment Wrapping

**Addresses**: SEC-AUTH-21, SEC-AUTH-22

X-Ray subsegments created for every external call:
- `## mongodb.{collection}.{operation}` — e.g., `## mongodb.operators.find_one`
- `## ses.send_email`
- `## secretsmanager.get_secret_value` (cold start only)
- `## compliance.emit_event` (fire-and-forget)

**Implementation**: Context manager around each external call.

---

## Pattern 9: CORS Middleware

**Addresses**: SEC-AUTH-11 to SEC-AUTH-15 (SECURITY-08)

FastAPI `CORSMiddleware` configured with:
```python
allow_origins=[settings.ALLOWED_ORIGIN]   # single env-var value
allow_credentials=True
allow_methods=["GET", "POST", "PATCH", "OPTIONS"]
allow_headers=["Authorization", "Content-Type"]
```

`ALLOWED_ORIGIN` is required — Lambda will fail at startup if unset (fail-safe).

---

*End of nfr-design-patterns.md*
