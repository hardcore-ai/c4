# AIDLC State — SkillWall Live

## Project Info
- **Type**: Greenfield (multi-unit)
- **Workspace Root**: la raíz de este repositorio (directorio que contiene `aidlc-docs/`)
- **Units**: infra, backend, frontend
- **Cohort**: cohorte4 (fresh CONSTRUCTION restart)

## Current Status
- **Active Phase**: CONSTRUCTION
- **Active Unit**: Ready to start (infra first)
- **Active Stage**: Awaiting code generation initiation

## Phase Progress

### INCEPTION ✅ COMPLETE
- [x] Workspace Detection
- [x] Requirements Analysis
- [x] User Stories
- [x] Workflow Planning
- [x] Application Design
- [x] Units Generation

**Reference**: All INCEPTION artifacts in `aidlc-docs/inception/`

### CONSTRUCTION 🔄 RESET FOR FRESH START

#### Unit: infra
- [ ] Functional Design (reference: aidlc-docs/construction/infra/functional-design/)
- [ ] Infrastructure Design (reference: aidlc-docs/construction/infra/infrastructure-design/)
- [ ] Code Generation
  - [ ] Part 1 — Planning
  - [ ] Part 2 — Generation
- [ ] Validation & Deployment

#### Unit: backend
- [ ] Functional Design (reference: aidlc-docs/construction/backend/functional-design/)
- [ ] Infrastructure Design (reference: aidlc-docs/construction/backend/infrastructure-design/)
- [ ] Code Generation
  - [ ] Part 1 — Planning
  - [ ] Part 2 — Generation
- [ ] Unit Testing
- [ ] Validation & Deployment

#### Unit: frontend
- [ ] Functional Design (reference: aidlc-docs/construction/frontend/functional-design/)
- [ ] Infrastructure Design (reference: aidlc-docs/construction/frontend/infrastructure-design/)
- [ ] Code Generation
  - [ ] Part 1 — Planning
  - [ ] Part 2 — Generation
- [ ] Unit Testing
- [ ] Validation & Deployment

### Build and Test
- [ ] Build Instructions
- [ ] Unit Test Instructions
- [ ] Integration Test Instructions
- [ ] E2E Test Instructions
- [ ] Smoke Test Instructions

---

## Guidelines for This Round

### Code Generation Preparation
- **Reference troubleshooting.md index** before generating each unit
- **Backend critical path**: Issues #1, #2, #3, #7, #8 (already documented ✅)
- **Frontend critical path**: Issues #5, #6, #14, #16, #19 (deployment env vars)
- **Infra critical path**: Issue #21 (cors_origins as list)

### Design References (Do Not Regenerate)
All design artifacts already exist in aidlc-docs/:
- `aidlc-docs/inception/requirements/requirements.md` — Use as-is
- `aidlc-docs/inception/application-design/` — Use as-is
- `aidlc-docs/construction/{unit}/functional-design/` — Reference for code generation
- `aidlc-docs/construction/{unit}/infrastructure-design/` — Reference for code generation

### Execution Order
1. **infra** unit → Code generation → Terraform files in /infra → Deploy to AWS
2. **backend** unit → Code generation → Lambda files in /backend → Deploy to AWS
3. **frontend** unit → Code generation → Next.js files in /frontend → Deploy to Vercel
4. **Build & Test** → Execute all test suites end-to-end

---

