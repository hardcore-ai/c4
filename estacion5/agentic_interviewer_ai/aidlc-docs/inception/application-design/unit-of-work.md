# Unit of Work — EntreVista AI

**Generated**: 2026-06-20
**Architecture**: Polyglot Multi-Lambda Microservices
**Code Organization**: Polyrepo (each service in its own git repository)
**Total Units**: 7

---

## Code Organization Strategy (Polyrepo)

Each service is an independent git repository. Locally, all repositories are cloned into a shared parent directory for development convenience.

```
~/workspace/SDD/ai-dlc/
  agentic_interviewer_ai/          # Parent workspace directory (docs only)
    aidlc-docs/                    # All AI-DLC documentation

  entrevista-telegram-bot/         # Unit 1 — Node.js/Telegraf
  entrevista-conversation/         # Unit 2 — Python/FastAPI + Claude SDK
  entrevista-evaluation/           # Unit 3 — Python/FastAPI
  entrevista-campaign/             # Unit 4 — Python/FastAPI + RAG
  entrevista-compliance/           # Unit 5 — Python/FastAPI
  entrevista-auth/                 # Unit 6 — Python/FastAPI
  entrevista-dashboard/            # Unit 7 — React/TypeScript
```

**Shared conventions across all repos**:
- All repos use semantic versioning (v0.x.x for pre-launch)
- All Python repos use `pyproject.toml` (uv package manager)
- All repos include a `Makefile` with standard targets: `make install`, `make test`, `make build`, `make deploy`
- All repos include a `.env.example` file documenting required environment variables
- No shared code libraries at MVP — each service copies only what it needs

---

## Recommended Build Sequence

Dependencies determine the build order. Units with no inter-lambda dependencies form **Wave 1** and can be built in parallel. Subsequent waves depend on prior waves completing their API contracts.

```
Wave 1 (parallel):
  Unit 6 — auth-lambda         (no lambda dependencies)
  Unit 5 — compliance-lambda   (no lambda dependencies)
  Unit 4 — campaign-lambda     (no lambda dependencies)

Wave 2 (after Wave 1 complete):
  Unit 3 — evaluation-lambda   (calls compliance-lambda)

Wave 3 (after Wave 2 complete):
  Unit 2 — conversation-lambda (calls evaluation, campaign, compliance)

Wave 4 (after Wave 3 complete):
  Unit 1 — telegram-bot        (calls conversation-lambda)
  Unit 7 — dashboard           (calls all backend lambdas)
```

**Single-team recommended sequence** (risk-first, foundational first):

| Order | Unit | Rationale |
|---|---|---|
| 1 | Unit 6 — auth-lambda | Foundational; smallest unit; blocks all dashboard work |
| 2 | Unit 5 — compliance-lambda | Required by conversation and evaluation; consent + audit infrastructure |
| 3 | Unit 4 — campaign-lambda | Required by conversation; campaigns + rubrics + RAG |
| 4 | Unit 3 — evaluation-lambda | Required by conversation; scoring logic |
| 5 | Unit 2 — conversation-lambda | Highest complexity; core agentic engine; depends on 5,4,3 |
| 6 | Unit 1 — telegram-bot | Thin gateway; depends on conversation-lambda being ready |
| 7 | Unit 7 — dashboard | SPA; depends on all backend APIs being stable |

---

## Unit Definitions

---

### Unit 1 — telegram-bot

**Repository**: `entrevista-telegram-bot`
**Runtime**: Node.js 20 / Telegraf 4.x
**Deployment**: AWS Lambda (arm64) + API Gateway HTTP

**Purpose**: Thin Telegram protocol gateway. Receives Telegram webhooks, routes messages to conversation-lambda, and returns formatted text replies. Contains no business logic.

**Components**:
- TelegramGateway
- SessionRouter
- MessageFormatter

**Primary Stories**:
| Story | Title | Points |
|---|---|---|
| US-01 | Start Screening via Telegram Link | 2 |

**Total Story Points**: 2

**Repository Structure**:
```
entrevista-telegram-bot/
  src/
    handler.ts           # Lambda entry point (Telegraf webhook)
    gateway.ts           # TelegramGateway
    router.ts            # SessionRouter
    formatter.ts         # MessageFormatter
    types.ts             # Shared TypeScript types
  tests/
    unit/
    integration/
  package.json
  tsconfig.json
  Makefile
  .env.example
  README.md
```

**Build Artifact**: Lambda deployment package (zip) — `dist/telegram-bot.zip`

**External Dependencies**: Telegram API, conversation-lambda REST endpoint

---

### Unit 2 — conversation-lambda

**Repository**: `entrevista-conversation`
**Runtime**: Python 3.12 / FastAPI + Mangum + Claude Agent SDK
**Deployment**: AWS Lambda (arm64) + API Gateway HTTP

**Purpose**: Core agentic conversation engine. Manages the multi-turn screening state machine, generates contextual questions via Claude, enforces guardrails, handles re-engagement, and triggers evaluation on completion.

**Components**:
- ConversationRouter (FastAPI App)
- ConversationOrchestrator
- ConsentHandler
- RequirementsHandler
- ScreeningHandler
- GuardrailsFilter
- EscalationNotifier
- ReengagementScheduler

**Primary Stories**:
| Story | Title | Points |
|---|---|---|
| US-02 | Receive AI Identity Disclosure | 1 |
| US-03 | Give Explicit Consent | 2 |
| US-04 | Understand What Happens With My Data | 1 |
| US-05 | Verify Basic Job Requirements | 2 |
| US-06 | Answer Competency Questions in Natural Conversation | 3 |
| US-07 | Receive Contextual Follow-up Questions | 3 |
| US-08 | Agent Declines to Answer Out-of-Scope Questions | 2 |
| US-09 | Request to Speak with a Human | 2 |
| US-10 | Agent Resists Jailbreak Attempts | 2 |
| US-26 | Pause and Resume Screening Session | 2 |
| US-27 | Receive Re-engagement Follow-up | 2 |
| US-29 | Candidate Receives Next Steps Confirmation | 1 |
| US-34 | Support Portuguese for Brazilian Candidates (Should-Have) | 5 |

**Total Story Points**: 28 (23 Must-Have + 5 Should-Have)

**Repository Structure**:
```
entrevista-conversation/
  src/
    handler.py                    # Lambda entry point (Mangum)
    app.py                        # FastAPI application
    router.py                     # ConversationRouter
    orchestrator.py               # ConversationOrchestrator
    handlers/
      consent.py                  # ConsentHandler
      requirements.py             # RequirementsHandler
      screening.py                # ScreeningHandler
    guardrails.py                 # GuardrailsFilter
    escalation.py                 # EscalationNotifier
    reengagement.py               # ReengagementScheduler
    clients/
      evaluation_client.py        # HTTP client for evaluation-lambda
      campaign_client.py          # HTTP client for campaign-lambda
      compliance_client.py        # HTTP client for compliance-lambda
    models/
      session.py
      message.py
      campaign.py
    db/
      mongo.py                    # MongoDB connection
  tests/
    unit/
    integration/
  pyproject.toml
  Makefile
  .env.example
  README.md
```

**Build Artifact**: Lambda deployment package (zip) — `dist/conversation.zip`

**External Dependencies**: MongoDB Atlas, Anthropic API (Claude), evaluation-lambda, campaign-lambda, compliance-lambda, Telegram API (reengagement scheduler only)

---

### Unit 3 — evaluation-lambda

**Repository**: `entrevista-evaluation`
**Runtime**: Python 3.12 / FastAPI + Mangum
**Deployment**: AWS Lambda (arm64) + API Gateway HTTP

**Purpose**: Scores completed screening sessions against campaign rubrics using Claude. Generates executive summaries with verbatim citations. Tracks human-AI disagreements.

**Components**:
- EvaluationRouter (FastAPI App)
- EvaluationEngine
- SummaryGenerator
- DisagreementTracker

**Primary Stories**:
| Story | Title | Points |
|---|---|---|
| US-11 | System Evaluates Responses in Real Time | 3 |
| US-12 | View Executive Summary With Citations | 3 |
| US-14 | Record Human Disagreement With AI Score | 2 |
| US-31 | View AI Evaluator Consistency Metrics (Should-Have) | 3 |
| US-32 | Flag Suspicious Response Patterns (Should-Have) | 3 |

**Total Story Points**: 14 (8 Must-Have + 6 Should-Have)

**Repository Structure**:
```
entrevista-evaluation/
  src/
    handler.py
    app.py
    router.py                     # EvaluationRouter
    engine.py                     # EvaluationEngine
    summary.py                    # SummaryGenerator
    disagreement.py               # DisagreementTracker
    clients/
      compliance_client.py
    models/
      evaluation.py
      rubric.py
    db/
      mongo.py
  tests/
    unit/
    integration/
  pyproject.toml
  Makefile
  .env.example
  README.md
```

**Build Artifact**: Lambda deployment package (zip) — `dist/evaluation.zip`

**External Dependencies**: MongoDB Atlas, Anthropic API (Claude), compliance-lambda

---

### Unit 4 — campaign-lambda

**Repository**: `entrevista-campaign`
**Runtime**: Python 3.12 / FastAPI + Mangum
**Deployment**: AWS Lambda (arm64) + API Gateway HTTP

**Purpose**: CRUD for campaigns and rubrics. Document upload, chunking, embedding, and Pinecone upsert pipeline. RAG search endpoint. Escalated questions tracking.

**Components**:
- CampaignRouter (FastAPI App)
- CampaignManager
- RubricManager
- KnowledgeBaseManager
- RAGService
- EscalatedQuestionsTracker

**Primary Stories**:
| Story | Title | Points |
|---|---|---|
| US-13 | Configure Rubrics by Role | 3 |
| US-19 | Create a Screening Campaign | 3 |
| US-20 | Generate and Share Telegram Campaign Link | 1 |
| US-21 | Upload Documents to Campaign Knowledge Base | 3 |
| US-22 | Monitor Escalated Questions to Improve Knowledge Base | 2 |

**Total Story Points**: 12 (all Must-Have)

**Repository Structure**:
```
entrevista-campaign/
  src/
    handler.py
    app.py
    router.py                     # CampaignRouter
    campaign.py                   # CampaignManager
    rubric.py                     # RubricManager
    knowledge_base.py             # KnowledgeBaseManager
    rag.py                        # RAGService
    escalated_questions.py        # EscalatedQuestionsTracker
    models/
      campaign.py
      rubric.py
      document.py
    db/
      mongo.py
      s3.py
      pinecone.py
  tests/
    unit/
    integration/
  pyproject.toml
  Makefile
  .env.example
  README.md
```

**Build Artifact**: Lambda deployment package (zip) — `dist/campaign.zip`

**External Dependencies**: MongoDB Atlas, AWS S3, Pinecone, Anthropic API (embeddings)

---

### Unit 5 — compliance-lambda

**Repository**: `entrevista-compliance`
**Runtime**: Python 3.12 / FastAPI + Mangum
**Deployment**: AWS Lambda (arm64) + API Gateway HTTP + EventBridge (scheduled job)

**Purpose**: Write-once consent recording, immutable audit log, escalation alerts, NPS collection, and scheduled data retention enforcement.

**Components**:
- ComplianceRouter (FastAPI App)
- ConsentManager
- AuditLogger
- EscalationAlertManager
- NPSCollector
- DataRetentionManager

**Primary Stories**:
| Story | Title | Points |
|---|---|---|
| US-23 | Access Immutable Audit Log | 3 |
| US-24 | Verify 100% Evaluation Traceability | 2 |
| US-25 | Track Candidate NPS and Experience Quality | 2 |
| US-30 | Export Compliance Report as PDF (Should-Have) | 3 |
| US-33 | Configure Data Retention Period (Should-Have) | 2 |

**Total Story Points**: 12 (7 Must-Have + 5 Should-Have)

**Repository Structure**:
```
entrevista-compliance/
  src/
    handler.py
    app.py
    router.py                     # ComplianceRouter
    consent.py                    # ConsentManager
    audit.py                      # AuditLogger
    escalation.py                 # EscalationAlertManager
    nps.py                        # NPSCollector
    retention.py                  # DataRetentionManager
    scheduled_handler.py          # EventBridge entry point for retention sweep
    models/
      consent.py
      audit_event.py
      escalation.py
    db/
      mongo.py
  tests/
    unit/
    integration/
  pyproject.toml
  Makefile
  .env.example
  README.md
```

**Build Artifact**: Lambda deployment package (zip) — `dist/compliance.zip`

**External Dependencies**: MongoDB Atlas

---

### Unit 6 — auth-lambda

**Repository**: `entrevista-auth`
**Runtime**: Python 3.12 / FastAPI + Mangum
**Deployment**: AWS Lambda (arm64) + API Gateway HTTP

**Purpose**: Operator authentication with email/password, JWT issuance (RS256), refresh token management, brute-force protection, and operator account management.

**Components**:
- AuthRouter (FastAPI App)
- AuthService
- TokenManager
- BruteForceProtector
- OperatorManager

**Primary Stories**:
| Story | Title | Points |
|---|---|---|
| US-18 | Authenticate Into Dashboard | 2 |

**Total Story Points**: 2 (all Must-Have)

**Repository Structure**:
```
entrevista-auth/
  src/
    handler.py
    app.py
    router.py                     # AuthRouter
    auth_service.py               # AuthService
    token.py                      # TokenManager
    brute_force.py                # BruteForceProtector
    operator.py                   # OperatorManager
    models/
      operator.py
      token.py
    db/
      mongo.py
  tests/
    unit/
    integration/
  pyproject.toml
  Makefile
  .env.example
  README.md
```

**Build Artifact**: Lambda deployment package (zip) — `dist/auth.zip`

**External Dependencies**: MongoDB Atlas, AWS Secrets Manager (RS256 keys)

---

### Unit 7 — dashboard

**Repository**: `entrevista-dashboard`
**Runtime**: React 18 / TypeScript / Vite
**Deployment**: AWS CloudFront + S3 (static SPA)

**Purpose**: Recruiter web interface — review queue, candidate detail with HITL decisions, campaign management, knowledge base management, analytics, and NPS dashboard.

**Components**:
- AuthController
- ReviewQueueView
- CandidateDetailView
- CampaignManagerView
- KnowledgeBaseManagerView
- AnalyticsDashboard
- APIClient

**Primary Stories**:
| Story | Title | Points |
|---|---|---|
| US-15 | View and Filter the Review Queue | 2 |
| US-16 | Review Candidate Detail and Make Decision | 2 |
| US-17 | Monitor Campaign Analytics | 3 |
| US-28 | View Abandonment Analytics | 2 |

**Total Story Points**: 9 (all Must-Have)

**Note**: Dashboard also provides the UI layer for stories primarily owned by other units:
- Campaign creation UI for US-19, US-20 (Unit 4 owns the API)
- Rubric editor UI for US-13 (Unit 4 owns the API)
- Knowledge base upload UI for US-21, US-22 (Unit 4 owns the API)
- Executive summary display for US-12 (Unit 3 owns the generation)
- Human decision controls for US-16 (Unit 3 owns the decision API)
- Compliance report UI for US-30 (Unit 5 owns the generation)

**Repository Structure**:
```
entrevista-dashboard/
  src/
    main.tsx
    App.tsx
    auth/
      AuthController.ts
    views/
      ReviewQueueView.tsx
      CandidateDetailView.tsx
      CampaignManagerView.tsx
      KnowledgeBaseManagerView.tsx
      AnalyticsDashboard.tsx
    api/
      APIClient.ts
      endpoints/
        auth.ts
        campaigns.ts
        evaluations.ts
        compliance.ts
    components/              # Shared UI components
    types/                   # TypeScript type definitions
    hooks/                   # React custom hooks
  tests/
    unit/
    e2e/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  Makefile
  .env.example
  README.md
```

**Build Artifact**: Static files — `dist/` (uploaded to S3)

**External Dependencies**: auth-lambda, evaluation-lambda, campaign-lambda, compliance-lambda

---

## Story Points Summary

| Unit | Must-Have SP | Should-Have SP | Total SP |
|---|---|---|---|
| Unit 1 — telegram-bot | 2 | 0 | 2 |
| Unit 2 — conversation-lambda | 23 | 5 | 28 |
| Unit 3 — evaluation-lambda | 8 | 6 | 14 |
| Unit 4 — campaign-lambda | 12 | 0 | 12 |
| Unit 5 — compliance-lambda | 7 | 5 | 12 |
| Unit 6 — auth-lambda | 2 | 0 | 2 |
| Unit 7 — dashboard | 9 | 0 | 9 |
| **Total** | **63** | **16** | **79** |

---

*End of unit-of-work.md*
