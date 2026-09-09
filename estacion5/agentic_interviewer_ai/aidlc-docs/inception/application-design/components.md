# Components — EntreVista AI

**Generated**: 2026-06-20
**Architecture**: Polyglot Multi-Lambda Microservices
**Session State**: MongoDB only (stateless Lambdas, full state in MongoDB per request)

---

## Architecture Overview

```
+------------------+      +--------------------+
|   Telegram API   |      |  Recruiter Browser |
+--------+---------+      +---------+----------+
         |                          |
         v                          v
+--------+---------+      +---------+----------+
| telegram-bot     |      |    dashboard        |
| (Lambda: Node.js)|      | (CloudFront + S3)   |
| Telegraf         |      | React + TypeScript  |
+--------+---------+      +---------+----------+
         |                          |
         | REST                     | REST + JWT
         v                          v
+--------+--+  +--------+  +--------+----------+
|conversation|  |campaign|  |    auth-lambda    |
|  lambda    |  | lambda |  | (Python/FastAPI)  |
|(Python/    |  |(Python/|  +-------------------+
| FastAPI +  |  | FastAPI|
|Claude SDK) |  |+ RAG)  |  +-evaluation-lambda-+
+------------+  +--------+  | (Python/FastAPI)  |
         |           |      +-------------------+
         |           |
         |           |      +-compliance-lambda-+
         |           |      | (Python/FastAPI)  |
         |           |      +-------------------+
         |
         v
+--------+---------+      +---------+----------+
|   MongoDB Atlas  |      |    Pinecone         |
|  (primary store) |      | (vector DB / RAG)   |
+------------------+      +--------------------+

+------------------+
|  AWS Secrets Mgr |
+------------------+
```

---

## Service 1: telegram-bot (Node.js / Telegraf)

### Component: TelegramGateway

**Responsibility**: Entry point for all Telegram messages. Receives webhooks from Telegram, extracts message content and chat ID, and routes to the ai-backend conversation-lambda.

**Key Behaviors**:
- Parse incoming Telegram Update objects (text messages, /start commands)
- Extract `chat_id`, `user_id`, `message_text`, `message_id` from each update
- Call conversation-lambda via HTTP POST with structured payload
- Return conversation-lambda response text back to Telegram via `sendMessage`
- Handle Telegram webhook verification (secret token validation)
- Log incoming messages and outgoing calls for observability

**Interfaces**:
- **Inbound**: Telegram Webhook POST (`/webhook`)
- **Outbound**: REST POST to `conversation-lambda` `/api/v1/messages`

---

### Component: SessionRouter

**Responsibility**: Determine if an incoming message belongs to an existing session or requires a new session to be started. Passes session context to TelegramGateway.

**Key Behaviors**:
- Construct the request payload for conversation-lambda from Telegram message data
- Attach `telegram_user_id` (hashed), `campaign_start_code` (from /start deep-link parameter), and message text
- Handle `/start` command: extract campaign ID from start parameter and include in payload
- Handle regular text messages: pass through to conversation-lambda with no campaign ID (session already exists in MongoDB)

---

### Component: MessageFormatter

**Responsibility**: Format responses from conversation-lambda into Telegram-compatible message objects with proper text, parse mode, and optional inline keyboards.

**Key Behaviors**:
- Convert plain text responses to Telegram `sendMessage` payloads
- Apply HTML or Markdown parse mode as configured
- Split long messages that exceed Telegram's 4096-character limit
- Format the NPS survey as Telegram inline keyboard (1-5 buttons)

---

## Service 2: conversation-lambda (Python / FastAPI + Claude Agent SDK)

### Component: ConversationRouter (FastAPI App)

**Responsibility**: FastAPI application entry point for the conversation-lambda. Routes incoming API calls to the appropriate handler.

**Key Behaviors**:
- Expose POST `/api/v1/messages` endpoint (called by telegram-bot)
- Validate JWT or shared secret on all incoming requests from telegram-bot
- Route to ConversationOrchestrator for message processing
- Return structured response: `{ "text": "...", "session_state": "..." }`

---

### Component: ConversationOrchestrator

**Responsibility**: Core agentic conversation controller. Manages the multi-turn screening flow by reading session state from MongoDB, determining the current stage, invoking Claude, and persisting updated state.

**Key Behaviors**:
- Load current session from MongoDB by `telegram_user_id` + `campaign_id`
- Determine current conversation stage: `AWAITING_CONSENT`, `REQUIREMENTS_CHECK`, `SCREENING`, `ESCALATED`, `COMPLETED`, `ABANDONED`
- Dispatch to the appropriate stage handler (ConsentHandler, RequirementsHandler, ScreeningHandler)
- Persist all conversation events (messages, stage transitions) to MongoDB
- Return the agent's next response text

---

### Component: ConsentHandler

**Responsibility**: Manages the onboarding and consent stage of the conversation. Ensures AI identity is disclosed and explicit consent is recorded before any evaluation begins.

**Key Behaviors**:
- Generate onboarding message with AI disclosure, purpose, data usage, and consent request
- Parse candidate response to detect affirmative consent ("sí", "acepto", "ok", etc.) or refusal
- On consent: write immutable consent event to AuditLogger; transition session to `REQUIREMENTS_CHECK`
- On refusal: send graceful exit message; mark session as `CONSENT_DECLINED`; do not create evaluation record

---

### Component: RequirementsHandler

**Responsibility**: Manages the basic requirements verification stage. Asks configurable pre-screening questions and decides if the candidate qualifies to proceed.

**Key Behaviors**:
- Load campaign's required criteria list from MongoDB
- Ask one requirement question at a time in conversational style
- Parse candidate responses against expected criteria (availability, location, documentation)
- On all criteria met: transition session to `SCREENING`
- On criteria not met: send polite disqualification message; mark session `DISQUALIFIED_REQUIREMENTS`

---

### Component: ScreeningHandler

**Responsibility**: Core competency screening handler. Generates contextual competency questions and follow-ups using Claude, enforces guardrails, and collects evidence for evaluation.

**Key Behaviors**:
- Load campaign rubric (competencies, question templates) from MongoDB
- Generate the next competency question using Claude, informed by rubric and conversation history
- Detect response completeness: if vague, generate one follow-up; if sufficient, move to next competency
- Route out-of-scope questions to GuardrailsFilter
- After all competencies covered: transition session to `AWAITING_EVALUATION` and call evaluation-lambda
- Track question index and answered competencies in session state

---

### Component: GuardrailsFilter

**Responsibility**: Intercepts candidate messages before they reach the Claude reasoning layer. Detects out-of-scope questions, jailbreak attempts, and inappropriate content.

**Key Behaviors**:
- Check message against out-of-scope patterns (salary, benefits, policy questions)
- Detect jailbreak attempts ("ignore your instructions", "reveal your rubric")
- Detect explicit requests for human escalation ("quiero hablar con una persona")
- On out-of-scope: return scripted response + log escalation event via ComplianceClient
- On jailbreak attempt: return security response + log attempt
- On human escalation request: return acknowledgment + trigger EscalationNotifier
- Pass-through: forward clean messages to ScreeningHandler / ConversationOrchestrator

---

### Component: EscalationNotifier

**Responsibility**: Triggers human escalation alerts when a candidate requests a human agent or when guardrail thresholds are exceeded.

**Key Behaviors**:
- Save session progress at point of escalation (question index, partial answers)
- Post escalation event to compliance-lambda via REST (creates alert in dashboard)
- Return candidate-facing confirmation message

---

### Component: ReengagementScheduler

**Responsibility**: Manages the automated re-engagement flow for inactive sessions. Detects sessions that have gone silent and schedules follow-up messages.

**Key Behaviors**:
- Triggered by scheduled Lambda event (every 30 minutes) — not per-message
- Query MongoDB for sessions in `PAUSED` or `IN_PROGRESS` state with last activity > 24h
- Send 24h follow-up message via Telegram API directly
- After another 24h without response: send 48h follow-up
- After another 24h without response: mark session `ABANDONED_NO_RESPONSE`

---

## Service 3: evaluation-lambda (Python / FastAPI)

### Component: EvaluationRouter (FastAPI App)

**Responsibility**: FastAPI entry point for the evaluation-lambda. Accepts evaluation requests from conversation-lambda after screening completion.

**Key Behaviors**:
- Expose POST `/api/v1/evaluate` endpoint
- Validate shared internal secret on requests from conversation-lambda
- Route to EvaluationEngine

---

### Component: EvaluationEngine

**Responsibility**: Core scoring engine. Takes a completed conversation transcript and campaign rubric and produces per-competency scores with textual citations.

**Key Behaviors**:
- Load campaign rubric from MongoDB (competencies, weights, level descriptors)
- For each competency: invoke Claude with transcript + rubric criteria to extract relevant evidence and assign a score (1-5)
- Extract verbatim citation from transcript to justify each score
- Validate that every score has at least one citation (reject scores without citations)
- Calculate weighted overall score
- Classify recommendation: `HIGHLY_RECOMMENDED` (>=80%), `RECOMMENDED` (60-79%), `NOT_RECOMMENDED` (<60%)

---

### Component: SummaryGenerator

**Responsibility**: Generates the human-readable executive summary for recruiter review.

**Key Behaviors**:
- Format per-competency results into structured summary sections
- Extract 2-3 key positive signals from highest-scored competencies
- Extract 1-2 risk signals from lowest-scored competencies if below threshold
- Generate summary in neutral Spanish
- Persist summary to MongoDB `evaluations` collection

---

### Component: DisagreementTracker

**Responsibility**: Records human evaluator disagreements with AI scores for calibration purposes.

**Key Behaviors**:
- Accept POST from dashboard-lambda when recruiter disagrees with a score
- Record: original AI score, human score, operator_id, competency, session_id, timestamp
- Aggregate disagreement rate per campaign per competency for analytics

---

## Service 4: campaign-lambda (Python / FastAPI + RAG)

### Component: CampaignRouter (FastAPI App)

**Responsibility**: FastAPI entry point for campaign and knowledge base management. All endpoints require JWT authentication (validated via auth-lambda or shared secret).

**Key Behaviors**:
- Expose CRUD endpoints: `/api/v1/campaigns`, `/api/v1/rubrics`, `/api/v1/knowledge-base`
- Validate JWT on all requests
- Enforce tenant_id scoping on all MongoDB queries

---

### Component: CampaignManager

**Responsibility**: Manages the full lifecycle of screening campaigns.

**Key Behaviors**:
- Create, read, update, archive campaigns per tenant
- Generate unique Telegram deep-link parameter (campaign_code) on campaign creation
- Validate rubric completeness before activation (weights sum to 100%)
- Return campaign metrics (stored in MongoDB, aggregated on read)

---

### Component: RubricManager

**Responsibility**: Manages competency rubrics and role templates.

**Key Behaviors**:
- Store and retrieve rubric definitions (competencies, weights, level descriptors)
- Provide built-in templates: BPO Customer Service, Tech Engineering, Tech QA
- Validate rubric: all weights sum to 100%, min 1 competency, max 10 competencies
- Clone rubric from template for new campaign

---

### Component: KnowledgeBaseManager

**Responsibility**: Manages document uploads and the RAG pipeline for campaign knowledge bases.

**Key Behaviors**:
- Accept PDF, DOCX, TXT file uploads (max 10MB per file)
- Store raw files in S3 (under `tenantId/campaignId/` prefix)
- Trigger document processing: chunk → embed via Anthropic embeddings API → upsert to Pinecone namespace `tenantId_campaignId`
- Track document status: `PROCESSING`, `ACTIVE`, `FAILED`
- Delete document: remove from S3, delete vectors from Pinecone namespace

---

### Component: RAGService

**Responsibility**: Provides semantic search over a campaign's knowledge base to answer candidate questions during screening.

**Key Behaviors**:
- Accept a natural language query + campaign_id + tenant_id
- Generate query embedding via Anthropic embeddings API
- Query Pinecone namespace `tenantId_campaignId` for top-5 relevant chunks
- Return retrieved chunks to ConversationOrchestrator for inclusion in Claude context
- Log retrieval: query, retrieved chunk IDs, timestamp (for debugging)

---

### Component: EscalatedQuestionsTracker

**Responsibility**: Tracks questions that the agent could not answer (out-of-scope) per campaign for knowledge base improvement.

**Key Behaviors**:
- Store escalated questions: campaign_id, question_text, frequency_count, last_seen
- Increment frequency on duplicate questions
- Expose query endpoint for knowledge base improvement dashboard view

---

## Service 5: compliance-lambda (Python / FastAPI)

### Component: ComplianceRouter (FastAPI App)

**Responsibility**: FastAPI entry point for compliance, consent, audit, and candidate lifecycle events.

**Key Behaviors**:
- Expose endpoints for: consent recording, audit event writing, escalation alerts, NPS submission, data purge
- Enforce append-only semantics on audit log writes (no update or delete on audit events)
- Validate requests from internal services via shared secret

---

### Component: ConsentManager

**Responsibility**: Records and retrieves candidate consent events with immutability guarantees.

**Key Behaviors**:
- Write consent event: `session_id`, `telegram_user_id_hash`, `campaign_id`, `tenant_id`, `timestamp`, `consent_given: boolean`
- Enforce write-once semantics (no update or delete on consent documents)
- Provide consent verification endpoint (called by ConversationOrchestrator on session start)

---

### Component: AuditLogger

**Responsibility**: Immutable append-only log of all system events (messages, evaluations, human decisions, escalations).

**Key Behaviors**:
- Write audit events: `event_type`, `actor`, `session_id`, `tenant_id`, `payload`, `timestamp`
- Supported event types: `MESSAGE_SENT`, `MESSAGE_RECEIVED`, `CONSENT_RECORDED`, `SCORE_COMPUTED`, `HUMAN_DECISION`, `ESCALATION_TRIGGERED`, `JAILBREAK_ATTEMPT`, `DATA_PURGED`
- No update or delete operations — insert-only collection in MongoDB
- Expose query endpoint for audit log retrieval (by session_id, campaign_id, date range)

---

### Component: EscalationAlertManager

**Responsibility**: Creates and manages human escalation alerts visible in the recruiter dashboard.

**Key Behaviors**:
- Create escalation alert: `session_id`, `candidate_alias`, `campaign_id`, `escalation_type`, `context`, `timestamp`
- Mark alert as resolved by recruiter
- Provide alert list endpoint filtered by tenant_id and campaign_id

---

### Component: NPSCollector

**Responsibility**: Collects and stores post-screening NPS surveys from candidates.

**Key Behaviors**:
- Accept NPS submission: `session_id`, `score (1-5)`, `comment (optional)`, `timestamp`
- Validate: one submission per completed session
- Expose aggregate NPS endpoint: average score, distribution, recent comments per campaign

---

### Component: DataRetentionManager

**Responsibility**: Enforces data retention policy by purging candidate data after the configured retention period.

**Key Behaviors**:
- Triggered by scheduled Lambda event (daily)
- Query for sessions with `completed_at` older than retention period (default 90 days)
- Delete: session documents, message documents, evaluation documents, consent documents
- Preserve: anonymized aggregate statistics (score averages, completion rates)
- Write `DATA_PURGED` audit event for each purged candidate record

---

## Service 6: auth-lambda (Python / FastAPI)

### Component: AuthRouter (FastAPI App)

**Responsibility**: FastAPI entry point for authentication and user management. Handles operator login and token lifecycle.

---

### Component: AuthService

**Responsibility**: Manages operator authentication with email/password and JWT token issuance.

**Key Behaviors**:
- Validate email + password against hashed password in MongoDB
- Hash passwords using argon2id on registration
- Issue short-lived JWT access token (60 min) + long-lived refresh token (7 days)
- Validate refresh token and issue new access token
- Invalidate refresh tokens on logout

---

### Component: TokenManager

**Responsibility**: Issues, validates, and revokes JWT tokens.

**Key Behaviors**:
- Sign JWT with RS256 private key (stored in Secrets Manager)
- JWT payload: `sub` (operator_id), `tenant_id`, `role`, `exp`, `iat`, `jti`
- Validate JWT signature and expiration on every protected endpoint
- Maintain a revocation list in MongoDB for logged-out JWTs (checked on validation)

---

### Component: BruteForceProtector

**Responsibility**: Prevents brute-force login attacks by tracking failed attempts per account.

**Key Behaviors**:
- Increment failed attempt counter per email per hour
- Lock account after 5 consecutive failures (15-minute progressive lockout)
- Reset counter on successful login
- Return `429 Too Many Requests` when account is locked

---

### Component: OperatorManager

**Responsibility**: Manages operator accounts within a tenant.

**Key Behaviors**:
- Create, update, deactivate operator accounts
- Assign roles: `ADMIN` or `RECRUITER`
- Enforce that only ADMIN can create other operators
- Return operator profile (name, email, role, tenant_id)

---

## Service 7: dashboard (React / TypeScript / Vite)

### Component: AuthController

**Responsibility**: Manages frontend authentication state.

**Key Behaviors**:
- POST to auth-lambda `/api/v1/auth/login` with email + password
- Store JWT access token in memory (never localStorage)
- Store refresh token in HTTP-only cookie
- Attach access token to all API requests via Authorization header
- Automatically refresh access token when < 5 minutes from expiry

---

### Component: ReviewQueueView

**Responsibility**: Displays the list of candidates pending human review for a given campaign.

**Key Behaviors**:
- Fetch candidates with status `PENDING_REVIEW` from compliance-lambda
- Display: candidate alias, score, recommendation level, completion date, escalation flag
- Support filtering (score range, recommendation level, date range) and sorting (score, date)
- Navigate to CandidateDetailView on row click

---

### Component: CandidateDetailView

**Responsibility**: Full candidate review screen — executive summary, scores, transcript, and decision controls.

**Key Behaviors**:
- Load candidate evaluation and full transcript from evaluation-lambda and compliance-lambda
- Render executive summary: overall score, per-competency scores with citations
- Render full conversation transcript with competency annotations
- Provide Approve and Reject buttons; Reject requires reason selection from dropdown
- POST human decision to compliance-lambda (AuditLogger event) and evaluation-lambda (status update)

---

### Component: CampaignManagerView

**Responsibility**: Campaign creation, configuration, and management interface.

**Key Behaviors**:
- CRUD operations on campaigns via campaign-lambda
- Rubric editor: add/remove competencies, set weights with live validation (sum to 100%)
- Generate and copy Telegram deep-link on campaign activation
- Archive/delete campaigns

---

### Component: KnowledgeBaseManagerView

**Responsibility**: Knowledge base document management per campaign.

**Key Behaviors**:
- Upload documents (PDF, DOCX, TXT) via campaign-lambda
- Display document processing status (PROCESSING, ACTIVE, FAILED)
- Show escalated unanswered questions list with frequency counts
- Delete documents

---

### Component: AnalyticsDashboard

**Responsibility**: Campaign-level analytics and pipeline health metrics.

**Key Behaviors**:
- Display: total started, completion rate, score distribution, approval rate, abandonment by question
- Fetch metrics from compliance-lambda and evaluation-lambda aggregate endpoints
- Export data as CSV via campaign-lambda
- Display NPS trend and recent comments

---

### Component: APIClient

**Responsibility**: Shared HTTP client for all dashboard-to-backend API calls.

**Key Behaviors**:
- Attach JWT access token to every request
- Handle 401 responses by attempting token refresh; redirect to login if refresh fails
- Provide typed wrappers for each lambda's API endpoints
- Handle network errors with user-visible toasts
