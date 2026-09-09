# Unit of Work Plan — EntreVista AI

**Phase**: INCEPTION - Units Generation
**Date**: 2026-06-20
**Status**: Complete

---

## Context Summary

Application Design identified **7 deployable services**:

| Service | Runtime | Purpose |
|---|---|---|
| telegram-bot | Node.js/Telegraf | Telegram protocol gateway |
| conversation-lambda | Python/FastAPI + Claude SDK | Agentic conversation engine |
| evaluation-lambda | Python/FastAPI | Scoring and evaluation engine |
| campaign-lambda | Python/FastAPI + RAG | Campaign, rubric, knowledge base management |
| compliance-lambda | Python/FastAPI | Consent, audit logs, escalation, NPS, data retention |
| auth-lambda | Python/FastAPI | Operator authentication and token management |
| dashboard | React/TypeScript/Vite | Recruiter web interface (CloudFront + S3) |

The Execution Plan anticipated 6 units (telegram-bot, conversation, evaluation, campaign-api, compliance-api, dashboard) but the Application Design introduced auth-lambda as a 7th service. Two questions need answers before generating unit artifacts.

---

## Planning Questions

### Question UOW-01 — auth-lambda as a standalone unit?

The `auth-lambda` is a distinct Python/FastAPI service with its own Lambda deployment, but it is relatively small (4 components, low feature complexity compared to conversation or evaluation). Should it be its own unit of work?

A) **Standalone unit**: auth-lambda is its own Unit 6, with its own Functional Design, NFR, Infrastructure Design, and Code Generation cycle. Clean separation; any auth changes stay isolated.

B) **Bundled with compliance-lambda**: auth-lambda and compliance-lambda are developed together as a single unit ("security-and-compliance"). They share no code, but both are governance/access-control concerns with low individual complexity.

C) **Bundled with campaign-lambda**: auth-lambda and campaign-lambda are developed together as a single unit ("operator-services"). The operator-facing APIs (campaigns, rubrics, KB management) naturally depend on operator auth being ready first.

D) Other (please describe after [Answer]: tag)

[Answer]:A

---

### Question UOW-02 — Code Organization Strategy

This is a Greenfield polyglot project with 2 runtimes (Node.js and Python) and 1 SPA. How should source code be organized in the repository?

A) **Monorepo**: All services in one repository under dedicated top-level directories. Single git history, easier cross-service refactoring, shared tooling.
```
agentic_interviewer_ai/
  telegram-bot/        # Node.js / Telegraf
  conversation-lambda/ # Python / FastAPI
  evaluation-lambda/   # Python / FastAPI
  campaign-lambda/     # Python / FastAPI
  compliance-lambda/   # Python / FastAPI
  auth-lambda/         # Python / FastAPI
  dashboard/           # React / TypeScript
  aidlc-docs/
```

B) **Polyrepo**: Each service in its own git repository. Full isolation; each team/service can version independently. More overhead for local development across services.

C) **Hybrid monorepo — grouped by runtime**: Group by language to share tooling (Python services share pyproject.toml/virtual env; Node.js services share package.json tooling).
```
agentic_interviewer_ai/
  services/
    telegram-bot/      # Node.js
    python-lambdas/    # All Python lambdas as sub-packages
      conversation/
      evaluation/
      campaign/
      compliance/
      auth/
  dashboard/           # React
  aidlc-docs/
```

D) Other (please describe after [Answer]: tag)

[Answer]:B

---

## Generation Steps (execute after approval)

- [x] Generate `aidlc-docs/inception/application-design/unit-of-work.md`
  - [x] Unit definitions (name, service mapping, stories, components, build artifact)
  - [x] Code organization structure (per UOW-02 answer)
  - [x] Development sequence and inter-unit dependencies
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-dependency.md`
  - [x] Unit dependency matrix
  - [x] Dependency rationale per relationship
  - [x] Recommended build/deploy sequence
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-story-map.md`
  - [x] All 34 stories mapped to their unit
  - [x] Coverage verification (no story unassigned)
- [x] Update aidlc-state.md and audit.md

---

*Please answer UOW-01 and UOW-02 above and let me know when done.*
