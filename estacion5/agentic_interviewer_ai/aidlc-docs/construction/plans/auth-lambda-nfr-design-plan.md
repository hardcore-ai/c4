# NFR Design Plan — Unit 6: auth-lambda

**Generated**: 2026-03-10
**Unit**: Unit 6 — auth-lambda (`entrevista-auth`)
**Stage**: CONSTRUCTION — NFR Design

---

## Execution Checklist

- [x] Step 1: Analyze NFR requirements (done — see nfr-requirements.md)
- [x] Step 2: Generate targeted design questions and await answers
- [x] Step 3: Generate nfr-design-patterns.md
- [x] Step 4: Generate logical-components.md
- [x] Step 5: Present completion message and await approval

---

## NFR Design Questions

Only 3 genuinely open questions remain. All other design patterns follow deterministically from the NFR requirements.

---

**NFRD-AUTH-01** — If AWS SES fails to deliver the OTP email (e.g., quota exceeded, domain not verified), what should happen?

A. Login attempt fails — return 503 with "Unable to send verification code. Please try again." (operator retries)
B. Login attempt fails — return 503 and log a CloudWatch alarm trigger (ops team notified)
C. Login silently succeeds without MFA for this attempt (security trade-off — not recommended)

[Answer]:A

---

**NFRD-AUTH-02** — Retry policy scope: should the 3-retry / 100ms exponential backoff apply only to MongoDB, or also to AWS SES and compliance-lambda calls?

A. MongoDB only — retries for a login endpoint DB call; SES and compliance-lambda are fire-and-forget with a single attempt
B. MongoDB + SES — both get retries; compliance-lambda remains fire-and-forget single attempt
C. All three — uniform retry policy across all external calls

[Answer]:A

---

**NFRD-AUTH-03** — Correlation ID strategy for request tracing across logs and X-Ray:

A. Use the AWS Lambda `context.aws_request_id` as the correlation ID — it appears in X-Ray traces automatically
B. Generate a new UUID v4 per request in FastAPI middleware — inject into all log entries and X-Ray annotations
C. Use the HTTP `X-Request-Id` header from the caller (dashboard); fall back to Lambda request ID if not present

[Answer]:B

---

*End of auth-lambda-nfr-design-plan.md*
