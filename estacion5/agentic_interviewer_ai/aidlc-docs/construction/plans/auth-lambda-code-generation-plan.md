# Code Generation Plan — Unit 6: auth-lambda

**Generated**: 2026-03-10
**Unit**: Unit 6 — auth-lambda (`entrevista-auth`)
**Stage**: CONSTRUCTION — Code Generation
**Project Type**: Greenfield — Polyrepo
**Code Location**: `/Users/cbraatz/workspace/SDD/ai-dlc/entrevista-auth/`
**Documentation**: `aidlc-docs/construction/auth-lambda/code/`

---

## Unit Context

**Story**: US-18 — Authenticate Into Dashboard (2 SP, Must-Have)
**Runtime**: Python 3.12 / FastAPI + Mangum / AWS Lambda arm64
**External Dependencies**: MongoDB Atlas (motor), AWS Secrets Manager, AWS SES, AWS X-Ray, compliance-lambda (HTTP)

**Key design artifacts**:
- Functional Design: 8 business flows, 41 rules, 5 MongoDB collections
- NFR Design: 9 patterns, 11 logical components
- Infrastructure: VPC + PrivateLink + HTTP API + WAF + IAM

---

## File Structure to Generate

```
/Users/cbraatz/workspace/SDD/ai-dlc/entrevista-auth/
  src/
    handler.py                  # Lambda entry point (Mangum adapter)
    app.py                      # FastAPI app factory + middleware + exception handler
    config.py                   # Settings (pydantic-settings)
    secrets.py                  # SecretsLoader (cold-start cache)
    logging_config.py           # structlog processor chain
    router.py                   # AuthRouter (FastAPI APIRouter)
    auth_service.py             # AuthService (login, refresh, logout, change_password)
    token.py                    # TokenManager (JWT RS256 issue/validate/revoke)
    brute_force.py              # BruteForceProtector
    operator.py                 # OperatorManager
    mfa.py                      # MFAManager (Email OTP 2-step flow)
    ses_client.py               # SESClient (boto3 SES wrapper)
    compliance_client.py        # ComplianceClient (fire-and-forget HTTP)
    middleware/
      __init__.py
      correlation_id.py         # CorrelationIdMiddleware
    repository/
      __init__.py
      mongo.py                  # MongoRepository base + retry wrapper
      operators.py              # OperatorRepository
      tokens.py                 # RefreshTokenRepository + RevokedTokenRepository
      login_attempts.py         # LoginAttemptRepository
      mfa_pending.py            # MFAPendingRepository
    models/
      __init__.py
      operator.py               # Operator domain model + OperatorRole enum
      token.py                  # RefreshToken, RevokedToken, JWTPayload, TokenPair
      login_attempt.py          # LoginAttempt
      mfa.py                    # MFAPending
      requests.py               # Pydantic request/response schemas
    exceptions.py               # Custom exception classes
  tests/
    unit/
      __init__.py
      test_auth_service.py      # AuthService unit tests
      test_token_manager.py     # TokenManager unit tests
      test_brute_force.py       # BruteForceProtector unit tests
      test_mfa.py               # MFAManager unit tests
      test_operator.py          # OperatorManager unit tests
    integration/
      __init__.py
      test_login_flow.py        # Full login + MFA 2-step flow integration tests
      test_operator_crud.py     # Operator lifecycle integration tests
      test_refresh_flow.py      # Refresh + rotation integration tests
  pyproject.toml
  Makefile
  .env.example
  README.md
```

---

## Generation Steps

### PART A — Project Structure & Configuration

- [x] **Step 1**: Create repository root structure
  - Create directories: `src/`, `src/middleware/`, `src/repository/`, `src/models/`, `tests/unit/`, `tests/integration/`
  - Create `pyproject.toml` with pinned dependencies (fastapi, mangum, motor, PyJWT, cryptography, argon2-cffi, structlog, boto3, aws-xray-sdk, pydantic-settings)
  - Create `Makefile` with targets: `install`, `test`, `build`, `deploy`, `lint`
  - Create `.env.example` documenting all required environment variables
  - Create `README.md` with service overview, local setup, and deployment instructions

- [x] **Step 2**: Generate `src/config.py`
  - pydantic-settings `Settings` class reading all env vars
  - Validated at startup (fail-fast if required vars missing)
  - Fields: `RS256_PUBLIC_KEY`, `RS256_SECRET_NAME`, `MONGO_SECRET_NAME`, `SES_SENDER_EMAIL`, `ALLOWED_ORIGIN`, `COMPLIANCE_LAMBDA_URL`, `LOG_LEVEL`

- [x] **Step 3**: Generate `src/secrets.py`
  - `SecretsLoader` class with cold-start caching (module-level)
  - `load_secrets()` — fetches RS256 private key + MongoDB URI from Secrets Manager
  - X-Ray subsegment wrapping
  - Raises `RuntimeError` if Secrets Manager unreachable at cold start

- [x] **Step 4**: Generate `src/logging_config.py`
  - structlog processor chain (TimeStamper → add_log_level → SensitiveFieldFilter → ExceptionRenderer → JSONRenderer)
  - `SensitiveFieldFilter` custom processor (strips password/token/otp/hash/secret)
  - `configure_logging()` called once at cold start

### PART B — Domain Models

- [x] **Step 5**: Generate `src/models/operator.py`
  - `OperatorRole` enum: ADMIN, RECRUITER
  - `Operator` dataclass / pydantic model (all fields from domain-entities.md)
  - `OperatorPublic` response model (excludes `password_hash`)

- [x] **Step 6**: Generate `src/models/token.py`
  - `TokenPair` model
  - `JWTPayload` model
  - `RefreshToken` MongoDB document model
  - `RevokedToken` MongoDB document model

- [x] **Step 7**: Generate `src/models/login_attempt.py`
  - `LoginAttempt` MongoDB document model

- [x] **Step 8**: Generate `src/models/mfa.py`
  - `MFAPending` MongoDB document model
  - OTP hash constants (SHA-256)

- [x] **Step 9**: Generate `src/models/requests.py`
  - `LoginRequest` — email, password, tenant_id (all validated with Pydantic v2)
  - `VerifyOTPRequest` — pending_token, otp
  - `RefreshRequest` — refresh_token
  - `LogoutRequest` — refresh_token
  - `CreateOperatorRequest` — email, name, role, password
  - `UpdateOperatorRequest` — name?, role?
  - `ChangePasswordRequest` — current_password, new_password
  - `BootstrapRequest` — email, name, password, tenant_id
  - Input validation: max-length constraints, email format, password policy

- [x] **Step 10**: Generate `src/exceptions.py`
  - `InvalidCredentialsError`
  - `InvalidTokenError`
  - `AccountLockedError` (includes `retry_after_seconds: int`)
  - `EmailConflictError`
  - `OperatorNotFoundError`
  - `PasswordPolicyError` (includes `violations: list[str]`)
  - `MFADeliveryError`
  - `MFAInvalidError` (includes `attempts_remaining: int`)
  - `ServiceUnavailableError`
  - `BootstrapAlreadyDoneError`

### PART C — Repository Layer

- [x] **Step 11**: Generate `src/repository/mongo.py`
  - `MongoRepository` base class with `motor` client initialized from `SecretsLoader`
  - `mongo_retry()` async decorator (3 retries, 100ms exponential backoff, retryable errors only)
  - Connection pool: max 10, serverSelectionTimeoutMS=5000

- [x] **Step 12**: Generate `src/repository/operators.py`
  - `OperatorRepository` with `mongo_retry` on all methods
  - Methods: `find_by_email_tenant`, `find_by_id_tenant`, `insert`, `update`, `soft_delete`, `count_by_tenant`
  - X-Ray subsegments on each method

- [x] **Step 13**: Generate `src/repository/tokens.py`
  - `RefreshTokenRepository`: `insert`, `find_by_hash`, `revoke`, `revoke_all_for_operator`
  - `RevokedTokenRepository`: `insert`, `exists_by_jti`
  - X-Ray subsegments on each method

- [x] **Step 14**: Generate `src/repository/login_attempts.py`
  - `LoginAttemptRepository`: `insert`, `count_failures_in_window`
  - X-Ray subsegments

- [x] **Step 15**: Generate `src/repository/mfa_pending.py`
  - `MFAPendingRepository`: `insert`, `find_by_pending_token`, `increment_attempts`, `delete`
  - X-Ray subsegments

### PART D — Unit Tests: Repository Layer

- [x] **Step 16**: Generate `tests/unit/test_auth_service.py`
  - Test cases for AuthService login flows (success, wrong password, not found, deactivated)
  - Constant-time behavior validation
  - Brute-force lockout path
  - MFADeliveryError propagation
  - Mock: OperatorRepository, BruteForceProtector, MFAManager, ComplianceClient

- [x] **Step 17**: Generate `tests/unit/test_token_manager.py`
  - JWT issuance: valid claims, correct expiry, jti present
  - JWT validation: valid, expired, revoked, invalid signature
  - Refresh token: issue → find_by_hash, rotate (old revoked + new issued)
  - Mock: RevokedTokenRepository, RefreshTokenRepository

- [ ] **Step 18**: Generate `tests/unit/test_brute_force.py`
  - Under threshold: not locked
  - At threshold (5 failures): locked, correct retry_after_seconds
  - After lockout expiry: unlocked
  - Mock: LoginAttemptRepository

- [ ] **Step 19**: Generate `tests/unit/test_mfa.py`
  - initiate: OTP stored as SHA-256, SES called, pending_token returned
  - verify: correct OTP → True; wrong OTP → False + attempts incremented
  - verify: 3 failed attempts → MFAPending deleted
  - verify: expired pending → MFAInvalidError
  - SES failure → MFADeliveryError
  - Mock: MFAPendingRepository, SESClient

- [ ] **Step 20**: Generate `tests/unit/test_operator.py`
  - create: success, email conflict, password policy violation
  - deactivate: success, self-deactivation blocked, not found, already deactivated
  - change_password: success, wrong current password, policy violation
  - bootstrap: success, already done
  - Mock: OperatorRepository

### PART E — Business Logic Components

- [ ] **Step 21**: Generate `src/brute_force.py`
  - `BruteForceProtector` class
  - `is_locked(email, tenant_id)` → `(bool, int)` (locked, remaining_seconds)
  - `record_attempt(email, tenant_id, success)` → None
  - Uses `LoginAttemptRepository`

- [ ] **Step 22**: Generate `src/token.py`
  - `TokenManager` class
  - `issue_access_token(operator_id, tenant_id, role)` → JWT string (RS256, cached private key)
  - `validate_access_token(token)` → JWTPayload (or raises `InvalidTokenError`)
  - `issue_refresh_token(operator_id, tenant_id)` → plaintext opaque token
  - `revoke_access_jti(jti, operator_id, expires_at, reason)` → None
  - `revoke_refresh_token(token_hash)` → None

- [ ] **Step 23**: Generate `src/ses_client.py`
  - `SESClient` with `boto3.client('ses')`
  - `send_otp_email(to_email, otp_code, operator_name)` → None
  - HTML + plaintext email template
  - Raises `MFADeliveryError` on boto3 exception
  - X-Ray subsegment

- [ ] **Step 24**: Generate `src/compliance_client.py`
  - `ComplianceClient` with `httpx.AsyncClient` (or `aiohttp`)
  - `emit(event_type, operator_id, tenant_id, metadata)` — creates asyncio.Task (fire-and-forget)
  - Logs WARNING on failure; never raises
  - X-Ray subsegment

- [ ] **Step 25**: Generate `src/mfa.py`
  - `MFAManager` class
  - `initiate(operator_id, tenant_id, email)` → pending_token (UUID v4)
  - `verify(pending_token, otp)` → bool
  - OTP: `secrets.randbelow(1_000_000)` zero-padded to 6 digits
  - OTP stored as `hashlib.sha256(otp.encode()).hexdigest()`

- [ ] **Step 26**: Generate `src/auth_service.py`
  - `AuthService` class orchestrating all login flows (8 flows from business-logic-model.md)
  - DUMMY_HASH computed at module level for constant-time defense
  - All 8 flows: login, refresh, logout, create_operator, deactivate_operator, change_password, bootstrap, validate_token

- [ ] **Step 27**: Generate `src/operator.py`
  - `OperatorManager` class
  - CRUD operations with full business rule enforcement (BR-OPS-01 to BR-OPS-06)
  - Password hashing via `argon2-cffi`

### PART F — API Layer

- [ ] **Step 28**: Generate `src/middleware/correlation_id.py`
  - `CorrelationIdMiddleware` ASGI middleware
  - Generates UUID v4 per request
  - Binds to structlog context
  - Annotates X-Ray trace
  - Adds `X-Request-Id` to response headers
  - Clears context after response

- [ ] **Step 29**: Generate `src/app.py`
  - `create_app()` factory function
  - FastAPI instance with title, version
  - Middleware registration (CORS → CorrelationId → XRay — order matters)
  - Global `@app.exception_handler(Exception)` (fail-closed: logs + returns 500)
  - Typed HTTP exception handlers (map custom exceptions to correct HTTP codes)
  - Router inclusion

- [ ] **Step 30**: Generate `src/router.py`
  - `AuthRouter` — all 11 endpoints from infrastructure-design.md
  - Dependency injection: `get_auth_service()`, `get_current_operator()` (JWT validation)
  - Pydantic request/response models on all endpoints
  - Role enforcement via `require_admin` dependency
  - Story US-18 fully covered

- [ ] **Step 31**: Generate `src/handler.py`
  - Lambda entry point
  - Calls `configure_logging()`, `load_secrets()` at cold start
  - Creates FastAPI app via `create_app()`
  - Wraps with `Mangum(app, lifespan="off")`

### PART G — Integration Tests

- [ ] **Step 32**: Generate `tests/integration/test_login_flow.py`
  - Full ADMIN login: password → 202 MFA → OTP → 200 TokenPair
  - Full RECRUITER login: password → 200 TokenPair (no MFA)
  - Login with brute force: 5 failures → 429 with Retry-After
  - SES failure → 503 (MFADeliveryError path)
  - Uses: `httpx.AsyncClient` against FastAPI test app; `mongomock_motor`; `moto[ses]`

- [ ] **Step 33**: Generate `tests/integration/test_refresh_flow.py`
  - Refresh with valid token → 200 new TokenPair, old token revoked
  - Refresh with revoked token → 401
  - Refresh with expired token → 401

- [ ] **Step 34**: Generate `tests/integration/test_operator_crud.py`
  - ADMIN creates RECRUITER → 201
  - Duplicate email → 409
  - RECRUITER tries to create operator → 403
  - ADMIN deactivates operator → 204; deactivated operator login → 401
  - Change own password → 204; re-login with new password → 200

### PART H — Deployment Artifacts

- [ ] **Step 35**: Generate `Makefile`
  - `make install`: `uv sync`
  - `make test`: `pytest tests/ -v --cov=src`
  - `make build`: package Lambda zip (`dist/auth.zip`) — excludes test files
  - `make lint`: `ruff check src/ tests/`
  - `make deploy`: placeholder (CDK/Terraform invocation)

- [ ] **Step 36**: Generate `src/db/` → **SKIP** (MongoRepository already in `src/repository/mongo.py`)

- [ ] **Step 37**: Generate documentation summary
  - Create `aidlc-docs/construction/auth-lambda/code/code-summary.md`
  - API contract summary (all 11 endpoints with request/response schemas)
  - Environment variable reference
  - MongoDB index definitions

---

## Story Traceability

| Story | Endpoints | Status |
|-------|-----------|--------|
| US-18 — Authenticate Into Dashboard | POST /auth/login, /auth/verify-otp, /auth/refresh, /auth/logout, /operators/bootstrap, /operators CRUD, /operators/{id}/password | [ ] |

---

## Dependencies & Interfaces

**This unit exposes** (API contract for dashboard — Unit 7):
- `POST /api/v1/auth/login` → 202 (ADMIN) or 200 (RECRUITER) TokenPair
- `POST /api/v1/auth/verify-otp` → 200 TokenPair
- `POST /api/v1/auth/refresh` → 200 TokenPair
- `POST /api/v1/auth/logout` → 204
- Operator CRUD endpoints

**This unit calls**:
- MongoDB Atlas (motor + PrivateLink)
- AWS Secrets Manager (boto3 + Interface Endpoint)
- AWS SES (boto3 + Interface Endpoint)
- compliance-lambda (httpx, fire-and-forget)

**This unit does NOT call**:
- conversation-lambda, campaign-lambda, evaluation-lambda, dashboard

---

*End of auth-lambda-code-generation-plan.md*
