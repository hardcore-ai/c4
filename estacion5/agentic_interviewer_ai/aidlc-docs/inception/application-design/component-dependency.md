# Component Dependency — EntreVista AI

**Generated**: 2026-06-20
**Architecture**: Polyglot Multi-Lambda Microservices

---

## Dependency Matrix

Each cell indicates the type of dependency from the **row** component to the **column** service/component.

Legend:
- `REST` — Synchronous HTTP REST call
- `REST(A)` — Asynchronous HTTP REST call (caller does not wait for full processing)
- `DB` — Direct MongoDB read/write
- `SDK` — Library/SDK dependency (in-process)
- `S3` — AWS S3 read/write
- `VEC` — Pinecone vector DB read/write
- `—` — No dependency

### Service-to-Service Dependency Matrix

| From \ To | SVC-01<br>telegram-bot | SVC-02<br>conversation | SVC-03<br>evaluation | SVC-04<br>campaign | SVC-05<br>compliance | SVC-06<br>auth | SVC-07<br>dashboard | MongoDB | Pinecone | S3 | Anthropic API | Telegram API |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **SVC-01** telegram-bot | — | REST | — | — | — | — | — | — | — | — | — | REST |
| **SVC-02** conversation | — | — | REST(A) | REST | REST | — | — | DB | — | — | SDK | REST |
| **SVC-03** evaluation | — | — | — | — | REST | — | — | DB | — | — | SDK | — |
| **SVC-04** campaign | — | — | — | — | — | — | — | DB | VEC | S3 | SDK | — |
| **SVC-05** compliance | — | — | — | — | — | — | — | DB | — | — | — | — |
| **SVC-06** auth | — | — | — | — | — | — | — | DB | — | — | — | — |
| **SVC-07** dashboard | — | — | REST | REST | REST | REST | — | — | — | — | — | — |

---

## Component-Level Dependency Map

### SVC-01: telegram-bot

```
TelegramGateway
  ├── depends on: SessionRouter (in-process)
  ├── depends on: MessageFormatter (in-process)
  ├── calls: SVC-02/ConversationRouter (REST POST /api/v1/messages)
  └── calls: Telegram API (sendMessage)

SessionRouter
  └── depends on: TelegramGateway (in-process, called by)

MessageFormatter
  └── depends on: TelegramGateway (in-process, called by)
```

---

### SVC-02: conversation-lambda

```
ConversationRouter (FastAPI App)
  └── depends on: ConversationOrchestrator (in-process)

ConversationOrchestrator
  ├── depends on: ConsentHandler (in-process)
  ├── depends on: RequirementsHandler (in-process)
  ├── depends on: ScreeningHandler (in-process)
  ├── depends on: GuardrailsFilter (in-process)
  ├── depends on: EscalationNotifier (in-process)
  ├── reads/writes: MongoDB (sessions, messages collections)
  └── reads: MongoDB (campaigns, rubrics collections)

ConsentHandler
  ├── depends on: ConversationOrchestrator (in-process, called by)
  └── calls: SVC-05/ComplianceRouter (REST POST /api/v1/consent)

RequirementsHandler
  ├── depends on: ConversationOrchestrator (in-process, called by)
  └── reads: MongoDB (campaigns collection)

ScreeningHandler
  ├── depends on: ConversationOrchestrator (in-process, called by)
  ├── depends on: GuardrailsFilter (in-process)
  ├── calls: Anthropic Claude API (via Claude Agent SDK)
  ├── calls: SVC-04/CampaignRouter (REST POST /api/v1/knowledge-base/search)
  └── calls: SVC-03/EvaluationRouter (REST(A) POST /api/v1/evaluate) on completion

GuardrailsFilter
  ├── depends on: ScreeningHandler (in-process, called by)
  ├── calls: SVC-05/ComplianceRouter (REST POST /api/v1/audit/events) on jailbreak/escalation
  └── calls: EscalationNotifier (in-process) on human escalation request

EscalationNotifier
  ├── depends on: GuardrailsFilter (in-process, called by)
  └── calls: SVC-05/ComplianceRouter (REST POST /api/v1/escalations)

ReengagementScheduler
  ├── triggered by: EventBridge (every 30 min) — independent Lambda event
  ├── reads/writes: MongoDB (sessions collection)
  └── calls: Telegram API (sendMessage) directly
```

---

### SVC-03: evaluation-lambda

```
EvaluationRouter (FastAPI App)
  └── depends on: EvaluationEngine (in-process)

EvaluationEngine
  ├── reads: MongoDB (sessions, messages, campaigns, rubrics collections)
  ├── depends on: SummaryGenerator (in-process)
  └── calls: Anthropic Claude API (score per competency)

SummaryGenerator
  ├── depends on: EvaluationEngine (in-process, called by)
  ├── writes: MongoDB (evaluations collection)
  └── calls: SVC-05/ComplianceRouter (REST POST /api/v1/audit/events — SCORE_COMPUTED)

DisagreementTracker
  ├── triggered by: dashboard human decision flow (REST POST /api/v1/evaluate/{id}/disagree)
  └── writes: MongoDB (evaluations.disagreements subdocument)
```

---

### SVC-04: campaign-lambda

```
CampaignRouter (FastAPI App)
  ├── depends on: CampaignManager (in-process)
  ├── depends on: RubricManager (in-process)
  ├── depends on: KnowledgeBaseManager (in-process)
  ├── depends on: RAGService (in-process)
  └── depends on: EscalatedQuestionsTracker (in-process)

CampaignManager
  ├── depends on: CampaignRouter (in-process, called by)
  └── reads/writes: MongoDB (campaigns collection)

RubricManager
  ├── depends on: CampaignRouter (in-process, called by)
  └── reads/writes: MongoDB (rubrics collection)

KnowledgeBaseManager
  ├── depends on: CampaignRouter (in-process, called by)
  ├── reads/writes: MongoDB (documents collection)
  ├── reads/writes: AWS S3 (raw document storage)
  ├── calls: Anthropic Embeddings API (chunk embedding)
  └── reads/writes: Pinecone (vector upsert / delete by namespace)

RAGService
  ├── depends on: ScreeningHandler via CampaignRouter (in-process, called by REST)
  ├── calls: Anthropic Embeddings API (query embedding)
  ├── reads: Pinecone (semantic search by namespace)
  └── writes: MongoDB (rag_retrieval_logs collection)

EscalatedQuestionsTracker
  ├── depends on: CampaignRouter (in-process, called by)
  └── reads/writes: MongoDB (escalated_questions collection)
```

---

### SVC-05: compliance-lambda

```
ComplianceRouter (FastAPI App)
  ├── depends on: ConsentManager (in-process)
  ├── depends on: AuditLogger (in-process)
  ├── depends on: EscalationAlertManager (in-process)
  ├── depends on: NPSCollector (in-process)
  └── depends on: DataRetentionManager (in-process)

ConsentManager
  └── reads/writes: MongoDB (consent_records collection — insert-only semantics)

AuditLogger
  └── writes: MongoDB (audit_events collection — insert-only)

EscalationAlertManager
  └── reads/writes: MongoDB (escalation_alerts collection)

NPSCollector
  └── reads/writes: MongoDB (nps_submissions collection)

DataRetentionManager
  ├── triggered by: EventBridge (daily 02:00 UTC) — independent Lambda event
  ├── reads/writes: MongoDB (sessions, messages, evaluations, consent_records)
  └── calls: AuditLogger (in-process — writes DATA_PURGED event after each purge)
```

---

### SVC-06: auth-lambda

```
AuthRouter (FastAPI App)
  ├── depends on: AuthService (in-process)
  ├── depends on: TokenManager (in-process)
  ├── depends on: BruteForceProtector (in-process)
  └── depends on: OperatorManager (in-process)

AuthService
  ├── depends on: BruteForceProtector (in-process)
  ├── depends on: TokenManager (in-process)
  └── reads: MongoDB (operators collection)

TokenManager
  ├── reads: AWS Secrets Manager (RS256 private/public key)
  └── reads/writes: MongoDB (refresh_tokens, token_revocations collections)

BruteForceProtector
  └── reads/writes: MongoDB (failed_login_attempts collection)

OperatorManager
  └── reads/writes: MongoDB (operators collection)
```

---

### SVC-07: dashboard (React SPA)

```
AuthController
  └── calls: SVC-06/AuthRouter (REST POST /api/v1/auth/login, /refresh, /logout)

ReviewQueueView
  ├── depends on: APIClient (in-process)
  └── calls: SVC-05/ComplianceRouter (REST GET /api/v1/escalations)

CandidateDetailView
  ├── depends on: APIClient (in-process)
  ├── calls: SVC-03/EvaluationRouter (REST GET evaluation, POST decision, POST disagree)
  └── calls: SVC-05/ComplianceRouter (REST GET audit events)

CampaignManagerView
  ├── depends on: APIClient (in-process)
  └── calls: SVC-04/CampaignRouter (REST CRUD /api/v1/campaigns, /api/v1/rubrics)

KnowledgeBaseManagerView
  ├── depends on: APIClient (in-process)
  └── calls: SVC-04/CampaignRouter (REST /api/v1/knowledge-base)

AnalyticsDashboard
  ├── depends on: APIClient (in-process)
  ├── calls: SVC-05/ComplianceRouter (REST GET aggregate metrics)
  └── calls: SVC-04/CampaignRouter (REST GET escalated questions, CSV export)

APIClient
  ├── depends on: AuthController (in-process — JWT token injection)
  └── calls: all backend lambdas via HTTPS
```

---

## Data Flow Diagrams

### Flow 1 — Candidate Onboarding and Consent

```
Candidate                  SVC-01            SVC-02              SVC-05         MongoDB
   |                     telegram-bot     conversation         compliance
   |-- /start c_ABC123 -->|                   |                   |               |
   |                      |-- POST /messages->|                   |               |
   |                      |   {campaign_code} |-- load session -->|               |
   |                      |                   |<-- new session ---|-- INSERT ----->|
   |                      |                   |-- POST /consent ->|               |
   |                      |                   |   {pending}       |-- INSERT ----->|
   |<-- AI disclosure ----|<-- reply text ----|                   |               |
   |                      |                   |                   |               |
   |-- "Sí, acepto" ------>|                   |                   |               |
   |                      |-- POST /messages->|                   |               |
   |                      |                   |-- parse consent ->|               |
   |                      |                   |-- POST /consent ->|               |
   |                      |                   |   {accepted:true} |-- INSERT ----->|
   |                      |                   |-- UPDATE session->|-- UPDATE ----->|
   |                      |                   |   state=REQ_CHECK |               |
   |<-- first question ----|<-- reply text ----|                   |               |
```

---

### Flow 2 — Screening and Evaluation

```
Candidate    SVC-01    SVC-02            SVC-04        SVC-03       SVC-05   MongoDB
   |          tg-bot   conversation      campaign      evaluation   compliance
   |                      |                |              |            |        |
   |-- answer ----------->|                |              |            |        |
   |                      |-- /messages -->|              |            |        |
   |                      |                |-- /search -->|            |        |
   |                      |                |  (RAG)       |            |        |
   |                      |                |<-- chunks ---|            |        |
   |                      |   Claude call  |              |            |        |
   |                      |   (follow-up   |              |            |        |
   |                      |    or next Q)  |              |            |        |
   |                      |                |              |            |        |
   |   [last competency answered]          |              |            |        |
   |                      |-- /evaluate -->|-- /evaluate->|            |        |
   |                      |   (async)      |  (async)     |            |        |
   |<-- "Gracias" ---------|<-- reply ------|              |            |        |
   |                      |                |              |-- Claude ->|        |
   |                      |                |              |   scoring  |        |
   |                      |                |              |-- /audit ->|        |
   |                      |                |              |            |-- INSERT|
   |                      |                |              |-- INSERT evaluation |
   |                      |                |              |   (MongoDB)|        |
```

---

### Flow 3 — Recruiter Review and Human Decision

```
Recruiter    SVC-07        SVC-06       SVC-03        SVC-05      MongoDB
  |         dashboard       auth       evaluation    compliance
  |                           |             |             |          |
  |-- login ----------------->|             |             |          |
  |<-- JWT -------------------|             |             |          |
  |                                         |             |          |
  |-- GET /review-queue ------------------>|             |          |
  |<-- candidate list ----------------------|             |          |
  |                                         |             |          |
  |-- GET /candidate/{id} ---------------->|             |          |
  |<-- evaluation + summary + transcript ---|             |          |
  |                                         |             |          |
  |-- POST /decision (APPROVED) ---------->|             |          |
  |                              UPDATE eval|-- /audit -->|          |
  |                              MongoDB    |             |-- INSERT  |
  |<-- decision confirmed ------------------|             |          |
```

---

### Flow 4 — Campaign Setup (Operator)

```
Operator     SVC-07         SVC-06       SVC-04        Pinecone   S3    MongoDB
  |         dashboard         auth       campaign
  |                             |            |             |        |        |
  |-- login -------------------->|            |             |        |        |
  |<-- JWT ----------------------|            |             |        |        |
  |                                           |             |        |        |
  |-- POST /campaigns ----------------------->|             |        |        |
  |<-- campaign + deep-link code -------------|-- INSERT -> |        |        |
  |                                           |             |        |        |
  |-- POST /knowledge-base/documents -------->|             |        |        |
  |                              |-- PUT ----->|        |-- PUT ---->|        |
  |                              |   (S3)      |        |            |        |
  |                              |-- embed --->|        |            |        |
  |                              |   (Anthropic)        |            |        |
  |                              |-- upsert ----------->|            |        |
  |                              |   (Pinecone)         |            |        |
  |                              |-- UPDATE doc status->|        |-- UPDATE ->|
  |<-- document ACTIVE ----------|             |             |        |        |
```

---

## Circular Dependency Check

No circular dependencies exist:
- telegram-bot calls conversation-lambda (one direction only)
- conversation-lambda calls evaluation-lambda, campaign-lambda, compliance-lambda (one direction; none call back)
- evaluation-lambda calls compliance-lambda (one direction only)
- dashboard calls auth-lambda, evaluation-lambda, campaign-lambda, compliance-lambda (all one direction)
- auth-lambda has no runtime dependencies on other lambdas
- compliance-lambda has no runtime dependencies on other lambdas

---

## External Dependency Summary

| External Service | Used By | Purpose | Failure Impact |
|---|---|---|---|
| Telegram API | SVC-01, SVC-02 | Message delivery | Candidate cannot receive/send messages |
| Anthropic API (Claude) | SVC-02, SVC-03 | LLM inference (screening + evaluation) | AI responses blocked; fallback to scripted messages |
| Anthropic API (Embeddings) | SVC-04 | Document and query embedding for RAG | Document processing halted; RAG search unavailable |
| MongoDB Atlas | SVC-02, SVC-03, SVC-04, SVC-05, SVC-06 | Primary data store | System-wide outage |
| Pinecone | SVC-04 | Vector search for RAG | RAG search unavailable; fallback to scripted out-of-scope response |
| AWS S3 | SVC-04 | Raw document storage | Document upload fails; existing RAG still functional |
| AWS Secrets Manager | All lambdas | Configuration and key management | All services unable to start (fatal) |
| AWS EventBridge | SVC-02, SVC-05 | Scheduled jobs (reengagement, retention) | Re-engagement messages not sent; retention sweep delayed |

---

*End of component-dependency.md*
