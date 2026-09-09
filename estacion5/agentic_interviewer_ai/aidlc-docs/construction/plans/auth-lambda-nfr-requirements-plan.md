# NFR Requirements Plan — Unit 6: auth-lambda

**Generated**: 2026-03-10
**Unit**: Unit 6 — auth-lambda (`entrevista-auth`)
**Runtime**: Python 3.12 / FastAPI + Mangum
**Stage**: CONSTRUCTION — NFR Requirements

---

## Unit Context Summary

Auth-lambda is a security-critical Lambda providing operator authentication, JWT issuance (RS256), refresh token rotation, and operator account management. The Security Baseline (SECURITY-01 to SECURITY-15) is fully enabled.

---

## Execution Checklist

- [x] Step 1: Analyze functional design context (done — see above)
- [x] Step 2: Generate NFR clarifying questions and await answers
- [x] Step 3: Validate answers for ambiguities / follow-up (NFR-AUTH-03-FOLLOW=A: AWS SES)
- [x] Step 4: Generate nfr-requirements.md
- [x] Step 5: Generate tech-stack-decisions.md
- [x] Step 6: Present completion message and await approval

---

## NFR Clarifying Questions

Complete all [Answer]: tags below.

---

### SECTION 1 — Performance & Cold Start

**NFR-AUTH-01** — What is the maximum acceptable response time for the login endpoint (`POST /auth/login`) under normal load?

A. 2,000 ms (p99) — suitable for a dashboard login (human interaction, not real-time)
B. 1,000 ms (p99) — faster login experience
C. 500 ms (p99) — aggressive; note: argon2id hash verification takes ~100–300ms alone
D. No hard requirement for MVP

[Answer]:B

---

**NFR-AUTH-02** — Should auth-lambda use AWS Lambda Provisioned Concurrency to eliminate cold starts?

> Context: Without provisioned concurrency, first request after idle period takes 1–3s extra (cold start). For a login endpoint this is usually tolerable but noticeable.

A. Yes — provision 1 warm instance at all times (adds ~$5–10/month)
B. No — cold starts are acceptable for a dashboard login (operators won't notice occasional delay)
C. Defer to Infrastructure Design — decide based on overall cost budget

[Answer]:B

---

### SECTION 2 — Security (SECURITY-12 compliance)

**NFR-AUTH-03** — SECURITY-12 requires MFA for administrative accounts. How should MFA be handled for MVP?

> Rule: "MFA MUST be supported for administrative accounts and SHOULD be available for all users."

A. TOTP (time-based one-time password, e.g., Google Authenticator) — implement for ADMIN role in MVP
B. Email OTP — send a one-time code to operator email on each login
C. Defer MFA entirely — document as a known SECURITY-12 deviation; accept risk for MVP
D. MFA not needed — operators will always log in from a company VPN (network-level control)

[Answer]:B

---

**NFR-AUTH-04** — SECURITY-11 requires rate limiting on public-facing endpoints. Beyond the per-account brute-force protection already designed, should there be a global rate limit on the login endpoint?

A. Yes — API Gateway throttle: 100 requests/second global on the auth endpoint
B. Yes — more aggressive: 20 requests/second global (auth is low-volume; operators only)
C. No — per-account lockout (already designed) is sufficient; no global rate limit needed for MVP
D. Other (describe):

[Answer]:B

---

**NFR-AUTH-05** — SECURITY-08 requires CORS restricted to explicit origins. What is the allowed origin for the dashboard?

A. A single fixed domain (e.g., `https://app.entrevista.ai`) — configure at deploy time via env var
B. Configurable per environment (dev: `http://localhost:5173`, staging: `https://staging.entrevista.ai`, prod: `https://app.entrevista.ai`)
C. Not applicable — auth-lambda is called from the dashboard frontend (browser); CORS headers are needed
D. Other (describe):

[Answer]:A

---

### SECTION 3 — Availability & Reliability

**NFR-AUTH-06** — What is the availability target for auth-lambda?

A. AWS Lambda SLA (~99.95%) — acceptable; no additional HA beyond what Lambda provides
B. 99.9% — requires multi-region failover (out of scope for MVP)
C. No hard SLA for MVP — best-effort

[Answer]:A

---

**NFR-AUTH-07** — What happens if MongoDB Atlas is unavailable during a login request?

A. Return 503 Service Unavailable with a user-friendly message (operators can retry)
B. Return 500 Internal Server Error (generic — operators contact support)
C. Implement retry logic: up to 3 retries with 100ms exponential backoff before returning 503

[Answer]:C

---

### SECTION 4 — Tech Stack Selections

**NFR-AUTH-08** — Which Python JWT library should be used for RS256 signing and validation?

A. `PyJWT` (>=2.x) — lightweight, widely used, excellent RS256 support
B. `python-jose[cryptography]` — broader algorithm support but heavier dependency
C. `authlib` — feature-rich OAuth library; more than needed for this use case

[Answer]:A

---

**NFR-AUTH-09** — Which argon2 library should be used for password hashing?

A. `argon2-cffi` — the standard Python argon2id implementation; well-maintained
B. `passlib[argon2]` — passlib wrapper around argon2-cffi; adds a convenience layer
C. Other (describe):

[Answer]:A

---

**NFR-AUTH-10** — MongoDB driver and connection management for Lambda:

A. `motor` (async MongoDB driver) — native async, fits FastAPI; connection pool reused across warm Lambda invocations
B. `pymongo` with synchronous calls wrapped in `asyncio.to_thread` — simpler, well-known
C. Let Infrastructure Design decide based on Lambda memory/timeout configuration

[Answer]:A

---

### SECTION 5 — Observability & Logging (SECURITY-03 compliance)

**NFR-AUTH-11** — What structured logging library should auth-lambda use?

A. `structlog` — JSON-structured output, great for CloudWatch Insights queries
B. Python built-in `logging` with a JSON formatter (e.g., `python-json-logger`)
C. AWS Lambda Powertools for Python — includes structured logging, tracing, and metrics out of the box

[Answer]:A

---

**NFR-AUTH-12** — Should AWS X-Ray tracing be enabled on auth-lambda for distributed request tracing?

A. Yes — enables end-to-end tracing across Lambda invocations; useful for latency analysis
B. No — CloudWatch Logs is sufficient for MVP; X-Ray adds cost and complexity
C. Defer to Infrastructure Design

[Answer]:A

---

*End of auth-lambda-nfr-requirements-plan.md*
