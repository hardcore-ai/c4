# Functional Design Plan — Unit 6: auth-lambda

**Generated**: 2026-03-10
**Unit**: Unit 6 — auth-lambda (`entrevista-auth`)
**Runtime**: Python 3.12 / FastAPI + Mangum
**Stage**: CONSTRUCTION — Functional Design (Part 1: Planning)

---

## Unit Context Summary

**Purpose**: Operator authentication with email/password, JWT issuance (RS256), refresh token management, brute-force protection, and operator account management.

**Components**: AuthRouter · AuthService · TokenManager · BruteForceProtector · OperatorManager

**Primary Story**: US-18 — Authenticate Into Dashboard (2 SP)

**External Dependencies**: MongoDB Atlas, AWS Secrets Manager (RS256 private/public keys)

---

## Execution Checklist

- [x] Step 1: Analyze unit context (done — see above)
- [x] Step 2: Generate clarifying questions and await answers
- [x] Step 3: Validate answers for ambiguities / follow-up
- [x] Step 4: Generate domain-entities.md
- [x] Step 5: Generate business-logic-model.md
- [x] Step 6: Generate business-rules.md
- [x] Step 7: Present completion message and await approval

---

## Clarifying Questions

Complete all [Answer]: tags below. Use the option letter (A, B, C, D…) or write a free-form answer where indicated.

---

### SECTION 1 — Multi-Tenancy & Operator Model

**FD-AUTH-01** — What is the multi-tenancy model for auth-lambda?

A. Single tenant only — all operators belong to one company; `tenant_id` is a fixed constant
B. Multi-tenant — each company has its own `tenant_id`; operators are scoped to a tenant
C. Not decided yet — leave tenant_id in the model but do not enforce it at the API layer for now

[Answer]:B

---

**FD-AUTH-02** — What operator roles exist?

A. Two roles: `ADMIN` (full access) and `RECRUITER` (read/review queue only)
B. Three roles: `ADMIN`, `RECRUITER`, `VIEWER` (read-only analytics)
C. Single role for now — all operators have the same permissions
D. Other (describe):

[Answer]:A

---

**FD-AUTH-03** — How is the first ADMIN operator bootstrapped (before anyone can log in)?

A. A `POST /api/v1/operators/bootstrap` endpoint, callable only when the operator collection is empty
B. A CLI seed script (`make seed-admin`) that runs outside the Lambda at deploy time
C. Manual MongoDB insert — no API needed for MVP
D. Other (describe):

[Answer]:A

---

### SECTION 2 — JWT & Token Policy

**FD-AUTH-04** — What claims must be included in the JWT access token payload?

A. Minimal: `sub` (operator_id), `tenant_id`, `role`, `exp`, `iat`, `jti`
B. Extended: A + `name`, `email`
C. Extended: A + `permissions[]` (explicit permission list)
D. Other (describe):

[Answer]:A

---

**FD-AUTH-05** — What are the access token and refresh token TTLs?

A. Access token: 60 minutes / Refresh token: 7 days (as in Application Design)
B. Access token: 15 minutes / Refresh token: 30 days
C. Access token: 60 minutes / Refresh token: 30 days
D. Other (describe exact values):

[Answer]:A

---

**FD-AUTH-06** — Refresh token rotation policy:

A. Rotating — each `/refresh` call invalidates the old refresh token and issues a new one
B. Non-rotating — refresh token is reusable until its TTL expires
C. Rotating with reuse detection — if an already-rotated token is reused, all sessions for that operator are revoked

[Answer]:A

---

**FD-AUTH-07** — Where are revoked JTIs stored (for logout and token rotation)?

A. MongoDB collection `revoked_tokens` (TTL index auto-expires entries)
B. AWS ElastiCache / Redis (not in scope for MVP; skip revocation list)
C. MongoDB with a short in-memory cache layer (Lambda-level cache, best-effort)

[Answer]:A

---

### SECTION 3 — Brute-Force Protection Policy

**FD-AUTH-08** — Brute-force lockout threshold and duration:

A. 5 failed attempts within 15 minutes → 15-minute lockout
B. 5 failed attempts within 10 minutes → 30-minute lockout
C. 10 failed attempts within 30 minutes → 60-minute lockout
D. Other (describe exact values):

[Answer]:A

---

**FD-AUTH-09** — Where is the failed-attempt counter stored?

A. MongoDB collection `login_attempts` (TTL index expires entries after the window)
B. Same as FD-AUTH-07 answer — co-located with revocation store
C. Lambda in-memory (best-effort; resets on cold start — acceptable for MVP)

[Answer]:A

---

### SECTION 4 — Password Policy

**FD-AUTH-10** — Minimum password requirements for operators:

A. Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit
B. Minimum 12 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
C. No enforced policy for MVP — any non-empty password accepted
D. Other (describe):

[Answer]:A

---

### SECTION 5 — Operator Lifecycle & Edge Cases

**FD-AUTH-11** — What happens when a deactivated operator tries to log in?

A. 401 Unauthorized with generic "Invalid credentials" message (do not reveal account status)
B. 403 Forbidden with explicit "Account deactivated — contact your administrator" message
C. Same as active account — deactivated operators can still log in but are denied specific routes

[Answer]:A

---

**FD-AUTH-12** — Can an operator change their own password?

A. Yes — add `PATCH /api/v1/operators/{operator_id}/password` endpoint requiring current password
B. Yes — but only ADMINs can reset passwords (no self-service)
C. Not in scope for MVP

[Answer]:A

---

**FD-AUTH-13** — What is the response when the account is locked due to brute force?

A. 429 Too Many Requests with `Retry-After` header indicating lockout expiry
B. 401 Unauthorized with generic "Invalid credentials" (do not reveal lockout to attacker)
C. 403 Forbidden with remaining lockout seconds in response body

[Answer]:A

---

### SECTION 6 — Error Handling & Security Hardening

**FD-AUTH-14** — Should login timing be constant (to prevent timing attacks on email enumeration)?

A. Yes — always run argon2 hash comparison even if email not found (use a dummy hash)
B. No — fail fast if email not found (acceptable for MVP)

[Answer]:A

---

**FD-AUTH-15** — What audit events should auth-lambda emit (to compliance-lambda)?

> Note: compliance-lambda (Unit 5) is built before this unit but its API contract will be stable.

A. LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, OPERATOR_CREATED, OPERATOR_DEACTIVATED
B. LOGIN_SUCCESS and LOGIN_FAILURE only (minimal for MVP)
C. None — auth events are logged only in CloudWatch, not in the compliance audit log
D. Other (describe):

[Answer]:A

---

*End of auth-lambda-functional-design-plan.md*
