# Requirements Document — EntreVista AI

**Version**: 1.0
**Date**: 2026-09-03
**Source**: PRD_agentic_interviewer_ai.md v1.0 + Requirements Analysis
**Status**: Approved — Awaiting Workflow Planning

---

## Intent Analysis Summary

| Attribute | Value |
|---|---|
| **User Request** | Build an agentic interviewer platform conducting intelligent conversational screenings via Telegram for high-volume companies in Latin America |
| **Request Type** | New Project (Greenfield) |
| **Scope Estimate** | System-wide — multi-module platform |
| **Complexity Estimate** | Complex — LLM orchestration, Telegram bot, recruiter dashboard, compliance, multi-tenancy |
| **Depth Level** | Comprehensive |
| **PRD Source** | EntreVista AI v1.0 (2026-09-01, approved) |

---

## Technology Stack Decisions

| Component | Decision | Notes |
|---|---|---|
| **AI Backend** | Python 3.11+ + FastAPI | Main AI/API service |
| **Agentic Framework** | Anthropic Claude Agent SDK | Python-native orchestration |
| **LLM Model** | Anthropic Claude (claude-sonnet-4-6 / claude-opus-4-6) | Primary reasoning engine |
| **Telegram Bot** | Telegraf (Node.js/TypeScript) | Separate gateway service |
| **Frontend Dashboard** | React + TypeScript + Vite | Recruiter web interface |
| **Primary Database** | MongoDB (Atlas) | Semi-structured documents, transcripts |
| **Vector Database / RAG** | Pinecone (managed) | Knowledge base per campaign |
| **Cloud Platform** | AWS | Primary deployment target |
| **Deployment Strategy** | Serverless (AWS Lambda) | Scale to zero, cost-effective for MVP |
| **Authentication** | Email + Password + JWT (self-implemented) | Operator/recruiter login |
| **Multi-tenancy** | Column/field-level (tenant_id) | Logical isolation in shared collections |
| **Data Retention** | 90 days default, auto-purge | Per PRD compliance policy |
| **Code Language** | English | Variables, functions, comments, docs |
| **Security Rules** | ENABLED — all SECURITY-01 to SECURITY-15 as blocking | Production-grade application |
| **Development Priority** | PRD 30/60/90 plan | Motor conversacional → Guardrails → Evaluación → Re-engagement |

### Architecture Pattern: Polyglot Intentional

```
Telegram  <-->  [Service 1: telegram-bot]          [Service 2: ai-backend]
                Node.js + Telegraf (TypeScript)  --> Python + FastAPI + Claude Agent SDK
                Handles Telegram webhooks            Handles AI logic, MongoDB, Pinecone
                Routes messages to ai-backend        Returns structured responses
```

- **Service 1** (`telegram-bot`): Node.js + Telegraf — thin gateway, handles Telegram protocol, delegates AI logic to Service 2 via REST API
- **Service 2** (`ai-backend`): Python + FastAPI + Claude Agent SDK — conversational engine, evaluation, compliance, data persistence
- **Service 3** (`dashboard`): React + TypeScript + Vite — recruiter web app, calls ai-backend REST API

---

## Functional Requirements

### FR-01: Telegram Bot Gateway (Service 1 — Node.js/Telegraf)

| ID | Requirement |
|---|---|
| FR-01.1 | Bot receives messages from Telegram candidates via webhooks |
| FR-01.2 | Bot forwards all candidate messages to ai-backend via REST API with session context |
| FR-01.3 | Bot sends ai-backend responses back to the candidate in Telegram |
| FR-01.4 | Bot handles Telegram-specific events: /start command, message types (text, documents) |
| FR-01.5 | Bot maintains stateless operation — all session state is managed by ai-backend |
| FR-01.6 | Bot handles connection errors gracefully and retries on transient failures |

### FR-02: Conversational Engine (Service 2 — Python/FastAPI)

| ID | Requirement |
|---|---|
| FR-02.1 | System conducts multi-turn conversational screening using Claude as reasoning engine |
| FR-02.2 | Agent presents onboarding message identifying itself as AI before any evaluation |
| FR-02.3 | Agent requests and records explicit affirmative consent before proceeding |
| FR-02.4 | Agent verifies configurable basic requirements (availability, location, documentation) |
| FR-02.5 | Agent asks 3-5 competency questions with dynamic follow-up rephrasing based on candidate answers |
| FR-02.6 | Agent adapts follow-up questions based on previous candidate responses in the same session |
| FR-02.7 | System persists full conversation session state in MongoDB (active, paused, abandoned, completed) |
| FR-02.8 | System supports session resumption — candidate can return to an abandoned session with context preserved |
| FR-02.9 | System handles re-engagement: automated follow-up at 24h inactivity, final reminder at 48h, mark abandoned at 72h |
| FR-02.10 | System tracks abandonment point (which question) per session for analytics |

### FR-03: Guardrails and Anti-Hallucination

| ID | Requirement |
|---|---|
| FR-03.1 | Agent is confined to the campaign knowledge base — cannot answer questions outside its authorized scope |
| FR-03.2 | Agent responds "No tengo esa información" to out-of-scope questions and logs them |
| FR-03.3 | Agent never speculates about salary, benefits, or company policies not in the knowledge base |
| FR-03.4 | Agent never makes hiring commitments or contractual promises |
| FR-03.5 | Agent confirms it is AI when directly asked ("¿Eres una IA?") |
| FR-03.6 | Agent handles offensive/inappropriate content by pausing evaluation and escalating |
| FR-03.7 | Agent resists jailbreak attempts — never reveals prompts, rubrics, or internal scoring |
| FR-03.8 | All out-of-scope escalations are logged with candidate message, timestamp, and campaign context |

### FR-04: Evaluation Engine and Rubrics

| ID | Requirement |
|---|---|
| FR-04.1 | System evaluates candidate responses against configurable competency rubrics in real time |
| FR-04.2 | Rubrics define: competency name, weight (%), scoring criteria per level (1-5), and minimum threshold |
| FR-04.3 | Every score is linked to a specific textual quote from the transcript |
| FR-04.4 | System generates executive summary: overall score, per-competency scores, key signals, citations, recommendation |
| FR-04.5 | Executive summary categorizes candidate as: Highly Recommended / Recommended / Not Recommended |
| FR-04.6 | System provides rubric templates for two role types: BPO/Operational and Tech/SaaS |
| FR-04.7 | Rubrics are configurable per campaign — operators can edit competencies, weights, and criteria |
| FR-04.8 | System records human evaluator disagreements with AI scores for calibration feedback loop |

### FR-05: Human-in-the-Loop (HITL) Dashboard (Service 3 — React)

| ID | Requirement |
|---|---|
| FR-05.1 | Dashboard provides campaign management: create, edit, delete, activate/deactivate campaigns |
| FR-05.2 | Each campaign generates a unique Telegram deep-link for distribution |
| FR-05.3 | Dashboard displays review queue with candidates in status "Pending Human Review" |
| FR-05.4 | Review queue supports filtering by: score range, date, status, recommendation level |
| FR-05.5 | Candidate detail view shows: executive summary, per-competency scores with citations, full transcript |
| FR-05.6 | Recruiter makes explicit human decision: Approve or Reject (no auto-decision by AI) |
| FR-05.7 | Rejection requires mandatory reason selection for audit trail |
| FR-05.8 | Dashboard displays campaign metrics: completion rate, score distribution, approval rate, escalations, abandonments |
| FR-05.9 | Abandonment analytics show at which question drop-offs occur most frequently |

### FR-06: Knowledge Base Management

| ID | Requirement |
|---|---|
| FR-06.1 | Each campaign has an isolated knowledge base (documents uploaded by operator) |
| FR-06.2 | Supported upload formats: PDF, DOCX, TXT |
| FR-06.3 | Documents are chunked, embedded (via Claude or dedicated embedding model), and stored in Pinecone with tenant_id + campaign_id namespace |
| FR-06.4 | RAG pipeline retrieves relevant chunks during conversation to answer candidate questions |
| FR-06.5 | Knowledge base changes take effect immediately for new sessions |

### FR-07: Consent and Compliance

| ID | Requirement |
|---|---|
| FR-07.1 | Every session records affirmative consent with timestamp, candidate ID, and session ID in an immutable log |
| FR-07.2 | All conversation messages are logged immutably: sender, content, timestamp, session_id |
| FR-07.3 | All evaluation events are logged: competency, score, citation, timestamp |
| FR-07.4 | All human decisions are logged: operator_id, decision, reason, timestamp |
| FR-07.5 | Logs cannot be modified or deleted by the application after write |
| FR-07.6 | Post-screening NPS survey (1-5 + optional text) is collected from candidate after session completion |
| FR-07.7 | Candidate data is automatically purged after 90 days (configurable in future versions) |
| FR-07.8 | Data is strictly isolated per tenant (tenant_id enforced on all queries) |

### FR-08: Human Escalation

| ID | Requirement |
|---|---|
| FR-08.1 | System supports 3-level escalation: (1) out-of-scope question → log and continue, (2) repeated out-of-scope → flag to recruiter, (3) explicit human request → halt and alert |
| FR-08.2 | When candidate requests a human, agent saves progress and triggers dashboard notification to recruiter |
| FR-08.3 | Recruiter dashboard shows escalation queue with conversation context and pending questions |
| FR-08.4 | After human intervention, session can be closed or marked for follow-up |

### FR-09: Candidate Lifecycle Management

| ID | Requirement |
|---|---|
| FR-09.1 | Candidate state machine: Initiated → In Screening → Completed → Pending Review → Approved / Rejected |
| FR-09.2 | System detects multiple applications from the same candidate to the same tenant within a configurable window |
| FR-09.3 | Candidate profile stores: Telegram user_id (hashed), campaign, session metadata — no sensitive personal data |
| FR-09.4 | No biometric, emotional, facial, or voice analysis — text only |

### FR-10: Authentication and Authorization (Dashboard)

| ID | Requirement |
|---|---|
| FR-10.1 | Operators authenticate via email + password |
| FR-10.2 | Passwords hashed using bcrypt or argon2 (never stored in plaintext) |
| FR-10.3 | Authentication returns short-lived JWT access token (15-60 min) + long-lived refresh token |
| FR-10.4 | All dashboard API endpoints require valid JWT — deny by default |
| FR-10.5 | Role-based access: Admin (manage users, billing, all campaigns) and Recruiter (manage own campaigns, review queue) |
| FR-10.6 | Brute-force protection: account lockout after 5 failed attempts with progressive delay |

---

## Non-Functional Requirements

### NFR-01: Performance

| ID | Requirement |
|---|---|
| NFR-01.1 | Agent response latency < 5 seconds for 95th percentile under normal load |
| NFR-01.2 | System supports 100+ concurrent screening sessions without performance degradation |
| NFR-01.3 | API endpoints respond within 200ms for non-AI operations (dashboard queries, campaign CRUD) |
| NFR-01.4 | No cross-session contamination under concurrent load (red-team RT9 scenario) |

### NFR-02: Reliability

| ID | Requirement |
|---|---|
| NFR-02.1 | System availability target: 99.5% monthly uptime |
| NFR-02.2 | Session state survives service restarts (persisted in MongoDB, not in-memory only) |
| NFR-02.3 | All external API calls (Anthropic, Pinecone, Telegram) have retry logic with exponential backoff |
| NFR-02.4 | Failure of RAG retrieval degrades gracefully (agent falls back to "No tengo esa información") |

### NFR-03: Security

| ID | Requirement |
|---|---|
| NFR-03.1 | All SECURITY-01 to SECURITY-15 rules enforced as blocking constraints (Security Baseline Extension ENABLED) |
| NFR-03.2 | MongoDB Atlas encryption at rest enabled; all connections use TLS 1.2+ |
| NFR-03.3 | Pinecone API keys stored in AWS Secrets Manager — never hardcoded |
| NFR-03.4 | Anthropic API keys stored in AWS Secrets Manager — never hardcoded |
| NFR-03.5 | JWT tokens validated server-side on every request (signature, expiration, audience) |
| NFR-03.6 | Input validation on all API endpoints: type, length, format — no raw user input in DB queries |
| NFR-03.7 | Rate limiting on all public-facing endpoints (Telegram webhook, auth endpoints) |
| NFR-03.8 | Audit logs stored in append-only storage — application cannot delete its own logs |
| NFR-03.9 | Multi-tenant data isolation enforced at query level — every query scoped to tenant_id |
| NFR-03.10 | No stack traces or internal details exposed in API error responses |

### NFR-04: Scalability

| ID | Requirement |
|---|---|
| NFR-04.1 | Serverless architecture (AWS Lambda) scales automatically with message volume |
| NFR-04.2 | MongoDB Atlas auto-scales storage and compute |
| NFR-04.3 | Pinecone namespace-per-campaign supports tenant isolation without shared index degradation |
| NFR-04.4 | Architecture supports adding new tenants without code changes |

### NFR-05: Compliance and Privacy (LATAM)

| ID | Requirement |
|---|---|
| NFR-05.1 | Candidate always explicitly informed of AI involvement before screening begins |
| NFR-05.2 | Candidate data used only for the purpose for which consent was given |
| NFR-05.3 | No biometric or emotional data collected — text content only |
| NFR-05.4 | Audit trail 100% traceable: every score has a textual citation |
| NFR-05.5 | Architecture supports future EU AI Act compliance requirements (modular design) |
| NFR-05.6 | Candidate data segregated per tenant — no cross-client data access |

### NFR-06: Maintainability

| ID | Requirement |
|---|---|
| NFR-06.1 | All code in English (variables, functions, comments, documentation) |
| NFR-06.2 | Separate service codebases: `telegram-bot` (Node.js) and `ai-backend` (Python) |
| NFR-06.3 | LLM provider abstracted behind interface — provider can be swapped without service rewrite |
| NFR-06.4 | Prompts externalized to configuration files — not hardcoded in application logic |
| NFR-06.5 | Test coverage: unit tests for business logic, integration tests for API endpoints |

### NFR-07: Agent Quality

| ID | Requirement |
|---|---|
| NFR-07.1 | Hallucination rate < 1% (measured via weekly sampling of 50 conversations) |
| NFR-07.2 | Guardrail containment rate >= 99% (tested with adversarial prompts) |
| NFR-07.3 | Relevance of follow-up questions >= 85% (human evaluator rating) |
| NFR-07.4 | Executive summary fidelity >= 90% (summaries rated "faithful" by human reviewer) |
| NFR-07.5 | Candidate NPS >= 4.0/5.0 |
| NFR-07.6 | Screening completion rate >= 80% |

---

## System Boundaries and Integrations

### In Scope (MVP)
- Telegram as sole candidate channel
- AWS as sole cloud provider
- MongoDB Atlas as primary data store
- Pinecone as vector DB
- Anthropic Claude API as sole LLM provider
- React dashboard served as SPA

### Out of Scope (MVP)
- ATS integrations (Buk, Workday, SAP)
- WhatsApp or web chat channel
- Voice or video analysis
- Mobile native app
- Multi-language support beyond Spanish
- Automated scheduling of next interview stage
- Advanced analytics / predictive insights

### External Dependencies
| Service | Purpose | Criticality |
|---|---|---|
| Anthropic API | LLM reasoning, embeddings | Critical — single point; abstraction layer required |
| Telegram Bot API | Candidate communication channel | Critical — single channel in MVP |
| Pinecone | Semantic search over knowledge base | High |
| MongoDB Atlas | Primary data persistence | Critical |
| AWS Lambda | Compute | Critical |
| AWS S3 | Document storage (uploaded knowledge base files) | High |
| AWS Secrets Manager | Credentials management | Critical |

---

## Key Constraints

1. **HITL is non-negotiable** — AI never auto-approves or auto-rejects candidates
2. **Transparency is non-negotiable** — AI identity disclosed before evaluation begins, consent required
3. **Traceability is non-negotiable** — Every score linked to textual citation; logs immutable
4. **No biometric data** — Text-only evaluation; no facial, voice, or emotional analysis
5. **Multi-tenancy isolation** — Tenant data never crosses boundaries
6. **Security rules enforced** — All SECURITY-01 to SECURITY-15 are blocking

---

## Extension Configuration (Finalized)

| Extension | Enabled | Decided At |
|---|---|---|
| Security Baseline (SECURITY-01 to SECURITY-15) | **Yes** | Requirements Analysis |
