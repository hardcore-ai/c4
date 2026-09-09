# Application Design Plan — EntreVista AI

**Phase**: INCEPTION - Application Design
**Date**: 2026-06-20
**Status**: Complete

---

## Context Summary

Based on requirements and user stories, the system comprises 3 services:
- **telegram-bot**: Node.js/Telegraf — thin Telegram gateway
- **ai-backend**: Python/FastAPI + Claude Agent SDK — AI logic, data, APIs
- **dashboard**: React/TypeScript — recruiter web interface

Two key architectural decisions require input before generating the design artifacts.

---

## Design Questions

### Question AD-01 — ai-backend Internal Structure

The `ai-backend` Python service has multiple domain areas (conversation, evaluation, campaign management, compliance, auth). How should it be structured?

A) **Modular monolith**: One FastAPI application with domain-separated routers (e.g., `/api/v1/conversation`, `/api/v1/campaigns`, `/api/v1/evaluation`). Single Lambda deployment unit. Simpler to develop and deploy for MVP.

B) **Multi-Lambda microservices**: Each domain area is an independent Python Lambda function with its own FastAPI app and deployment. Full isolation, independent scaling per domain. More operational complexity.

C) **Hybrid**: One FastAPI monolith for MVP (Option A), with a module structure that makes it easy to extract individual domains into separate Lambdas later if needed.

D) Other (please describe after [Answer]: tag)

[Answer]:B

---

### Question AD-02 — Session State Storage

Multi-turn conversations require tracking the current state of each candidate session (which question we're on, partial scores, conversation history). How should hot session state be managed?

A) **MongoDB only**: Full session state in MongoDB. Every message read/writes to MongoDB. Simple, consistent, no additional infrastructure. May be slightly slower under very high concurrency.

B) **MongoDB + Redis**: Conversation state cached in Redis (fast read/write during active session), persisted to MongoDB when session completes or pauses. Faster for active sessions, requires Redis infrastructure.

C) **In-memory within Lambda + MongoDB persistence**: Active conversation held in Lambda memory during the request, full state in MongoDB between requests (Lambda is stateless anyway — each message is a new Lambda invocation). Effectively same as Option A but conceptually different.

D) Other (please describe after [Answer]: tag)

[Answer]:A

---

## Generation Steps (execute after answers received)

- [x] Generate `aidlc-docs/inception/application-design/components.md`
  - [x] Service 1: telegram-bot components
  - [x] Service 2: ai-backend components (7 domains)
  - [x] Service 3: dashboard components
- [x] Generate `aidlc-docs/inception/application-design/component-methods.md`
  - [x] Method signatures per component with input/output types
- [x] Generate `aidlc-docs/inception/application-design/services.md`
  - [x] Service definitions and orchestration patterns
  - [x] Inter-service communication contracts
- [x] Generate `aidlc-docs/inception/application-design/component-dependency.md`
  - [x] Dependency matrix
  - [x] Data flow diagram (text-based)
- [x] Update aidlc-state.md and audit.md

---

*Please answer AD-01 and AD-02 above and let me know when done.*
