# Story Generation Plan — EntreVista AI

**Phase**: INCEPTION - User Stories
**Date**: 2026-06-20
**Status**: Awaiting user answers to planning questions

---

## Plan Overview

This plan covers both the methodology decisions (Part 1 - Planning) and the execution steps (Part 2 - Generation) for creating user stories and personas for EntreVista AI.

The PRD provides rich context: 3 buyer personas, 5 user journeys, 10 MVP features (MoSCoW), and 5 system modules. The questions below focus on structural decisions about how to organize and scope the stories.

---

## Part 1: Planning Questions

Please answer each question by filling the letter after `[Answer]:`.

---

### Pregunta P1 — Personas a incluir en historias

El PRD define 3 buyer personas (Director/VP TA, Head of People, Reclutador Operativo) y al Candidato como usuario final del bot. ¿Cuáles deben tener User Stories formales?

A) Los 3 buyer personas + el Candidato (4 personas con stories propias — visión completa del producto)
B) Solo los 3 buyer personas — el Candidato se cubre dentro de las stories de Configuración y Monitoreo del Reclutador
C) Los 3 buyer personas + el Candidato + un 5to persona: Compliance Officer (auditoría y trazabilidad)
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:A

---

### Pregunta P2 — Enfoque de organización de stories

¿Cómo se deben organizar las User Stories?

A) **Epic-Based**: Stories agrupadas en Epics que mapean a los 5 módulos del PRD (Motor Conversacional, Evaluación, Dashboard, Compliance, Candidatos)
B) **User Journey-Based**: Stories siguen el flujo cronológico de cada persona (Descubrimiento → Onboarding → Uso → Evaluación → Decisión)
C) **Feature-Based (MoSCoW)**: Stories organizadas según las 10 features Must-Have del MVP, luego Should Have
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:A

---

### Pregunta P3 — Alcance de las stories

¿Las stories deben cubrir solo el MVP (Día 30 features Must-Have) o incluir el roadmap completo?

A) Solo Must-Have del MVP (M1-M10 del PRD) — enfoque en lo que se construye primero
B) Must-Have + Should-Have — visión más completa para guiar arquitectura desde el inicio
C) Must-Have con notas de Should-Have como "Future Story" placeholders
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:B

---

### Pregunta P4 — Formato de Acceptance Criteria

¿Qué formato se usará para los Acceptance Criteria (AC) de cada story?

A) **Given/When/Then (Gherkin)**: Formato BDD estándar — ideal para QA automatizado
B) **Checklist**: Lista de condiciones que deben cumplirse — más simple y rápido de leer
C) **Narrativo**: Descripción en párrafo de lo que debe ocurrir para considerar la story completa
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:A

---

### Pregunta P5 — Nivel de granularidad

¿Qué nivel de granularidad deben tener las stories?

A) **Granular (1-3 story points estimados)**: Cada feature se divide en múltiples stories específicas que pueden completarse en 1-3 días. Máxima claridad para el equipo de desarrollo.
B) **Medio (3-8 story points)**: Stories que representan un flujo completo de usuario pero no sub-divididas al máximo. Balance entre claridad y velocidad de escritura.
C) **Epics con sub-stories (jerarquía)**: Epic define el objetivo, sub-stories definen pasos específicos. Útil para planning de sprints.
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:A

---

## Part 2: Generation Steps (to execute after approval)

### Step 2.1 — Generate personas.md
- [x] Create `aidlc-docs/inception/user-stories/personas.md`
- [x] Document each approved persona: name, role, goals, pains, how they use EntreVista AI
- [x] Include persona card format: quote, context, key needs, frustrations, success metrics

### Step 2.2 — Generate stories.md (Epics and Stories)
- [x] Create `aidlc-docs/inception/user-stories/stories.md`
- [x] Epic 1: Onboarding and Consent (Candidate-facing) — US-01 to US-04
- [x] Epic 2: Conversational Screening Engine (Candidate-facing) — US-05 to US-10
- [x] Epic 3: Evaluation and Executive Summary (Backend) — US-11 to US-14
- [x] Epic 4: Recruiter Dashboard and HITL Review (Recruiter-facing) — US-15 to US-18
- [x] Epic 5: Campaign and Knowledge Base Management (Operator-facing) — US-19 to US-22
- [x] Epic 6: Compliance and Audit Trail (Compliance-facing) — US-23 to US-25
- [x] Epic 7: Candidate Lifecycle and Re-engagement (Cross-cutting) — US-26 to US-29
- [x] Should-Have stories — US-30 to US-34

### Step 2.3 — Validate INVEST criteria
- [x] Each story is Independent (can be developed separately)
- [x] Each story is Negotiable (not a contract)
- [x] Each story is Valuable (delivers value to a persona)
- [x] Each story is Estimable (clear enough to size)
- [x] Each story is Small (fits within a sprint)
- [x] Each story is Testable (has clear acceptance criteria)

### Step 2.4 — Map personas to stories
- [x] Create persona-to-story mapping table in stories.md
- [x] Verify every persona has at least 3 stories (Candidate: 11, Recruiter: 8, Director: 10, Head of People: 7)
- [x] Verify every story has exactly one primary persona

### Step 2.5 — Update state tracking
- [x] Mark User Stories as complete in aidlc-state.md
- [x] Log completion in audit.md

---

## Notes from PRD Context

The following PRD sections directly inform story creation:
- Section 3.2 (Buyer Personas): 3 operator personas with detailed context
- Section 5 (Top 5 Use Cases): Maps directly to candidate and operator journeys
- Section 7 (User Journeys): 4 journeys including edge cases
- Section 8 (MVP Scope MoSCoW): 10 Must-Have features define story scope
- Section 9 (Functional Modules): 5 modules map to Epic structure

---

*Please answer the 5 planning questions above (P1-P5) and notify when complete.*
