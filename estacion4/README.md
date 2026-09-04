# Estación 4 — Diseñando el QUÉ con AI-DLC

**Hardcore AI | 30X · Fase Inception · Spec-Driven Development con IA**

Este repositorio es la guía práctica de la **Estación 4** del programa Hardcore AI 30X. Contiene el framework AI-DLC, recursos de apoyo y un proyecto de ejemplo completo con todos los artefactos de la fase Inception generados.

---

## ¿Qué encontrarás aquí?

| Propósito | Qué resuelve |
| :--- | :--- |
| **Runbook paso a paso** | Cómo ejecutar las 6 actividades de Inception con un agente de IA |
| **Framework AI-DLC listo para usar** | Las reglas del framework en la versión `v0.1.8` |
| **Proyecto de ejemplo completo** | EntreVista AI con todos los artefactos de Inception ya generados |
| **Templates y prompts** | ADR template y prompts de arquitectura listos para copiar |

---

## Estructura del repositorio

```
estacion-4/
│
├── estacion4-runbook.md          ← EMPIEZA AQUÍ — guía de trabajo de la clase
│
├── docs/
│   ├── prompts-ajit-arquitectura.md   ← Prompts para el diseño arquitectónico (C4, NFRs, ADR)
│   └── adr-template.md                ← Template para documentar decisiones arquitectónicas
│
├── aidlc-rules/                  ← Framework AI-DLC v0.1.8 (no modificar)
│   ├── aws-aidlc-rules/
│   │   └── core-workflow.md      ← Cerebro del framework (se copia como CLAUDE.md)
│   └── aws-aidlc-rule-details/   ← Instrucciones detalladas de cada fase
│
└── agentic_interviewer_ai/       ← Proyecto de ejemplo: EntreVista AI
    ├── CLAUDE.md                 ← Agente de contexto del proyecto (core-workflow copiado)
    ├── PRD_agentic_interviewer_ai.md  ← PRD de entrada del ejemplo
    └── aidlc-docs/               ← Artefactos de Inception generados por el framework
        └── inception/
            ├── requirements/
            ├── user-stories/
            ├── application-design/
            └── plans/
```

---

## Cómo usar este repositorio

### Paso 1 — Lee el runbook

Abre [`estacion4-runbook.md`](estacion4-runbook.md). Es tu guía de trabajo activo: explica cada actividad, qué artefacto genera, qué debes validar y qué prompt usar.

### Paso 2 — Inicializa tu propio workspace

Sigue la sección **Setup** del playbook. En resumen:

```sh
# Crea tu directorio de producto
mkdir nombre_de_tu_producto
cd nombre_de_tu_producto

# Copia el PRD de tu producto (de la Estación 2)
cp ../PRD_tu_producto.md PRD_tu_producto.md

# Inicializa el framework AI-DLC
cp ../aidlc-rules/aws-aidlc-rules/core-workflow.md ./CLAUDE.md
mkdir -p .aidlc-rule-details
cp -R ../aidlc-rules/aws-aidlc-rule-details/* .aidlc-rule-details/

# Abre en Cursor o Claude Code
cursor .
```

### Paso 3 — Envía el prompt de inicio

Con el workspace abierto, envía este prompt al agente para activar el framework:

```
Usando AI-DLC, construiremos un producto que consiste en [descripción de tu producto].
Con base en el Product Requirements Document (PRD) @PRD_tu_producto.md.
```

El framework tomará el control del ritmo. Tú respondes preguntas, validas artefactos y apruebas antes de continuar.

---

## Las 6 actividades de la Fase Inception

| # | Actividad | Artefacto que genera | Alimenta a |
| :--- | :--- | :--- | :--- |
| 00 | Workspace Detection | `workspace-detection.md` | Todas las siguientes |
| 01 | Requirements Analysis | `requirements-analysis.md` | User Stories, Application Design |
| 02 | User Stories | `user-stories.md` | Workflow Planning, Units Generation |
| 03 | Workflow Planning | `workflow-planning.md` | Application Design |
| 04 | Application Design | `application-design.md` | Units Generation |
| 05 | Units Generation | `units-generation.md` | **Estación 5 (Construction)** |

> Los 6 artefactos son la entrada obligatoria de la Estación 5. Sin ellos el agente construye código sin contrato.

---

## Proyecto de ejemplo: EntreVista AI

La carpeta [`agentic_interviewer_ai/`](agentic_interviewer_ai/) contiene un proyecto real con la fase Inception completa. Úsala como referencia para ver cómo se ven los artefactos bien generados antes de hacerlos con tu propio producto.

**¿Qué es EntreVista AI?** Una plataforma de screenings conversacionales vía Telegram. El agente razona, repregunta y entrega evidencia estructurada al reclutador — sin chatbots de reglas estáticas.

**Arquitectura resultante (7 microservicios):**

```
telegram-bot → conversation-lambda (Claude Agent SDK)
                    ├── evaluation-lambda
                    ├── campaign-lambda (RAG + Pinecone)
                    └── compliance-lambda

dashboard (React) → auth-lambda + todos los lambdas anteriores

Almacenamiento: MongoDB Atlas · AWS S3 · Pinecone · AWS Secrets Manager
```

---

## Recursos clave

| Recurso | Para qué |
| :--- | :--- |
| [AI-DLC Framework (AWS Labs)](https://github.com/awslabs/aidlc-workflows) | Repositorio oficial del framework |
| [Versión v0.1.8](https://github.com/awslabs/aidlc-workflows/tree/v0.1.8) | Versión incluida en este repo |
| [C4 Model](https://c4model.com) | Diagramas de contexto y contenedores |
| [ADR Examples](https://adr.github.io) | Referencia de Architecture Decision Records |
| [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/) | Sintaxis completa para escenarios de User Stories |

---

**Programa:** Hardcore AI | 30X · **Instructor:** Christian Braatz
