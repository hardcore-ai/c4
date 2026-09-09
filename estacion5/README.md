# Estación 5 — Diseñando el CÓMO con AI-DLC

**Hardcore AI | 30X · Fase Construction · Spec-Driven Development con IA**

Este repositorio es la guía práctica de la **Estación 5** del programa Hardcore AI 30X. Contiene el framework AI-DLC, recursos de apoyo y un proyecto de ejemplo con los artefactos de la fase Construction generados para la primera unidad.

---

## ¿Qué encontrarás aquí?

| Propósito | Qué resuelve |
| :--- | :--- |
| **Runbook paso a paso** | Cómo ejecutar las 5 actividades de Construction con un agente de IA |
| **Framework AI-DLC listo para usar** | Las reglas del framework en la versión `v0.1.8` |
| **Proyecto de ejemplo con Construction** | EntreVista AI con los artefactos de la Unidad 1 (auth-lambda) completamente generados |
| **Templates y prompts** | ADR template y prompts de arquitectura listos para copiar |

---

## Estructura del repositorio

```
estacion-5/
│
├── estacion5-runbook.md          ← EMPIEZA AQUÍ — guía de trabajo de la clase
│
├── docs/
│   ├── prompts-ajit-arquitectura.md   ← Prompts para diseño arquitectónico (C4, NFRs, ADR)
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
    └── aidlc-docs/               ← Artefactos generados por el framework
        ├── inception/            ← Fase Inception completa (6 artefactos)
        │   ├── requirements/
        │   ├── user-stories/
        │   ├── application-design/
        │   └── plans/
        └── construction/         ← Fase Construction — Unidad 1 completa
            └── auth-lambda/
                ├── functional-design/     ← domain-entities, business-rules, business-logic-model
                ├── nfr-requirements/      ← nfr-requirements con 6 atributos de calidad
                ├── nfr-design/            ← ADRs por NFR significativo
                └── infrastructure-design/ ← mapa de servicios + deployment-architecture
```

---

## Cómo usar este repositorio

### Requisito previo

La Estación 5 es la continuación directa de la Estación 4. Necesitas tener los **6 artefactos de Inception** completos en tu workspace antes de empezar:

```
tu-producto/
├── CLAUDE.md                          ✅ Reglas del framework
├── PRD_tu_producto.md                 ✅ PRD de Inception
├── .aidlc-rule-details/               ✅ Detalles de fases
└── aidlc-docs/
    └── inception/
        ├── requirements/              ✅
        ├── user-stories/              ✅
        ├── application-design/        ✅
        └── plans/                     ✅ (incluye units-generation.md)
```

> Si alguno de estos artefactos falta o está incompleto, vuelve a la Estación 4 primero. El agente construirá código sin contrato si los artefactos de Inception están incompletos.

### Paso 1 — Lee el runbook

Abre [`estacion5-runbook.md`](estacion5-runbook.md). Es tu guía de trabajo activo: explica cada actividad, qué artefacto genera, qué debes validar y qué prompt usar en cada momento.

### Paso 2 — Abre tu workspace de Inception en Cursor o Claude Code

```sh
# Abre el workspace donde tienes tus artefactos de Inception
cd nombre_de_tu_producto
cursor .
# o en Claude Code: abre la carpeta directamente
```

### Paso 3 — Envía el prompt de re-entrada

Con el workspace abierto en el mismo directorio donde está `CLAUDE.md`, envía este prompt para que el framework confirme la fase activa:

```
Confírmame en qué fase de AI-DLC nos encontramos, para avanzar.
```

El framework leerá `aidlc-docs/aidlc-state.md`, confirmará que Inception está completa y entrará directamente en Construction. Tú validas los artefactos y apruebas antes de que avance a la siguiente actividad.

---

## Las 5 actividades de la Fase Construction

Cada unidad de trabajo pasa por las mismas 5 actividades en el mismo orden. El agente espera tu aprobación al final de cada una antes de continuar.

| # | Actividad | Artefacto que genera | Regla de oro |
| :--- | :--- | :--- | :--- |
| 01 | Diseño funcional | `domain-entities.md` · `business-rules.md` · `business-logic-model.md` | No generes código antes de tener el `business-logic-model.md` aprobado |
| 02 | NFR Requirements | `nfr-requirements.md` | Cada NFR necesita un valor numérico verificable — sin él no es un NFR |
| 03 | NFR Design (ADR) | `nfr-design.md` | Todo ADR debe tener ⚠️ en Consecuencias — toda decisión tiene un costo |
| 04 | Infrastructure Design | `infrastructure-design.md` · `deployment-architecture.md` | Todos los componentes del `application-design.md` deben aparecer en el diagrama |
| 05 | Code Generation + Tests | Código fuente completo + suite de tests | Los tests de integración deben trazarse a escenarios Gherkin del `user-stories.md` |

> **Flujo completo por unidad:**
> `Diseño funcional → NFR Requirements → NFR Design (ADR) → Infrastructure Design → Code Generation → Tests`

---

## Proyecto de ejemplo: EntreVista AI — Unidad 1 (auth-lambda)

La carpeta [`agentic_interviewer_ai/`](agentic_interviewer_ai/) contiene un proyecto real con la fase Inception completa **y** los artefactos de Construction generados para la Unidad 1. Úsala como referencia para ver cómo se ven los artefactos bien generados antes de hacerlos con tu propio producto.

**¿Qué es EntreVista AI?** Una plataforma de screenings conversacionales vía Telegram para el mercado LATAM. El agente razona, repregunta y entrega evidencia estructurada al reclutador — sin chatbots de reglas estáticas.

**Arquitectura del sistema (7 microservicios):**

```
telegram-bot → conversation-lambda (Claude Agent SDK)
                    ├── evaluation-lambda
                    ├── campaign-lambda (RAG + Pinecone)
                    └── compliance-lambda

dashboard (React) → auth-lambda + todos los lambdas anteriores

Almacenamiento: MongoDB Atlas · AWS S3 · Pinecone · AWS Secrets Manager
```

**Unidad 1 — auth-lambda (ejemplo de Construction completo):**

| Artefacto | Qué muestra |
| :--- | :--- |
| `functional-design/domain-entities.md` | Entities (`Operator`, `RefreshToken`), Value Objects (`HashedPassword`, `JWTAccessToken`), Aggregates |
| `functional-design/business-rules.md` | 6 reglas numeradas (RULE-AUTH-01 a RULE-AUTH-06) con condición, consecuencia y fuente |
| `functional-design/business-logic-model.md` | Flujos E2E: Login, Refresh, Logout, Change Password con estados posibles |
| `nfr-requirements/nfr-requirements.md` | 6 NFRs con valores numéricos (P95 < 500ms, bcrypt factor 10, 99.5% disponibilidad…) |
| `nfr-design/nfr-design-patterns.md` | 3 ADRs: degraded mode Redis→MongoDB, JWT RS256 + Secrets Manager, rate limiting granular |
| `infrastructure-design/infrastructure-design.md` | Mapa de servicios AWS: API Gateway, Lambda, MongoDB Atlas, Secrets Manager, VPC |
| `infrastructure-design/deployment-architecture.md` | Diagrama Mermaid completo de despliegue |

---

## Recursos clave

| Recurso | Para qué |
| :--- | :--- |
| [AI-DLC Framework (AWS Labs)](https://github.com/awslabs/aidlc-workflows) | Repositorio oficial del framework |
| [Versión v0.1.8](https://github.com/awslabs/aidlc-workflows/tree/v0.1.8) | Versión incluida en este repo |
| [DDD Reference (Evans)](https://www.domainlanguage.com/ddd/reference/) | Patrones tácticos: Entities, Value Objects, Aggregates, Domain Services |
| [ADR Examples](https://adr.github.io) | Referencia y formatos de Architecture Decision Records |
| [MADR Template](https://github.com/adr/madr) | Template ligero de ADR recomendado para equipos ágiles |
| [C4 Model](https://c4model.com) | Diagramas de despliegue — Nivel 3 Component |
| [FastAPI + Mangum (Lambda)](https://mangum.io) | ASGI adapter para deploy de FastAPI en AWS Lambda |

---

**Programa:** Hardcore AI | 30X · **Instructor:** Christian Braatz
