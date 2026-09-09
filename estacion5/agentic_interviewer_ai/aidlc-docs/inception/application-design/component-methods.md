# Component Methods — EntreVista AI

**Generated**: 2026-06-20
**Architecture**: Polyglot Multi-Lambda Microservices
**Notation**: TypeScript-style signatures for Node.js; Python-style for Python services

---

## Service 1: telegram-bot (Node.js / Telegraf)

### TelegramGateway

```typescript
// Registers Telegraf middleware and webhook handler
setupWebhook(bot: Telegraf, secretToken: string): void

// Processes a single Telegram Update and returns the bot reply
handleUpdate(update: TelegramUpdate): Promise<void>

// Sends a text reply to a Telegram chat
sendMessage(chatId: string, text: string, parseMode?: 'HTML' | 'Markdown'): Promise<void>

// Verifies the webhook secret token from Telegram header
verifyWebhookSecret(header: string, expected: string): boolean
```

---

### SessionRouter

```typescript
// Builds the payload to send to conversation-lambda
buildConversationPayload(
  chatId: string,
  userId: string,
  messageText: string,
  startParam?: string   // deep-link parameter from /start command
): ConversationRequest

// Extracts the campaign code from a /start deep-link parameter
extractCampaignCode(startParam: string): string | null
```

---

### MessageFormatter

```typescript
// Formats a plain-text string into a Telegram sendMessage payload
formatTextReply(text: string, chatId: string): TelegramSendMessagePayload

// Splits a long text into multiple Telegram messages (max 4096 chars each)
splitLongMessage(text: string): string[]

// Creates an inline keyboard for NPS survey (buttons 1–5)
buildNPSKeyboard(sessionId: string): TelegramInlineKeyboard
```

---

## Service 2: conversation-lambda (Python / FastAPI + Claude Agent SDK)

### ConversationRouter

```python
# POST /api/v1/messages
# Validates request, dispatches to orchestrator, returns agent reply
async def handle_message(
    request: MessageRequest,          # { telegram_user_id, message_text, campaign_code? }
    credentials: HTTPAuthCredentials  # shared secret
) -> MessageResponse:                 # { text: str, session_state: str }

# GET /api/v1/health
async def health_check() -> dict
```

---

### ConversationOrchestrator

```python
# Entry point: loads session, dispatches to stage handler, saves state
async def process_message(
    telegram_user_id: str,
    message_text: str,
    campaign_code: str | None
) -> AgentResponse:              # { reply_text: str, new_state: SessionState }

# Loads or creates a candidate session from MongoDB
async def load_or_create_session(
    telegram_user_id_hash: str,
    campaign_id: str | None
) -> Session

# Persists the updated session and appends message event to MongoDB
async def save_session(session: Session, message: MessageEvent) -> None

# Dispatches control to the appropriate stage handler based on session state
def _dispatch_handler(
    session: Session,
    message_text: str
) -> StageHandler
```

---

### ConsentHandler

```python
# Returns the initial onboarding + consent prompt
def generate_consent_prompt(campaign: Campaign) -> str

# Determines if the candidate has given or denied consent
def parse_consent_response(text: str) -> ConsentDecision  # ACCEPTED | DECLINED | AMBIGUOUS

# Records consent event via AuditLogger and transitions session state
async def record_consent(
    session: Session,
    decision: ConsentDecision
) -> SessionState  # REQUIREMENTS_CHECK | CONSENT_DECLINED
```

---

### RequirementsHandler

```python
# Returns the next requirements question to ask the candidate
def get_next_requirements_question(
    session: Session,
    campaign: Campaign
) -> str

# Evaluates candidate answer against the expected requirement criterion
def evaluate_criterion_response(
    question_index: int,
    answer: str,
    criterion: RequirementCriterion
) -> CriterionResult  # PASSED | FAILED | NEEDS_CLARIFICATION

# Transitions session to SCREENING or DISQUALIFIED_REQUIREMENTS
def finalize_requirements(
    session: Session,
    results: list[CriterionResult]
) -> SessionState
```

---

### ScreeningHandler

```python
# Generates the next competency question using Claude
async def generate_next_question(
    session: Session,
    rubric: Rubric,
    conversation_history: list[Message]
) -> str

# Determines if a candidate answer requires a follow-up question
async def needs_followup(
    answer: str,
    competency: Competency,
    conversation_history: list[Message]
) -> bool

# Returns a follow-up question for an incomplete answer
async def generate_followup(
    session: Session,
    answer: str,
    competency: Competency
) -> str

# Signals all competencies are covered; triggers evaluation
async def complete_screening(session: Session) -> None
```

---

### GuardrailsFilter

```python
# Analyzes an incoming message and returns a GuardrailsDecision
def evaluate(
    message_text: str,
    session: Session
) -> GuardrailsDecision  # PASS | OUT_OF_SCOPE | JAILBREAK | ESCALATION_REQUEST

# Returns the scripted response for an out-of-scope question
def get_out_of_scope_response(campaign: Campaign) -> str

# Returns the scripted response for a jailbreak attempt
def get_jailbreak_response() -> str
```

---

### EscalationNotifier

```python
# Posts an escalation alert to compliance-lambda
async def notify_escalation(
    session: Session,
    escalation_type: EscalationType,  # HUMAN_REQUESTED | GUARDRAIL_THRESHOLD
    context: str
) -> None

# Returns the candidate-facing escalation acknowledgment message
def get_candidate_acknowledgment() -> str
```

---

### ReengagementScheduler

```python
# Scheduled handler: queries for inactive sessions and sends follow-up messages
async def run_reengagement_sweep() -> ReengagementResult  # { sent_24h: int, sent_48h: int, abandoned: int }

# Finds sessions inactive for > threshold_hours
async def find_inactive_sessions(threshold_hours: int) -> list[Session]

# Sends reengagement message to a single candidate via Telegram API
async def send_reengagement_message(
    session: Session,
    message_type: ReengagementType  # FOLLOWUP_24H | FOLLOWUP_48H
) -> None

# Marks a session as ABANDONED_NO_RESPONSE after final follow-up ignored
async def mark_abandoned(session: Session) -> None
```

---

## Service 3: evaluation-lambda (Python / FastAPI)

### EvaluationRouter

```python
# POST /api/v1/evaluate
async def handle_evaluation(
    request: EvaluationRequest,       # { session_id, campaign_id, tenant_id }
    credentials: HTTPAuthCredentials
) -> EvaluationResponse               # { evaluation_id, overall_score, recommendation }

# POST /api/v1/evaluate/{evaluation_id}/decision
async def record_human_decision(
    evaluation_id: str,
    request: HumanDecisionRequest,    # { decision: APPROVED|REJECTED, reason?, operator_id }
    token: JWTToken
) -> None

# POST /api/v1/evaluate/{evaluation_id}/disagree
async def record_disagreement(
    evaluation_id: str,
    request: DisagreementRequest,     # { competency_id, ai_score, human_score, operator_id }
    token: JWTToken
) -> None

# GET /api/v1/health
async def health_check() -> dict
```

---

### EvaluationEngine

```python
# Orchestrates end-to-end evaluation for a completed session
async def evaluate_session(
    session_id: str,
    campaign_id: str,
    tenant_id: str
) -> Evaluation

# Scores a single competency: extracts evidence + assigns 1-5 score
async def score_competency(
    competency: Competency,
    conversation_transcript: list[Message],
    rubric_level_descriptors: dict
) -> CompetencyScore  # { competency_id, score: int, citation: str, confidence: float }

# Validates that every score has at least one verbatim citation
def validate_citations(scores: list[CompetencyScore]) -> ValidationResult

# Computes weighted overall score and classification
def compute_overall_score(
    scores: list[CompetencyScore],
    weights: dict[str, float]
) -> OverallScore  # { score: float, classification: HIGHLY_RECOMMENDED|RECOMMENDED|NOT_RECOMMENDED }
```

---

### SummaryGenerator

```python
# Generates the human-readable executive summary for the recruiter
async def generate_summary(
    evaluation: Evaluation,
    campaign: Campaign
) -> ExecutiveSummary  # { overall_text: str, strengths: list[str], risks: list[str], per_competency: list[CompetencySummary] }

# Persists the complete evaluation record (scores + summary) to MongoDB
async def persist_evaluation(
    evaluation: Evaluation,
    summary: ExecutiveSummary
) -> str  # evaluation_id
```

---

### DisagreementTracker

```python
# Records a human evaluator's score disagreement
async def record(
    evaluation_id: str,
    competency_id: str,
    ai_score: int,
    human_score: int,
    operator_id: str,
    tenant_id: str
) -> None

# Returns aggregated disagreement metrics per campaign per competency
async def get_disagreement_metrics(
    campaign_id: str,
    tenant_id: str
) -> list[DisagreementMetric]  # { competency_id, disagreement_rate: float, avg_delta: float, sample_count: int }
```

---

## Service 4: campaign-lambda (Python / FastAPI + RAG)

### CampaignRouter

```python
# POST /api/v1/campaigns
async def create_campaign(request: CreateCampaignRequest, token: JWTToken) -> Campaign

# GET /api/v1/campaigns
async def list_campaigns(tenant_id: str, token: JWTToken) -> list[CampaignSummary]

# GET /api/v1/campaigns/{campaign_id}
async def get_campaign(campaign_id: str, token: JWTToken) -> Campaign

# PATCH /api/v1/campaigns/{campaign_id}
async def update_campaign(campaign_id: str, request: UpdateCampaignRequest, token: JWTToken) -> Campaign

# POST /api/v1/campaigns/{campaign_id}/archive
async def archive_campaign(campaign_id: str, token: JWTToken) -> None

# POST /api/v1/rubrics
async def create_rubric(request: CreateRubricRequest, token: JWTToken) -> Rubric

# GET /api/v1/rubrics/{rubric_id}
async def get_rubric(rubric_id: str, token: JWTToken) -> Rubric

# PUT /api/v1/rubrics/{rubric_id}
async def update_rubric(rubric_id: str, request: UpdateRubricRequest, token: JWTToken) -> Rubric

# POST /api/v1/knowledge-base/documents
async def upload_document(
    campaign_id: str,
    file: UploadFile,
    token: JWTToken
) -> DocumentUploadResponse  # { document_id, status: PROCESSING }

# DELETE /api/v1/knowledge-base/documents/{document_id}
async def delete_document(document_id: str, token: JWTToken) -> None

# GET /api/v1/knowledge-base/escalated-questions
async def get_escalated_questions(campaign_id: str, token: JWTToken) -> list[EscalatedQuestion]

# POST /api/v1/knowledge-base/search  (internal — called by conversation-lambda)
async def search_knowledge_base(
    request: RAGSearchRequest,        # { query, campaign_id, tenant_id }
    credentials: HTTPAuthCredentials
) -> RAGSearchResponse                # { chunks: list[RetrievedChunk] }
```

---

### CampaignManager

```python
# Creates a new campaign and generates its Telegram deep-link code
async def create(
    tenant_id: str,
    name: str,
    role_title: str,
    rubric_id: str,
    requirements: list[Requirement]
) -> Campaign

# Activates a campaign after validating rubric completeness
async def activate(campaign_id: str, tenant_id: str) -> Campaign

# Archives a campaign (soft delete — preserves historical data)
async def archive(campaign_id: str, tenant_id: str) -> None

# Generates a unique Telegram start parameter for the campaign
def _generate_campaign_code() -> str  # e.g. "c_aBcD1234"
```

---

### RubricManager

```python
# Creates a new rubric from scratch or from a built-in template
async def create(
    tenant_id: str,
    competencies: list[Competency],
    template_id: str | None = None
) -> Rubric

# Returns the list of built-in role templates
def get_templates() -> list[RubricTemplate]  # BPO_CUSTOMER_SERVICE | TECH_ENGINEERING | TECH_QA

# Validates rubric: weights sum to 100%, 1–10 competencies
def validate(rubric: Rubric) -> ValidationResult

# Clones a template into a new tenant-owned rubric
async def clone_from_template(template_id: str, tenant_id: str) -> Rubric
```

---

### KnowledgeBaseManager

```python
# Full pipeline: store file in S3, chunk, embed, upsert to Pinecone
async def process_document(
    campaign_id: str,
    tenant_id: str,
    file_content: bytes,
    filename: str,
    content_type: str
) -> Document  # { document_id, status: PROCESSING }

# Chunks document text for embedding
def chunk_text(text: str, chunk_size: int = 512, overlap: int = 64) -> list[str]

# Embeds text chunks using Anthropic embeddings API
async def embed_chunks(chunks: list[str]) -> list[list[float]]

# Removes document from S3 and its vectors from Pinecone
async def delete_document(document_id: str, campaign_id: str, tenant_id: str) -> None

# Updates document processing status in MongoDB
async def update_status(document_id: str, status: DocumentStatus) -> None
```

---

### RAGService

```python
# Main semantic search: embeds query, searches Pinecone, returns top-K chunks
async def search(
    query: str,
    campaign_id: str,
    tenant_id: str,
    top_k: int = 5
) -> list[RetrievedChunk]  # { text: str, score: float, document_id: str, chunk_index: int }

# Embeds a query string using Anthropic embeddings API
async def embed_query(query: str) -> list[float]

# Logs a retrieval event to MongoDB for debugging
async def log_retrieval(
    query: str,
    campaign_id: str,
    retrieved_chunks: list[RetrievedChunk]
) -> None
```

---

### EscalatedQuestionsTracker

```python
# Records a new escalated question or increments its frequency counter
async def record(
    campaign_id: str,
    tenant_id: str,
    question_text: str
) -> EscalatedQuestion

# Returns all escalated questions for a campaign, sorted by frequency
async def list_by_campaign(
    campaign_id: str,
    tenant_id: str
) -> list[EscalatedQuestion]  # { question_id, question_text, frequency_count, last_seen }
```

---

## Service 5: compliance-lambda (Python / FastAPI)

### ComplianceRouter

```python
# POST /api/v1/consent  (internal — called by conversation-lambda)
async def record_consent(
    request: ConsentRequest,
    credentials: HTTPAuthCredentials
) -> ConsentRecord

# GET /api/v1/consent/{session_id}  (internal)
async def get_consent(session_id: str, credentials: HTTPAuthCredentials) -> ConsentRecord

# POST /api/v1/audit/events  (internal)
async def write_audit_event(
    request: AuditEventRequest,
    credentials: HTTPAuthCredentials
) -> AuditEvent

# GET /api/v1/audit/events  (dashboard — JWT protected)
async def query_audit_events(
    session_id: str | None,
    campaign_id: str | None,
    event_type: str | None,
    from_date: datetime | None,
    to_date: datetime | None,
    token: JWTToken
) -> list[AuditEvent]

# POST /api/v1/escalations  (internal)
async def create_escalation(
    request: EscalationRequest,
    credentials: HTTPAuthCredentials
) -> EscalationAlert

# GET /api/v1/escalations  (dashboard — JWT protected)
async def list_escalations(
    campaign_id: str,
    resolved: bool | None,
    token: JWTToken
) -> list[EscalationAlert]

# POST /api/v1/escalations/{alert_id}/resolve  (dashboard — JWT protected)
async def resolve_escalation(alert_id: str, token: JWTToken) -> None

# POST /api/v1/nps  (internal — called by conversation-lambda)
async def submit_nps(request: NPSSubmission, credentials: HTTPAuthCredentials) -> None

# GET /api/v1/nps/aggregate  (dashboard — JWT protected)
async def get_nps_aggregate(campaign_id: str, token: JWTToken) -> NPSAggregate

# GET /api/v1/health
async def health_check() -> dict
```

---

### ConsentManager

```python
# Creates an immutable consent record in MongoDB
async def record(
    session_id: str,
    telegram_user_id_hash: str,
    campaign_id: str,
    tenant_id: str,
    consent_given: bool
) -> ConsentRecord

# Returns the consent record for a session (read-only)
async def get(session_id: str, tenant_id: str) -> ConsentRecord | None
```

---

### AuditLogger

```python
# Appends a single audit event (insert-only, no update/delete)
async def write(
    event_type: AuditEventType,
    actor: str,                  # operator_id or "system" or "candidate_hash"
    session_id: str | None,
    campaign_id: str | None,
    tenant_id: str,
    payload: dict
) -> AuditEvent

# Queries audit events with optional filters
async def query(
    tenant_id: str,
    session_id: str | None = None,
    campaign_id: str | None = None,
    event_type: AuditEventType | None = None,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
    limit: int = 100
) -> list[AuditEvent]
```

---

### EscalationAlertManager

```python
# Creates a new escalation alert
async def create(
    session_id: str,
    candidate_alias: str,
    campaign_id: str,
    tenant_id: str,
    escalation_type: EscalationType,
    context: str
) -> EscalationAlert

# Marks an alert as resolved
async def resolve(alert_id: str, tenant_id: str, resolver_operator_id: str) -> None

# Lists unresolved or all escalation alerts for a campaign
async def list_alerts(
    campaign_id: str,
    tenant_id: str,
    resolved: bool | None = None
) -> list[EscalationAlert]
```

---

### NPSCollector

```python
# Records a candidate NPS submission (one per completed session)
async def submit(
    session_id: str,
    tenant_id: str,
    campaign_id: str,
    score: int,             # 1–5
    comment: str | None
) -> None

# Returns aggregate NPS metrics for a campaign
async def get_aggregate(
    campaign_id: str,
    tenant_id: str
) -> NPSAggregate  # { average: float, distribution: dict[int, int], recent_comments: list[str] }
```

---

### DataRetentionManager

```python
# Scheduled handler: purges expired candidate data across all tenants
async def run_retention_sweep() -> RetentionSweepResult  # { purged_sessions: int, purged_messages: int, errors: int }

# Finds sessions past their retention cutoff date
async def find_expired_sessions(retention_days: int) -> list[str]  # list of session_ids

# Deletes all candidate data for a single session
async def purge_session(session_id: str, tenant_id: str) -> None

# Writes DATA_PURGED audit event after successful purge
async def log_purge(session_id: str, tenant_id: str) -> None
```

---

## Service 6: auth-lambda (Python / FastAPI)

### AuthRouter

```python
# POST /api/v1/auth/login
async def login(request: LoginRequest) -> TokenResponse  # { access_token, refresh_token, expires_in }

# POST /api/v1/auth/refresh
async def refresh_token(request: RefreshRequest) -> TokenResponse

# POST /api/v1/auth/logout
async def logout(request: LogoutRequest, token: JWTToken) -> None

# POST /api/v1/operators  (ADMIN only)
async def create_operator(request: CreateOperatorRequest, token: JWTToken) -> Operator

# GET /api/v1/operators/{operator_id}
async def get_operator(operator_id: str, token: JWTToken) -> Operator

# PATCH /api/v1/operators/{operator_id}
async def update_operator(operator_id: str, request: UpdateOperatorRequest, token: JWTToken) -> Operator

# POST /api/v1/operators/{operator_id}/deactivate  (ADMIN only)
async def deactivate_operator(operator_id: str, token: JWTToken) -> None

# GET /api/v1/health
async def health_check() -> dict
```

---

### AuthService

```python
# Authenticates operator and issues tokens
async def login(email: str, password: str) -> TokenPair  # { access_token, refresh_token }

# Validates a refresh token and issues a new access token
async def refresh(refresh_token: str) -> TokenPair

# Invalidates a refresh token (logout)
async def logout(jti: str, operator_id: str) -> None

# Hashes a plaintext password using argon2id
def hash_password(plaintext: str) -> str

# Verifies a plaintext password against an argon2id hash
def verify_password(plaintext: str, hashed: str) -> bool
```

---

### TokenManager

```python
# Issues a signed JWT access token (RS256, 60-minute TTL)
def issue_access_token(
    operator_id: str,
    tenant_id: str,
    role: OperatorRole
) -> str

# Issues a long-lived refresh token (7-day TTL, stored in MongoDB)
async def issue_refresh_token(operator_id: str) -> str

# Validates a JWT access token (signature + expiry)
def validate_access_token(token: str) -> JWTPayload  # raises on invalid

# Checks if a JWT jti is on the revocation list
async def is_revoked(jti: str) -> bool

# Adds a jti to the revocation list
async def revoke(jti: str, expires_at: datetime) -> None
```

---

### BruteForceProtector

```python
# Records a failed login attempt; raises AccountLockedError if threshold exceeded
async def record_failure(email: str) -> None

# Resets the failure counter on successful login
async def reset(email: str) -> None

# Returns True if the account is currently locked
async def is_locked(email: str) -> bool

# Returns the remaining lockout duration in seconds
async def lockout_remaining(email: str) -> int
```

---

### OperatorManager

```python
# Creates a new operator account within a tenant
async def create(
    tenant_id: str,
    email: str,
    name: str,
    role: OperatorRole,
    created_by_operator_id: str
) -> Operator

# Returns an operator profile by ID (tenant-scoped)
async def get(operator_id: str, tenant_id: str) -> Operator

# Updates an operator's name or role
async def update(
    operator_id: str,
    tenant_id: str,
    updates: dict
) -> Operator

# Deactivates an operator account (soft delete)
async def deactivate(operator_id: str, tenant_id: str) -> None
```

---

## Service 7: dashboard (React / TypeScript / Vite)

### AuthController

```typescript
// Sends login credentials and stores resulting tokens
login(email: string, password: string): Promise<void>

// Clears tokens and redirects to login page
logout(): Promise<void>

// Returns true if the current access token is valid and not expired
isAuthenticated(): boolean

// Returns the decoded JWT payload for the current session
getCurrentUser(): JWTPayload | null

// Proactively refreshes the access token when < 5 minutes from expiry
refreshIfExpiring(): Promise<void>
```

---

### ReviewQueueView

```typescript
// Fetches pending-review candidates for a campaign
fetchQueue(campaignId: string, filters: ReviewFilters): Promise<CandidateSummary[]>

// Sorts the displayed candidate list by a given field
sortBy(field: 'score' | 'date' | 'recommendation'): void

// Navigates to the CandidateDetailView for a candidate
openCandidate(sessionId: string): void
```

---

### CandidateDetailView

```typescript
// Loads the full candidate evaluation and transcript
loadCandidateDetail(sessionId: string): Promise<CandidateDetail>

// Submits the recruiter's Approve or Reject decision
submitDecision(
  sessionId: string,
  decision: 'APPROVED' | 'REJECTED',
  reason?: string
): Promise<void>

// Submits a disagreement with a specific competency score
submitScoreDisagreement(
  evaluationId: string,
  competencyId: string,
  humanScore: number
): Promise<void>
```

---

### CampaignManagerView

```typescript
// Creates a new campaign
createCampaign(data: CreateCampaignForm): Promise<Campaign>

// Activates a draft campaign (generates Telegram deep-link)
activateCampaign(campaignId: string): Promise<Campaign>

// Archives a campaign
archiveCampaign(campaignId: string): Promise<void>

// Copies the Telegram deep-link to the user's clipboard
copyDeepLink(campaignCode: string): void

// Saves rubric edits with live weight-sum validation
saveRubric(rubric: RubricForm): Promise<Rubric>
```

---

### KnowledgeBaseManagerView

```typescript
// Uploads a document file to campaign-lambda
uploadDocument(campaignId: string, file: File): Promise<DocumentUploadResponse>

// Polls document processing status until ACTIVE or FAILED
pollDocumentStatus(documentId: string): Promise<DocumentStatus>

// Deletes a knowledge base document
deleteDocument(documentId: string): Promise<void>

// Loads escalated unanswered questions for a campaign
loadEscalatedQuestions(campaignId: string): Promise<EscalatedQuestion[]>
```

---

### AnalyticsDashboard

```typescript
// Loads campaign-level metrics from the backend
loadMetrics(campaignId: string, dateRange: DateRange): Promise<CampaignMetrics>

// Downloads metrics as a CSV file
exportCSV(campaignId: string, dateRange: DateRange): Promise<void>

// Loads NPS trend data for a campaign
loadNPSTrend(campaignId: string): Promise<NPSTrend>
```

---

### APIClient

```typescript
// Generic authenticated GET request
get<T>(path: string): Promise<T>

// Generic authenticated POST request
post<T>(path: string, body: unknown): Promise<T>

// Generic authenticated PATCH request
patch<T>(path: string, body: unknown): Promise<T>

// Generic authenticated DELETE request
delete(path: string): Promise<void>

// Handles 401 by attempting token refresh; redirects to login if refresh fails
handleUnauthorized(): Promise<void>

// Attaches Authorization: Bearer <token> header to a request config
attachAuthHeader(config: RequestInit): RequestInit
```

---

*End of component-methods.md*
