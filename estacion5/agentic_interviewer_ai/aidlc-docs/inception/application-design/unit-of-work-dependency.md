# Unit of Work Dependency — EntreVista AI

**Generated**: 2026-06-20
**Architecture**: Polyglot Multi-Lambda Microservices
**Code Organization**: Polyrepo

---

## Unit Dependency Matrix

Each cell describes the dependency from the **row** unit to the **column** unit.

Legend:
- `REST` — Runtime REST API call (blocking dependency)
- `REST(A)` — Runtime REST API call (async — caller does not wait)
- `CONTRACT` — API contract dependency (other unit's API must be stable before this unit's integration tests can pass)
- `—` — No dependency

| From \ To | U1<br>telegram-bot | U2<br>conversation | U3<br>evaluation | U4<br>campaign | U5<br>compliance | U6<br>auth | U7<br>dashboard |
|---|---|---|---|---|---|---|---|
| **U1** telegram-bot | — | REST | — | — | — | — | — |
| **U2** conversation | — | — | REST(A) | REST | REST | — | — |
| **U3** evaluation | — | — | — | — | REST | — | — |
| **U4** campaign | — | — | — | — | — | — | — |
| **U5** compliance | — | — | — | — | — | — | — |
| **U6** auth | — | — | — | — | — | — | — |
| **U7** dashboard | — | — | REST | REST | REST | REST | — |

---

## Dependency Rationale

| From | To | Type | Rationale |
|---|---|---|---|
| U1 → U2 | telegram-bot → conversation | REST | telegram-bot delegates all message processing to conversation-lambda; cannot function without it |
| U2 → U3 | conversation → evaluation | REST(A) | conversation-lambda triggers evaluation on screening completion; async — candidate reply is not blocked |
| U2 → U4 | conversation → campaign | REST | conversation-lambda calls campaign-lambda for RAG search and reads campaign config |
| U2 → U5 | conversation → compliance | REST | conversation-lambda records consent and writes audit events on every significant action |
| U3 → U5 | evaluation → compliance | REST | evaluation-lambda writes SCORE_COMPUTED audit event on every evaluation completion |
| U7 → U3 | dashboard → evaluation | REST | dashboard GETs evaluation results; POSTs human decisions and score disagreements |
| U7 → U4 | dashboard → campaign | REST | dashboard performs all campaign/rubric/knowledge-base CRUD operations |
| U7 → U5 | dashboard → compliance | REST | dashboard queries audit log, escalation alerts, and NPS aggregate data |
| U7 → U6 | dashboard → auth | REST | dashboard performs operator login/logout/refresh via auth-lambda |

---

## Build Sequence (Single Team)

Based on the dependency graph, units with no upstream dependencies must be built first.

```
+------------------------------------------+
|             INCEPTION PHASE               |
+------------------------------------------+
|  Unit 6 — auth-lambda     [WAVE 1]        |
|  Unit 5 — compliance-lambda [WAVE 1]      |
|  Unit 4 — campaign-lambda  [WAVE 1]       |
|  Unit 3 — evaluation-lambda [WAVE 2]      |
|  Unit 2 — conversation-lambda [WAVE 3]    |
|  Unit 1 — telegram-bot     [WAVE 4]       |
|  Unit 7 — dashboard         [WAVE 4]      |
+------------------------------------------+

Wave 1 (no inter-lambda dependencies):
  Unit 6, Unit 5, Unit 4  [can be developed in parallel]

Wave 2 (depends on Wave 1 API contracts being stable):
  Unit 3  [calls compliance-lambda; needs CONTRACT dependency satisfied]

Wave 3 (depends on Wave 1 + Wave 2):
  Unit 2  [calls evaluation, campaign, compliance]

Wave 4 (depends on Wave 3):
  Unit 1  [calls conversation-lambda]
  Unit 7  [calls all backend lambdas — needs all API contracts stable]
```

**Single-team linear build order (risk-first)**:

| Step | Unit | Why This Order |
|---|---|---|
| 1 | **Unit 6** — auth-lambda | Smallest unit; no dependencies; foundational for all dashboard auth work |
| 2 | **Unit 5** — compliance-lambda | No dependencies; required by Units 2 and 3; establishes consent/audit foundation |
| 3 | **Unit 4** — campaign-lambda | No dependencies; required by Unit 2; establishes campaign/rubric/RAG foundation |
| 4 | **Unit 3** — evaluation-lambda | Depends on Unit 5 (compliance REST call); establishes scoring before conversation integration |
| 5 | **Unit 2** — conversation-lambda | Highest complexity; depends on Units 3, 4, 5; core of the product |
| 6 | **Unit 1** — telegram-bot | Thin gateway; depends only on Unit 2 being ready |
| 7 | **Unit 7** — dashboard | SPA; depends on all backend API contracts being stable |

---

## Integration Checkpoints

Key points where units must be validated together before proceeding:

| Checkpoint | Units | What to Verify |
|---|---|---|
| CP-01 | U6 + U7 | Operator login flow end-to-end; JWT issued and validated |
| CP-02 | U5 + U2 | Consent recording: conversation triggers compliance write; consent readable back |
| CP-03 | U4 + U2 | RAG search: conversation calls campaign search endpoint and receives chunks |
| CP-04 | U3 + U2 | Evaluation trigger: conversation completes screening, evaluation-lambda receives session_id and scores it |
| CP-05 | U3 + U5 | Audit event: evaluation writes SCORE_COMPUTED event to compliance |
| CP-06 | U2 + U1 | Full candidate message flow: Telegram → telegram-bot → conversation → MongoDB → reply back |
| CP-07 | ALL | Full happy-path end-to-end: candidate sends /start → screens → evaluation → dashboard shows result |

---

## Critical Path

The critical path (longest dependency chain) determines the minimum total development time:

```
U6 (auth) → [parallel with U5, U4]
U5 (compliance) → U3 (evaluation) → U2 (conversation) → U1 (telegram-bot)
```

**Critical path length**: 4 sequential steps (U5 → U3 → U2 → U1)

The dashboard (U7) can begin development at any point but cannot complete integration testing until all backend units (U6, U5, U4, U3) are stable.

---

## Deployment Order

For production deployment, unit deployment order must respect runtime dependencies:

| Deploy Order | Unit | Reason |
|---|---|---|
| 1 | Unit 6 — auth-lambda | No runtime dependencies; deploy first |
| 2 | Unit 5 — compliance-lambda | No runtime dependencies; needed by Units 2 and 3 |
| 3 | Unit 4 — campaign-lambda | No runtime dependencies; needed by Unit 2 |
| 4 | Unit 3 — evaluation-lambda | Calls compliance-lambda (must be deployed) |
| 5 | Unit 2 — conversation-lambda | Calls evaluation, campaign, compliance (must be deployed) |
| 6 | Unit 1 — telegram-bot | Calls conversation-lambda (must be deployed); register Telegram webhook last |
| 7 | Unit 7 — dashboard | Upload to S3/CloudFront after all backend URLs are confirmed |

---

*End of unit-of-work-dependency.md*
