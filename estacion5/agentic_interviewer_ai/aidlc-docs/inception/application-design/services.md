# Services — EntreVista AI

**Generated**: 2026-06-20
**Architecture**: Polyglot Multi-Lambda Microservices
**Session State**: MongoDB only (stateless Lambdas)

---

## Service Registry

| Service ID | Name | Runtime | Deployment | Purpose |
|---|---|---|---|---|
| SVC-01 | telegram-bot | Node.js 20 | AWS Lambda + API Gateway | Telegram protocol gateway |
| SVC-02 | conversation-lambda | Python 3.12 | AWS Lambda + API Gateway | Agentic conversation engine |
| SVC-03 | evaluation-lambda | Python 3.12 | AWS Lambda + API Gateway | Scoring and evaluation engine |
| SVC-04 | campaign-lambda | Python 3.12 | AWS Lambda + API Gateway | Campaign, rubric, and RAG management |
| SVC-05 | compliance-lambda | Python 3.12 | AWS Lambda + API Gateway | Consent, audit logs, escalation alerts, NPS |
| SVC-06 | auth-lambda | Python 3.12 | AWS Lambda + API Gateway | Operator authentication and token management |
| SVC-07 | dashboard | React 18 + TypeScript | CloudFront + S3 | Recruiter web interface |

---

## Service Definitions

### SVC-01 — telegram-bot

**Runtime**: Node.js 20 / Telegraf 4.x
**Deployment**: AWS Lambda (arm64) + API Gateway HTTP (Telegram webhook endpoint)
**Entry point**: `src/handler.ts → webhookHandler`

**Responsibilities**:
- Receive Telegram webhooks (all message types, /start command)
- Verify Telegram webhook secret token
- Delegate all AI and business logic to conversation-lambda (SVC-02)
- Return text replies and inline keyboards to Telegram

**Configuration** (env vars via Secrets Manager):
- `TELEGRAM_BOT_TOKEN` — Telegram bot token
- `TELEGRAM_WEBHOOK_SECRET` — Webhook verification token
- `CONVERSATION_LAMBDA_URL` — REST URL of SVC-02
- `INTERNAL_SERVICE_SECRET` — Shared secret for internal service calls

**Scalability**: Stateless Lambda; scales horizontally to match Telegram webhook throughput. No concurrency limits required for MVP (< 100 concurrent candidates).

**Error handling**:
- If SVC-02 call fails (5xx): return scripted "technical issue" message to candidate; log error to CloudWatch
- If SVC-02 call times out (> 28s): return scripted "processing" message to candidate
- Always return HTTP 200 to Telegram (to prevent webhook retry storms)

---

### SVC-02 — conversation-lambda

**Runtime**: Python 3.12 / FastAPI + Mangum (ASGI adapter for Lambda)
**Deployment**: AWS Lambda (arm64) + API Gateway HTTP
**Entry point**: `src/handler.py → lambda_handler` (Mangum wraps FastAPI app)

**Responsibilities**:
- Process candidate messages in the context of their current session state
- Execute the conversational state machine (AWAITING_CONSENT → REQUIREMENTS_CHECK → SCREENING → COMPLETED/ESCALATED/ABANDONED)
- Invoke Claude via the Claude Agent SDK for question generation and follow-ups
- Enforce guardrails on every candidate message
- Call evaluation-lambda on screening completion
- Call compliance-lambda for consent recording and audit events
- Call campaign-lambda for RAG search

**Configuration** (env vars via Secrets Manager):
- `MONGODB_URI` — MongoDB Atlas connection string
- `ANTHROPIC_API_KEY` — Anthropic API key for Claude + embeddings
- `CLAUDE_MODEL_ID` — e.g. `claude-opus-4-6`
- `EVALUATION_LAMBDA_URL` — REST URL of SVC-03
- `CAMPAIGN_LAMBDA_URL` — REST URL of SVC-04
- `COMPLIANCE_LAMBDA_URL` — REST URL of SVC-05
- `INTERNAL_SERVICE_SECRET` — Shared secret for internal calls
- `TELEGRAM_BOT_TOKEN` — For direct Telegram calls (reengagement scheduler)

**Scalability**:
- Each invocation is independent; session state is fully in MongoDB
- Lambda concurrency scales with message volume
- ReengagementScheduler runs on a separate scheduled Lambda event (every 30 minutes)

**Cold start mitigation**: Provisioned Concurrency = 2 for MVP (low-latency guarantee for first messages)

**Error handling**:
- MongoDB connection errors: retry twice with exponential backoff; return 503 on persistent failure
- Claude API errors: return scripted "processing" message to candidate; log to CloudWatch
- Downstream lambda errors (evaluation, compliance): log error; do not block candidate reply

---

### SVC-03 — evaluation-lambda

**Runtime**: Python 3.12 / FastAPI + Mangum
**Deployment**: AWS Lambda (arm64) + API Gateway HTTP (internal — not public)
**Entry point**: `src/handler.py → lambda_handler`

**Responsibilities**:
- Score completed screening sessions against the campaign rubric using Claude
- Generate executive summaries for recruiter review
- Persist evaluation results to MongoDB
- Record human decision outcomes (APPROVED/REJECTED)
- Track human-AI score disagreements for calibration

**Configuration** (env vars via Secrets Manager):
- `MONGODB_URI`
- `ANTHROPIC_API_KEY`
- `CLAUDE_MODEL_ID`
- `INTERNAL_SERVICE_SECRET`

**Scalability**: Evaluation is CPU/API-bound (Claude calls per competency). Lambda timeout = 5 minutes (evaluation of 5 competencies ≈ 30–60 seconds). Independent scaling from conversation-lambda.

**Error handling**:
- If any competency score lacks a citation: reject score, retry Claude call once; on second failure, flag evaluation for manual review
- If Claude API fails: mark evaluation `EVALUATION_FAILED`; notify recruiter via dashboard

---

### SVC-04 — campaign-lambda

**Runtime**: Python 3.12 / FastAPI + Mangum
**Deployment**: AWS Lambda (arm64) + API Gateway HTTP
**Entry point**: `src/handler.py → lambda_handler`

**Responsibilities**:
- CRUD for campaigns and rubrics (operator-facing via dashboard)
- Document upload, chunking, embedding, and Pinecone upsert pipeline
- RAG search for conversation-lambda (internal endpoint)
- Escalated questions tracking and retrieval

**Configuration** (env vars via Secrets Manager):
- `MONGODB_URI`
- `ANTHROPIC_API_KEY` — For embeddings (text-embedding-3 / Voyage)
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `S3_DOCUMENTS_BUCKET`
- `INTERNAL_SERVICE_SECRET`
- `JWT_PUBLIC_KEY` — For validating dashboard JWT tokens

**Scalability**: Document processing (embed + upsert) can be async; Lambda handles up to 10MB file uploads via API Gateway. Pinecone queries are sub-200ms at MVP scale.

**Error handling**:
- Document processing failure (embedding or Pinecone error): mark document `FAILED`; log; notify operator via dashboard status
- RAG search failure: return empty chunks; conversation-lambda falls back to guardrail scripted response

---

### SVC-05 — compliance-lambda

**Runtime**: Python 3.12 / FastAPI + Mangum
**Deployment**: AWS Lambda (arm64) + API Gateway HTTP
**Entry point**: `src/handler.py → lambda_handler`

**Responsibilities**:
- Write-once consent recording
- Immutable audit log (all system events)
- Escalation alert creation and resolution
- NPS collection and aggregation
- Scheduled data retention enforcement (separate Lambda event — daily)

**Configuration** (env vars via Secrets Manager):
- `MONGODB_URI`
- `INTERNAL_SERVICE_SECRET`
- `JWT_PUBLIC_KEY`
- `DEFAULT_RETENTION_DAYS` — Default 90

**Scalability**: Primarily insert-heavy (audit log). MongoDB Atlas handles write throughput at MVP scale. Compliance Lambda is lower-frequency than conversation-lambda.

**Error handling**:
- Audit log write failure: log to CloudWatch with full event payload; never silently drop audit events
- Retention sweep errors: log per-session errors; continue sweep (partial success is acceptable)

---

### SVC-06 — auth-lambda

**Runtime**: Python 3.12 / FastAPI + Mangum
**Deployment**: AWS Lambda (arm64) + API Gateway HTTP
**Entry point**: `src/handler.py → lambda_handler`

**Responsibilities**:
- Operator email/password authentication
- JWT access token issuance (RS256, 60-min TTL)
- Refresh token management (7-day TTL)
- Brute-force protection (5 failures = 15-min lockout)
- Operator account management (create, update, deactivate)

**Configuration** (env vars via Secrets Manager):
- `MONGODB_URI`
- `JWT_PRIVATE_KEY` — RS256 private key for token signing
- `JWT_PUBLIC_KEY` — RS256 public key (also distributed to other lambdas)
- `ARGON2_MEMORY_COST` — Argon2id memory parameter (default 65536 kB)

**Scalability**: Low-frequency (login/logout/refresh). Single Lambda instance handles all auth at MVP scale.

**Error handling**:
- Argon2id hash comparison always runs to completion (no early exit on mismatch — prevents timing attacks)
- Failed JWT signing (Secrets Manager unreachable): return 503; never issue unsigned tokens

---

### SVC-07 — dashboard

**Runtime**: React 18 / TypeScript / Vite
**Deployment**: Static SPA — CloudFront + S3
**Build output**: `dist/` (Vite production build)

**Responsibilities**:
- Recruiter review queue (pending human decisions)
- Full candidate detail view (summary, scores, citations, transcript)
- Campaign and rubric management
- Knowledge base document upload and management
- Analytics and NPS dashboard

**Configuration** (build-time env vars):
- `VITE_API_BASE_URL` — API Gateway base URL for all lambda calls

**Security**:
- JWT access token stored in memory only (never localStorage)
- Refresh token in HTTP-only cookie (set by auth-lambda)
- All API calls use HTTPS

**Error handling**:
- All API errors surface as user-visible toasts (no raw error messages exposed)
- 401 responses trigger automatic token refresh; if refresh fails, redirect to login

---

## Inter-Service Communication Contracts

### Contract C-01: telegram-bot → conversation-lambda

**Direction**: SVC-01 → SVC-02
**Protocol**: HTTP POST (REST)
**Auth**: `X-Internal-Secret` header (shared secret from Secrets Manager)
**Timeout**: 28 seconds (Lambda max = 29s; Telegram webhook expects reply within 30s)

**Request**:
```json
POST /api/v1/messages
{
  "telegram_user_id": "hashed_string",
  "message_text": "string",
  "campaign_code": "string | null",
  "message_id": "integer",
  "timestamp": "ISO8601"
}
```

**Response**:
```json
{
  "text": "string",
  "session_state": "AWAITING_CONSENT | REQUIREMENTS_CHECK | SCREENING | COMPLETED | ESCALATED | ABANDONED",
  "show_nps_keyboard": "boolean"
}
```

**Error codes**:
- `400 Bad Request` — Invalid payload
- `401 Unauthorized` — Invalid shared secret
- `503 Service Unavailable` — MongoDB or Claude unreachable

---

### Contract C-02: conversation-lambda → evaluation-lambda

**Direction**: SVC-02 → SVC-03
**Protocol**: HTTP POST (REST)
**Auth**: `X-Internal-Secret` header
**Timeout**: 300 seconds (evaluation is Claude-intensive)
**Invocation**: Asynchronous — conversation-lambda does not wait for evaluation to complete; sends acknowledgment to candidate immediately

**Request**:
```json
POST /api/v1/evaluate
{
  "session_id": "string",
  "campaign_id": "string",
  "tenant_id": "string"
}
```

**Response**:
```json
{
  "evaluation_id": "string",
  "status": "EVALUATION_STARTED"
}
```

---

### Contract C-03: conversation-lambda → campaign-lambda (RAG search)

**Direction**: SVC-02 → SVC-04
**Protocol**: HTTP POST (REST)
**Auth**: `X-Internal-Secret` header
**Timeout**: 5 seconds

**Request**:
```json
POST /api/v1/knowledge-base/search
{
  "query": "string",
  "campaign_id": "string",
  "tenant_id": "string"
}
```

**Response**:
```json
{
  "chunks": [
    {
      "text": "string",
      "score": "float",
      "document_id": "string",
      "chunk_index": "integer"
    }
  ]
}
```

---

### Contract C-04: conversation-lambda → compliance-lambda (consent)

**Direction**: SVC-02 → SVC-05
**Protocol**: HTTP POST (REST)
**Auth**: `X-Internal-Secret` header
**Timeout**: 5 seconds

**Request**:
```json
POST /api/v1/consent
{
  "session_id": "string",
  "telegram_user_id_hash": "string",
  "campaign_id": "string",
  "tenant_id": "string",
  "consent_given": "boolean",
  "timestamp": "ISO8601"
}
```

**Response**:
```json
{
  "consent_id": "string",
  "recorded_at": "ISO8601"
}
```

---

### Contract C-05: conversation-lambda → compliance-lambda (audit events)

**Direction**: SVC-02 → SVC-05 (also: SVC-03 → SVC-05, SVC-04 → SVC-05)
**Protocol**: HTTP POST (REST)
**Auth**: `X-Internal-Secret` header
**Timeout**: 5 seconds

**Request**:
```json
POST /api/v1/audit/events
{
  "event_type": "MESSAGE_SENT | MESSAGE_RECEIVED | CONSENT_RECORDED | SCORE_COMPUTED | HUMAN_DECISION | ESCALATION_TRIGGERED | JAILBREAK_ATTEMPT | DATA_PURGED",
  "actor": "string",
  "session_id": "string | null",
  "campaign_id": "string | null",
  "tenant_id": "string",
  "payload": {},
  "timestamp": "ISO8601"
}
```

**Response**:
```json
{
  "event_id": "string"
}
```

---

### Contract C-06: conversation-lambda → compliance-lambda (escalation)

**Direction**: SVC-02 → SVC-05
**Protocol**: HTTP POST (REST)
**Auth**: `X-Internal-Secret` header
**Timeout**: 5 seconds

**Request**:
```json
POST /api/v1/escalations
{
  "session_id": "string",
  "candidate_alias": "string",
  "campaign_id": "string",
  "tenant_id": "string",
  "escalation_type": "HUMAN_REQUESTED | GUARDRAIL_THRESHOLD",
  "context": "string",
  "timestamp": "ISO8601"
}
```

**Response**:
```json
{
  "alert_id": "string"
}
```

---

### Contract C-07: dashboard → auth-lambda (login)

**Direction**: SVC-07 → SVC-06
**Protocol**: HTTP POST (REST)
**Auth**: None (public endpoint — brute-force protected)
**Timeout**: 10 seconds

**Request**:
```json
POST /api/v1/auth/login
{
  "email": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "access_token": "string (JWT)",
  "refresh_token": "string (opaque)",
  "expires_in": 3600
}
```

**Error codes**:
- `401 Unauthorized` — Invalid credentials
- `429 Too Many Requests` — Account locked (brute-force protection)

---

### Contract C-08: dashboard → campaign-lambda (campaigns, rubrics, KB)

**Direction**: SVC-07 → SVC-04
**Protocol**: HTTP REST (CRUD)
**Auth**: `Authorization: Bearer <access_token>` (JWT validated by campaign-lambda)
**Timeout**: 30 seconds (document upload may take longer)

See CampaignRouter method signatures in component-methods.md for full endpoint list.

---

### Contract C-09: dashboard → evaluation-lambda (decisions, disagreements)

**Direction**: SVC-07 → SVC-03
**Protocol**: HTTP POST (REST)
**Auth**: `Authorization: Bearer <access_token>`
**Timeout**: 10 seconds

See EvaluationRouter method signatures in component-methods.md for full endpoint list.

---

### Contract C-10: dashboard → compliance-lambda (audit query, escalations, NPS)

**Direction**: SVC-07 → SVC-05
**Protocol**: HTTP REST
**Auth**: `Authorization: Bearer <access_token>`
**Timeout**: 10 seconds

See ComplianceRouter method signatures in component-methods.md for full endpoint list.

---

## Orchestration Patterns

### Pattern 1 — Synchronous Request-Response (Telegram message flow)
```
Telegram → SVC-01 → SVC-02 → MongoDB (read/write)
                 ↘ SVC-04 (RAG search, sync)
                 ↘ SVC-05 (consent/audit, sync, fire-and-verify)
```
SVC-02 waits for all calls before returning reply text to SVC-01. Total budget: 28 seconds.

### Pattern 2 — Asynchronous Post-Screening Evaluation
```
SVC-02 (screening complete) → SVC-03 (POST /evaluate, async)
                             ↘ SVC-05 (audit event, sync)
SVC-02 returns "Gracias" to candidate immediately.
SVC-03 runs independently (up to 5 minutes).
SVC-03 → SVC-05 (audit: SCORE_COMPUTED)
SVC-03 → MongoDB (persist evaluation)
```
Candidate is not blocked waiting for evaluation. Dashboard shows evaluation when complete.

### Pattern 3 — Dashboard API calls (JWT-authenticated)
```
SVC-07 → SVC-06 (login → access_token)
SVC-07 → SVC-04 (campaign CRUD, JWT)
SVC-07 → SVC-03 (human decision, JWT)
SVC-07 → SVC-05 (audit query / escalation management, JWT)
```
Each Lambda independently validates the JWT using the shared RS256 public key (distributed via Secrets Manager). No central JWT validation proxy needed.

### Pattern 4 — Scheduled Jobs (no API Gateway)
```
EventBridge Rule (every 30 min) → SVC-02 ReengagementScheduler
EventBridge Rule (daily 02:00 UTC) → SVC-05 DataRetentionManager
```
Separate Lambda event sources; not routed through API Gateway.

---

## MongoDB Collections by Service

| Collection | Owner | Writers | Readers |
|---|---|---|---|
| `sessions` | SVC-02 | SVC-02 | SVC-02, SVC-03 |
| `messages` | SVC-02 | SVC-02 | SVC-03, SVC-05 |
| `evaluations` | SVC-03 | SVC-03 | SVC-07 (via SVC-03 API) |
| `campaigns` | SVC-04 | SVC-04 | SVC-02, SVC-03 |
| `rubrics` | SVC-04 | SVC-04 | SVC-02, SVC-03 |
| `documents` | SVC-04 | SVC-04 | SVC-04 |
| `escalated_questions` | SVC-04 | SVC-04 | SVC-04 |
| `consent_records` | SVC-05 | SVC-05 | SVC-02, SVC-05 |
| `audit_events` | SVC-05 | SVC-05 | SVC-05, SVC-07 (via SVC-05 API) |
| `escalation_alerts` | SVC-05 | SVC-05 | SVC-05, SVC-07 (via SVC-05 API) |
| `nps_submissions` | SVC-05 | SVC-05 | SVC-05 |
| `operators` | SVC-06 | SVC-06 | SVC-06 |
| `refresh_tokens` | SVC-06 | SVC-06 | SVC-06 |
| `token_revocations` | SVC-06 | SVC-06 | SVC-06 |
| `failed_login_attempts` | SVC-06 | SVC-06 | SVC-06 |

**Multi-tenancy**: Every collection includes a `tenant_id` field. All queries are scoped by `tenant_id`. No cross-tenant data leakage is possible.

---

*End of services.md*
