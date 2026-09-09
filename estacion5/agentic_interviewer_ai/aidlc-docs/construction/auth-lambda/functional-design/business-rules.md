# Business Rules — auth-lambda

**Unit**: Unit 6 — auth-lambda (`entrevista-auth`)
**Generated**: 2026-03-10
**Design Basis**: FD-AUTH-01 through FD-AUTH-15 answers

---

## Rule Categories

- [BR-AUTH] Authentication & Authorization
- [BR-TOKEN] Token Issuance & Lifecycle
- [BR-BRUTE] Brute-Force Protection
- [BR-PASS] Password Policy
- [BR-OPS] Operator Lifecycle
- [BR-AUDIT] Audit & Compliance

---

## [BR-AUTH] Authentication & Authorization Rules

| Rule ID | Rule | Enforcement Point |
|---------|------|-------------------|
| BR-AUTH-01 | Every operator is scoped to exactly one tenant. All queries MUST include `tenant_id` as a filter to prevent cross-tenant data leakage. | All repository methods |
| BR-AUTH-02 | Login failure responses MUST NOT reveal whether the email exists, the account is deactivated, or the password is wrong. Generic `"invalid_credentials"` is the only allowed message. | `AuthService.login()` |
| BR-AUTH-03 | Login MUST execute argon2id hash verification even when the email is not found (constant-time defense). A pre-computed dummy hash MUST be used. | `AuthService.login()` |
| BR-AUTH-04 | A deactivated operator (`is_active == false`) MUST be treated identically to a non-existent operator during login — generic 401, constant-time. | `AuthService.login()` |
| BR-AUTH-05 | ADMIN role is required to: create operators, deactivate operators, list all operators in a tenant. | `AuthRouter` (dependency injection) |
| BR-AUTH-06 | An ADMIN operator MUST NOT be able to deactivate their own account. | `AuthRouter.deactivate_operator()` |
| BR-AUTH-07 | An operator can ONLY change their own password. No ADMIN override for self-service reset in MVP. | `AuthRouter.change_password()` |
| BR-AUTH-08 | The bootstrap endpoint (`POST /api/v1/operators/bootstrap`) is only valid when zero operators exist for the given `tenant_id`. Any subsequent call MUST return 409. | `OperatorManager.bootstrap()` |

---

## [BR-TOKEN] Token Issuance & Lifecycle Rules

| Rule ID | Rule | Enforcement Point |
|---------|------|-------------------|
| BR-TOKEN-01 | Access tokens MUST be signed with RS256 using the private key from AWS Secrets Manager. | `TokenManager.issue_access_token()` |
| BR-TOKEN-02 | Access token TTL is exactly 3600 seconds (60 minutes). No exceptions. | `TokenManager.issue_access_token()` |
| BR-TOKEN-03 | Every access token MUST include a `jti` (UUID v4). No two tokens may share a `jti`. | `TokenManager.issue_access_token()` |
| BR-TOKEN-04 | Access token payload MUST contain exactly: `sub`, `tenant_id`, `role`, `jti`, `iat`, `exp`. No additional claims. | `TokenManager.issue_access_token()` |
| BR-TOKEN-05 | Refresh tokens MUST be stored as SHA-256 hashes. Plaintext refresh tokens MUST NEVER be persisted. | `TokenManager.issue_refresh_token()` |
| BR-TOKEN-06 | Refresh token TTL is exactly 7 days. | `TokenManager.issue_refresh_token()` |
| BR-TOKEN-07 | Refresh token rotation is MANDATORY. Every `/refresh` call MUST revoke the presented token and issue a new one. | `AuthService.refresh()` |
| BR-TOKEN-08 | A revoked, expired, or non-existent refresh token MUST return 401 `"invalid_token"`. No distinction is revealed. | `AuthService.refresh()` |
| BR-TOKEN-09 | Logout MUST revoke both the access token JTI (via `revoked_tokens`) and the refresh token (via `refresh_tokens.revoked=true`). | `AuthService.logout()` |
| BR-TOKEN-10 | Access token validation MUST check: (1) RS256 signature, (2) `exp` not passed, (3) `jti` not in `revoked_tokens`. All three checks are MANDATORY. | `TokenManager.validate_access_token()` |
| BR-TOKEN-11 | Deactivating an operator MUST immediately revoke all active refresh tokens for that operator. | `OperatorManager.deactivate()` |
| BR-TOKEN-12 | Changing an operator's password MUST immediately revoke all active refresh tokens for that operator. | `AuthService.change_password()` |

---

## [BR-BRUTE] Brute-Force Protection Rules

| Rule ID | Rule | Enforcement Point |
|---------|------|-------------------|
| BR-BRUTE-01 | Brute-force detection is keyed by `(email, tenant_id)` — not by IP address. | `BruteForceProtector` |
| BR-BRUTE-02 | The lockout threshold is 5 failed login attempts within a rolling 15-minute window. | `BruteForceProtector.is_locked()` |
| BR-BRUTE-03 | Once locked, the account is locked for 15 minutes from the time the 5th failure occurred. | `BruteForceProtector.lockout_remaining()` |
| BR-BRUTE-04 | A locked account MUST return HTTP 429 with a `Retry-After` header. The value is the remaining lockout duration in seconds. | `AuthRouter.login()` |
| BR-BRUTE-05 | A successful login MUST record a `LoginAttempt(success=true)`. Failed attempts within the window are still counted even after a success, but the window query only counts `success=false` records. | `BruteForceProtector.record_failure/reset()` |
| BR-BRUTE-06 | `LoginAttempt` documents MUST auto-expire via MongoDB TTL index. TTL is set to 30 minutes (2x the window) to ensure cleanup. | MongoDB TTL index on `attempted_at` |
| BR-BRUTE-07 | The brute-force check MUST occur BEFORE any password verification or database lookups (fail-fast to avoid DB load under attack). | `AuthRouter.login()` — first step |

---

## [BR-PASS] Password Policy Rules

| Rule ID | Rule | Enforcement Point |
|---------|------|-------------------|
| BR-PASS-01 | Passwords MUST be at least 8 characters long. | `AuthService` / `OperatorManager` |
| BR-PASS-02 | Passwords MUST contain at least one uppercase letter [A-Z]. | `AuthService` / `OperatorManager` |
| BR-PASS-03 | Passwords MUST contain at least one lowercase letter [a-z]. | `AuthService` / `OperatorManager` |
| BR-PASS-04 | Passwords MUST contain at least one digit [0-9]. | `AuthService` / `OperatorManager` |
| BR-PASS-05 | Passwords MUST be hashed with argon2id before storage. bcrypt and SHA-family hashes are prohibited. | `AuthService.hash_password()` |
| BR-PASS-06 | Plaintext passwords MUST NEVER be logged, stored, or included in error messages. | All components |
| BR-PASS-07 | Password validation failures on create/change MUST return HTTP 400 with a descriptive `details` array listing which rules were violated. | `AuthRouter` |

---

## [BR-OPS] Operator Lifecycle Rules

| Rule ID | Rule | Enforcement Point |
|---------|------|-------------------|
| BR-OPS-01 | `email` is unique per `(email, tenant_id)` pair. The same email may exist in different tenants. | MongoDB unique compound index |
| BR-OPS-02 | Operator deactivation is a SOFT DELETE only. The `is_active` flag is set to false. The document is NEVER physically deleted. | `OperatorManager.deactivate()` |
| BR-OPS-03 | Operator `email` and `role` can be updated. `tenant_id` and `created_by` are immutable after creation. | `OperatorManager.update()` |
| BR-OPS-04 | `password_hash` MUST be excluded from all API response payloads. It is a write-only field. | `AuthRouter` response serialization |
| BR-OPS-05 | All operator-returning endpoints MUST scope results to the caller's `tenant_id` extracted from their JWT. | All `OperatorManager` read methods |
| BR-OPS-06 | Attempting to create a duplicate email within a tenant MUST return 409 `"email_conflict"`. The error MUST NOT reveal that the email exists to an unauthenticated caller. | `OperatorManager.create()` — authenticated ADMIN only, so safe to reveal |

---

## [BR-AUDIT] Audit & Compliance Rules

| Rule ID | Rule | Enforcement Point |
|---------|------|-------------------|
| BR-AUDIT-01 | The following events MUST be emitted to compliance-lambda: `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `OPERATOR_CREATED`, `OPERATOR_DEACTIVATED`. | All corresponding flows |
| BR-AUDIT-02 | Audit emission is fire-and-forget (async). Auth operations MUST NOT fail or wait if compliance-lambda is unavailable. | HTTP client in `compliance_client.py` |
| BR-AUDIT-03 | Audit events MUST include: `event_type`, `source="auth-lambda"`, `operator_id`, `tenant_id`, `timestamp` (ISO 8601 UTC). | Event construction |
| BR-AUDIT-04 | `LOGIN_FAILURE` events MUST NOT include the plaintext password or password hash in the metadata. | Audit event construction |
| BR-AUDIT-05 | `LOGIN_FAILURE` for a locked account is still emitted (a 429 brute-force response is also an audit event of interest). | `AuthRouter.login()` |

---

## HTTP Response Code Summary

| Scenario | HTTP Code | Error Key |
|----------|-----------|-----------|
| Successful login / refresh | 200 | — |
| Successful create operator | 201 | — |
| Successful logout / deactivate / password change | 204 | — |
| Invalid credentials (wrong password, email not found, deactivated) | 401 | `invalid_credentials` |
| Invalid / expired / revoked token | 401 | `invalid_token` |
| Forbidden (wrong role) | 403 | `forbidden` |
| Operator not found | 404 | `not_found` |
| Duplicate email | 409 | `email_conflict` |
| Bootstrap already done | 409 | `bootstrap_already_done` |
| Already deactivated | 409 | `already_deactivated` |
| Brute-force lockout | 429 | `too_many_requests` |
| Password policy violation | 400 | `password_policy_violation` |
| Self-deactivation attempt | 400 | `self_deactivation_forbidden` |
| Wrong current password on change | 400 | `current_password_incorrect` |

---

*End of business-rules.md*
