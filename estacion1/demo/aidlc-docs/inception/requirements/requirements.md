# Requirements — SkillWall Live (Demo 30X)

## Intent Analysis
- **User Request**: Implementar SkillWall Live siguiendo AIDLC, basado en PRD y ADRs existentes
- **Request Type**: New Project (Greenfield)
- **Scope**: System-wide — Frontend, Backend, Data, IaC, Observability, Security
- **Complexity**: Complex — múltiples componentes, infraestructura cloud, observabilidad E2E

---

## 1. Functional Requirements

### FR-01 Gestión de sesión
- Sesión identificada por `sessionCode` (default: `LATAM2026`)
- Todas las acciones filtran por `sessionCode`
- Gestión exclusivamente via API (sin UI admin):
  - `POST /admin/sessions` con `{ sessionCode, adminToken }` → crea sesión
  - `DELETE /admin/sessions/{sessionCode}` con header `adminToken` → elimina sesión y todos sus datos

### FR-02 Registro de participante (Join)
- Campos: `displayName`, 3–5 skills del catálogo fijo, foto
- Validaciones: displayName no vacío, skills en rango 3–5, skills del catálogo válido, sessionCode válido
- Retorna: `participantId`, `displayName`, `photoUrl`, `skills[]`
- El `participantId` se almacena en localStorage del frontend para identificar al votante

### FR-03 Upload de foto (S3 pre-signed)
- `POST /upload-url` genera pre-signed URL para escritura en S3
- Frontend sube directo a S3
- Join referencia foto por `objectKey`
- Lectura via pre-signed read URLs con TTL

### FR-04 Muro de participantes (Wall)
- Vista pública: foto, nombre, skills (chips), conteo likes por skill
- Sin paginación (todos los participantes)
- Orden: "new" (reciente) y "top" (suma de likes)
- Polling cada ~2 segundos

### FR-05 Likes por skill
- Solo participantes registrados pueden votar (participante = votante)
- Like a skill específico de otro participante
- Idempotencia: 1 like por `voterParticipantId + targetParticipantId + skillId`
- El `participantId` del votante se envía en el body del request
- Backend valida que el participantId del votante existe en la sesión
- Retorna nuevo `likeCount`

### FR-06 Leaderboard
- Top participantes (por total likes)
- Top skills (por likes acumulados en sesión)
- Polling cada ~2s junto con Wall

### FR-07 Administración mínima (solo API, sin UI)
- Endpoints protegidos por `adminToken` (variable de entorno en Lambda)
- Solo crear y eliminar sesión
- Sin endpoint para ocultar/eliminar participantes individuales
- Sin endpoint de auditoría
- Operaciones via curl/Postman

### FR-08 Salud y diagnóstico
- `GET /health`: estado de Lambda, DynamoDB, (opcional) S3

---

## 2. Non-Functional Requirements

### NFR-01 Performance
- 60–300 usuarios concurrentes
- p95 API < 500ms
- Wall retorna todos los participantes sin paginación

### NFR-02 Resiliencia
- Join con foto default si upload falla
- Reset rápido de sesión (modo demo) via DELETE session
- Timeouts con reintentos en frontend

### NFR-03 Seguridad (demo-grade)
- CORS restringido a dominio Vercel + localhost
- Rate limiting: 5 TPS por IP via API Gateway throttling nativo (endpoints join y like), respuesta 429
- Validación de inputs (longitudes, enumeraciones, payload)
- Upload seguro: max 2MB, tipos jpeg/png/webp, negar SVG, objectKey no predecible
- Headers frontend: CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
- Auditoría en logs: SESSION_CREATED, SESSION_DELETED, JOIN_CREATED, LIKE_CAST, RATE_LIMITED

### NFR-04 Observabilidad (OTel E2E)
- Backend: OTel traces por request, métricas RED, logs estructurados con traceId
- Frontend: SDK OTel completo en browser — auto-instrumentación fetch/XHR, spans custom, web vitals, exportación a New Relic
- Propagación W3C `traceparent` front→back
- Exportación OTLP/HTTP a New Relic (SaaS)
- Access logs API Gateway en CloudWatch

### NFR-05 Pruebas
- Unit tests: idempotencia likes, validación join, rate limiting
- E2E (Playwright): crear participante, verificar wall, dar like, verificar incremento
- Smoke test post-deploy: health + join + like

### NFR-06 Infraestructura
- Región: **us-east-1**
- Terraform: HTTP API, Lambda integration, DynamoDB, S3, IAM, CloudWatch logs
- Deploy Lambda: script bash + AWS CLI (esbuild → zip → update-function-code)
- Ambientes: dev, demo, prod (tags/variables)

### NFR-07 Privacidad
- Solo alias + foto, aviso visible, datos se borran al eliminar sesión

---

## 3. Technical Decisions (from ADRs + Verification)

| Decision | Choice |
|---|---|
| Frontend | Next.js 16, App Router, Tailwind + Shadcn, Vercel |
| Backend | AWS Lambda Node.js 22, 1 Lambda con router interno |
| API | API Gateway HTTP API v2, payload format 2.0 |
| Database | DynamoDB — tabla `participants`, PK: `SESSION#<sessionCode>`, SK: `PARTICIPANT#<participantId>` |
| Vote Idempotency | Items separados: PK: `VOTE#<sessionCode>`, SK: `<voterParticipantId>#<targetParticipantId>#<skillId>` |
| Session Metadata | PK: `SESSION#<sessionCode>`, SK: `METADATA` |
| Storage | S3 pre-signed URLs (write + read), sin CloudFront |
| Voter Identity | participantId del registro (localStorage), no voterId anónimo |
| Observability | OTel E2E → New Relic (OTLP/HTTP) + CloudWatch access logs |
| OTel Frontend | Completo: SDK browser, spans custom, web vitals, export New Relic |
| IaC | Terraform (infra) + bash/AWS CLI (Lambda code deploy) |
| Rate Limiting | API Gateway throttling nativo, 5 TPS por IP |
| Admin Auth | adminToken como variable de entorno en Lambda |
| Admin Scope | Solo crear/eliminar sesión via API, sin UI, sin remove individual |
| Session Code | LATAM2026 (default) |
| Region | us-east-1 |
| Repo Structure | Monorepo: /frontend, /backend, /infra |

---

## 4. Skills Catalog (15 items)

1. Backend Engineer — APIs y microservicios
2. Frontend Engineer — React y Next.js
3. Mobile Engineer — iOS y Android
4. Cloud Architect — AWS
5. DevOps y Platform Engineer
6. Site Reliability Engineering (SRE)
7. Data Engineer — ETL y streaming
8. Machine Learning Engineer — MLOps
9. Cybersecurity Engineer — AppSec
10. Security Architect y Cloud Security
11. Observability y Monitoring — OpenTelemetry y APM
12. Kubernetes y contenedores
13. Sistemas distribuidos
14. Arquitectura de software — C4 y DDD
15. QA Automation — E2E y CI/CD

---

## 5. API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /upload-url | — | Genera pre-signed URL para upload S3 |
| POST | /join | — | Registra participante |
| GET | /wall?sessionCode=&sort= | — | Muro de participantes |
| POST | /like | — | Like a skill (body: targetParticipantId, skillId, voterId=participantId) |
| GET | /leaderboard?sessionCode= | — | Top participantes y skills |
| POST | /admin/sessions | adminToken | Crear sesión |
| DELETE | /admin/sessions/{sessionCode} | adminToken | Eliminar sesión y todos sus datos |
| GET | /health | — | Health check |

---

## 6. DynamoDB Schema (from ADR-006)

**Table: participants**

| Atributo | Tipo | Descripción |
|---|---|---|
| PK | String | `SESSION#<sessionCode>` |
| SK | String | `PARTICIPANT#<participantId>` o `METADATA` o `VOTE#...` |
| participantId | String | UUID v4 generado por backend |
| sessionCode | String | Código de sesión |
| displayName | String | Nombre o alias |
| photoObjectKey | String | Key S3 (ej: `LATAM2026/abc123.jpg`) |
| photoUrl | String | Pre-signed read URL |
| skills | List of Map | `[{skillId, skillName, likeCount}]` |
| totalLikes | Number | Suma de likes (para leaderboard sort) |
| createdAt | String | ISO 8601 |

**Vote idempotency items:**
- PK: `VOTE#<sessionCode>`
- SK: `<voterParticipantId>#<targetParticipantId>#<skillId>`
- ConditionExpression para prevenir duplicados

**Session metadata items:**
- PK: `SESSION#<sessionCode>`, SK: `METADATA`

**Access Patterns:**
- Wall: Query PK = `SESSION#<sessionCode>`, SK begins_with `PARTICIPANT#`
- Join: PutItem
- Like: TransactWriteItems (put vote item + update participant skill likeCount + totalLikes)
- Leaderboard: Same query as Wall, sort by totalLikes in backend
- Admin create session: PutItem METADATA
- Admin delete session: Query + BatchWriteItem delete all items with PK = `SESSION#<sessionCode>`
