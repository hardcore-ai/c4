# Unit of Work Story Map — EntreVista AI

**Generated**: 2026-06-20
**Total Stories**: 34 (29 Must-Have + 5 Should-Have)
**Total Units**: 7
**Coverage**: 100% of stories assigned

---

## Story-to-Unit Mapping

| Story | Title | Epic | Priority | SP | Unit | Service |
|---|---|---|---|---|---|---|
| US-01 | Start Screening via Telegram Link | EPIC-01 | Must | 2 | Unit 1 | telegram-bot |
| US-02 | Receive AI Identity Disclosure | EPIC-01 | Must | 1 | Unit 2 | conversation-lambda |
| US-03 | Give Explicit Consent | EPIC-01 | Must | 2 | Unit 2 | conversation-lambda |
| US-04 | Understand What Happens With My Data | EPIC-01 | Must | 1 | Unit 2 | conversation-lambda |
| US-05 | Verify Basic Job Requirements | EPIC-02 | Must | 2 | Unit 2 | conversation-lambda |
| US-06 | Answer Competency Questions in Natural Conversation | EPIC-02 | Must | 3 | Unit 2 | conversation-lambda |
| US-07 | Receive Contextual Follow-up Questions | EPIC-02 | Must | 3 | Unit 2 | conversation-lambda |
| US-08 | Agent Declines to Answer Out-of-Scope Questions | EPIC-02 | Must | 2 | Unit 2 | conversation-lambda |
| US-09 | Request to Speak with a Human | EPIC-02 | Must | 2 | Unit 2 | conversation-lambda |
| US-10 | Agent Resists Jailbreak Attempts | EPIC-02 | Must | 2 | Unit 2 | conversation-lambda |
| US-11 | System Evaluates Responses in Real Time | EPIC-03 | Must | 3 | Unit 3 | evaluation-lambda |
| US-12 | View Executive Summary With Citations | EPIC-03 | Must | 3 | Unit 3 | evaluation-lambda |
| US-13 | Configure Rubrics by Role | EPIC-03 | Must | 3 | Unit 4 | campaign-lambda |
| US-14 | Record Human Disagreement With AI Score | EPIC-03 | Must | 2 | Unit 3 | evaluation-lambda |
| US-15 | View and Filter the Review Queue | EPIC-04 | Must | 2 | Unit 7 | dashboard |
| US-16 | Review Candidate Detail and Make Decision | EPIC-04 | Must | 2 | Unit 7 | dashboard |
| US-17 | Monitor Campaign Analytics | EPIC-04 | Must | 3 | Unit 7 | dashboard |
| US-18 | Authenticate Into Dashboard | EPIC-04 | Must | 2 | Unit 6 | auth-lambda |
| US-19 | Create a Screening Campaign | EPIC-05 | Must | 3 | Unit 4 | campaign-lambda |
| US-20 | Generate and Share Telegram Campaign Link | EPIC-05 | Must | 1 | Unit 4 | campaign-lambda |
| US-21 | Upload Documents to Campaign Knowledge Base | EPIC-05 | Must | 3 | Unit 4 | campaign-lambda |
| US-22 | Monitor Escalated Questions to Improve Knowledge Base | EPIC-05 | Must | 2 | Unit 4 | campaign-lambda |
| US-23 | Access Immutable Audit Log | EPIC-06 | Must | 3 | Unit 5 | compliance-lambda |
| US-24 | Verify 100% Evaluation Traceability | EPIC-06 | Must | 2 | Unit 5 | compliance-lambda |
| US-25 | Track Candidate NPS and Experience Quality | EPIC-06 | Must | 2 | Unit 5 | compliance-lambda |
| US-26 | Pause and Resume Screening Session | EPIC-07 | Must | 2 | Unit 2 | conversation-lambda |
| US-27 | Receive Re-engagement Follow-up | EPIC-07 | Must | 2 | Unit 2 | conversation-lambda |
| US-28 | View Abandonment Analytics | EPIC-07 | Must | 2 | Unit 7 | dashboard |
| US-29 | Candidate Receives Next Steps Confirmation | EPIC-07 | Must | 1 | Unit 2 | conversation-lambda |
| US-30 | Export Compliance Report as PDF | EPIC-06 | Should | 3 | Unit 5 | compliance-lambda |
| US-31 | View AI Evaluator Consistency Metrics | EPIC-03 | Should | 3 | Unit 3 | evaluation-lambda |
| US-32 | Flag Suspicious Response Patterns | EPIC-07 | Should | 3 | Unit 3 | evaluation-lambda |
| US-33 | Configure Data Retention Period | EPIC-06 | Should | 2 | Unit 5 | compliance-lambda |
| US-34 | Support Portuguese for Brazilian Candidates | EPIC-02 | Should | 5 | Unit 2 | conversation-lambda |

---

## Stories Per Unit

### Unit 1 — telegram-bot (1 story, 2 SP)

| Story | Title | Priority | SP |
|---|---|---|---|
| US-01 | Start Screening via Telegram Link | Must | 2 |

---

### Unit 2 — conversation-lambda (13 stories, 28 SP)

| Story | Title | Priority | SP |
|---|---|---|---|
| US-02 | Receive AI Identity Disclosure | Must | 1 |
| US-03 | Give Explicit Consent | Must | 2 |
| US-04 | Understand What Happens With My Data | Must | 1 |
| US-05 | Verify Basic Job Requirements | Must | 2 |
| US-06 | Answer Competency Questions in Natural Conversation | Must | 3 |
| US-07 | Receive Contextual Follow-up Questions | Must | 3 |
| US-08 | Agent Declines to Answer Out-of-Scope Questions | Must | 2 |
| US-09 | Request to Speak with a Human | Must | 2 |
| US-10 | Agent Resists Jailbreak Attempts | Must | 2 |
| US-26 | Pause and Resume Screening Session | Must | 2 |
| US-27 | Receive Re-engagement Follow-up | Must | 2 |
| US-29 | Candidate Receives Next Steps Confirmation | Must | 1 |
| US-34 | Support Portuguese for Brazilian Candidates | Should | 5 |

---

### Unit 3 — evaluation-lambda (5 stories, 14 SP)

| Story | Title | Priority | SP |
|---|---|---|---|
| US-11 | System Evaluates Responses in Real Time | Must | 3 |
| US-12 | View Executive Summary With Citations | Must | 3 |
| US-14 | Record Human Disagreement With AI Score | Must | 2 |
| US-31 | View AI Evaluator Consistency Metrics | Should | 3 |
| US-32 | Flag Suspicious Response Patterns | Should | 3 |

---

### Unit 4 — campaign-lambda (5 stories, 12 SP)

| Story | Title | Priority | SP |
|---|---|---|---|
| US-13 | Configure Rubrics by Role | Must | 3 |
| US-19 | Create a Screening Campaign | Must | 3 |
| US-20 | Generate and Share Telegram Campaign Link | Must | 1 |
| US-21 | Upload Documents to Campaign Knowledge Base | Must | 3 |
| US-22 | Monitor Escalated Questions to Improve Knowledge Base | Must | 2 |

---

### Unit 5 — compliance-lambda (5 stories, 12 SP)

| Story | Title | Priority | SP |
|---|---|---|---|
| US-23 | Access Immutable Audit Log | Must | 3 |
| US-24 | Verify 100% Evaluation Traceability | Must | 2 |
| US-25 | Track Candidate NPS and Experience Quality | Must | 2 |
| US-30 | Export Compliance Report as PDF | Should | 3 |
| US-33 | Configure Data Retention Period | Should | 2 |

---

### Unit 6 — auth-lambda (1 story, 2 SP)

| Story | Title | Priority | SP |
|---|---|---|---|
| US-18 | Authenticate Into Dashboard | Must | 2 |

---

### Unit 7 — dashboard (4 stories, 9 SP)

| Story | Title | Priority | SP |
|---|---|---|---|
| US-15 | View and Filter the Review Queue | Must | 2 |
| US-16 | Review Candidate Detail and Make Decision | Must | 2 |
| US-17 | Monitor Campaign Analytics | Must | 3 |
| US-28 | View Abandonment Analytics | Must | 2 |

---

## Coverage Verification

| Metric | Count |
|---|---|
| Total stories | 34 |
| Stories assigned | 34 |
| Unassigned stories | 0 |
| Must-Have stories | 29 |
| Should-Have stories | 5 |
| Units with at least 1 story | 7 / 7 |

**Coverage: 100% — all 34 stories assigned to exactly one unit.**

---

## Cross-Unit Story Notes

Some stories have implementation that spans multiple units. The story is assigned to the unit that owns the **core business logic**, while the other unit provides the **UI or infrastructure layer**:

| Story | Primary Unit | Secondary Unit | Note |
|---|---|---|---|
| US-03 | Unit 2 (conversation) | Unit 5 (compliance) | Consent parsing in Unit 2; immutable recording in Unit 5 |
| US-09 | Unit 2 (conversation) | Unit 5 (compliance) | Escalation trigger in Unit 2; alert creation in Unit 5 |
| US-12 | Unit 3 (evaluation) | Unit 7 (dashboard) | Summary generation in Unit 3; display UI in Unit 7 |
| US-13 | Unit 4 (campaign) | Unit 7 (dashboard) | Rubric CRUD and validation in Unit 4; editor UI in Unit 7 |
| US-19 | Unit 4 (campaign) | Unit 7 (dashboard) | Campaign CRUD in Unit 4; creation form in Unit 7 |
| US-21 | Unit 4 (campaign) | Unit 7 (dashboard) | Processing pipeline in Unit 4; upload UI in Unit 7 |
| US-23 | Unit 5 (compliance) | Unit 7 (dashboard) | Audit write/query in Unit 5; audit view in Unit 7 |
| US-25 | Unit 5 (compliance) | Unit 7 (dashboard) | NPS collection in Unit 5; NPS chart in Unit 7 |

---

*End of unit-of-work-story-map.md*
