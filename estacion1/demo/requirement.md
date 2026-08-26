# PRD resumido — SkillWall Live (Demo "30X AI for Developers")

## 1) Resumen
**SkillWall Live** es una aplicación web para eventos (remotos o híbridos) donde los asistentes se registran en una sesión, suben una foto y seleccionan un conjunto de skills/temas técnicos. Una vez registrados, los participantes pueden ver un "muro" con todos los demás y dar **like a los skills** (no a la persona). Se muestra un **leaderboard** en tiempo casi real. El participante y el votante son la misma persona: registrarse es requisito para votar.

El "efecto wow" del demo no se centra en IA dentro de la funcionalidad, sino en el **proceso de desarrollo y puesta en operación**: requerimiento → spec → arquitectura → IaC → despliegue → pruebas e2e → observabilidad → seguridad.

---

## 2) Objetivos
- Permitir participación masiva (60–300) con una experiencia móvil sencilla (link/QR).
- Visualizar en vivo un muro (Wall) con todos los participantes y conteo de likes por skill.
- Demostrar delivery end-to-end con tooling moderno (Cursor/IA en desarrollo, Terraform, CI local, observabilidad y seguridad).
- Tener una operación "demo-ready": reset de sesión, trazas, métricas, logs y controles anti-abuso.

### No objetivos (para acotar)
- Autenticación formal (SSO/OAuth) y perfiles persistentes multi-evento.
- Moderación avanzada de contenido (solo controles básicos de upload y admin hide/delete).
- Realtime complejo (WebSockets). Se usará polling.
- CloudFront para distribución de imágenes.
- Paginación del Wall (se muestran todos los participantes).
- Endpoint de consulta de auditoría.
- Seed de datos para demo.

---

## 3) Usuarios y casos de uso
### Roles
- **Participante** (= votante): se registra, sube foto, selecciona skills y luego puede dar likes a los skills de otros participantes. No existe un rol "votante" separado; todo participante registrado es automáticamente votante.
- **Admin de sesión**: resetea la sesión, oculta/elimina participantes, revisa actividad.

### Flujo del participante
1. Entra a la sesión (link/QR), ingresa `sessionCode` y `displayName`, sube foto y selecciona skills.
2. Queda publicado en el Wall.
3. Desde el Wall, puede dar likes a los skills de los demás participantes.
4. El muro y el leaderboard se actualizan cada pocos segundos.

### Casos de uso adicionales
- El admin resetea la sesión o elimina spam durante el evento.

---

## 4) Alcance técnico (stack para demo)
- **Frontend**: Next.js 16 (solo front) desplegado en **Vercel**. Tailwind + Shadcn.
- **Backend**: AWS **API Gateway (HTTP API v2)** + **Lambda Node.js 22** (router interno, 1 Lambda).
- **Datos**: **DynamoDB** — tabla `participants` con skills y conteos de likes embebidos.
- **Imágenes**: **S3** (upload directo por pre-signed URL, lectura directa desde S3 sin CloudFront).
- **Observabilidad (E2E)**: OpenTelemetry + **New Relic** (SaaS) para traces/metrics/logs. Access logs de API Gateway en CloudWatch.
- **Infra**: **Terraform** (AWS) + scripts bash con AWS CLI para update de Lambda code.
- **Catálogo de skills**: lista fija definida en código (constante compartida frontend/backend):
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

## 5) Requerimientos funcionales (FR)

### FR-01 Gestión de sesión
- El sistema debe soportar una **sesión** identificada por `sessionCode` (ej. `LATAM2026`).
- Todas las acciones (join, wall, likes, leaderboard) deben filtrar por `sessionCode`.
- La gestión de sesiones se realiza exclusivamente vía API (sin interfaz de administración):
  - `POST /admin/sessions` con body `{ sessionCode, adminToken }` → crea la sesión.
  - `DELETE /admin/sessions/{sessionCode}` con header `adminToken` → elimina la sesión y todos sus datos (participantes, likes).
- No existe UI de administración. Estas operaciones se ejecutan con curl, Postman o similar.

### FR-02 Registro de participante (Join)
- El participante debe poder:
  - ingresar `displayName` (nombre o alias),
  - seleccionar entre **3 y 5 skills** de una lista fija definida en código,
  - adjuntar una foto (cámara si está disponible, con fallback a upload de archivo).
- El backend debe validar:
  - que `displayName` no esté vacío,
  - que la cantidad de skills esté en rango (3–5),
  - que los skills pertenezcan al catálogo válido,
  - que `sessionCode` sea válido.
- La creación debe retornar el `participantId` y la información consolidada.

### FR-03 Upload de foto (S3 pre-signed)
- El sistema debe generar una **pre-signed URL** para cargar la imagen a S3:
  - `POST /upload-url` devuelve `uploadUrl` + `objectKey`.
- El frontend debe subir la foto directamente a S3 usando `uploadUrl`.
- El `join` debe referenciar la foto por `objectKey` (no por bytes).
- El sistema debe exponer una `photoUrl` para lectura directa desde S3 (sin CloudFront).

### FR-04 Muro de participantes (Wall)
- Debe existir una vista pública `Wall` que muestre:
  - foto, nombre, skills (chips) y conteo de likes por skill.
- **Sin paginación**: se muestran todas las cards de participantes de la sesión en una sola vista.
- Debe soportar orden por "new" (reciente) y "top" (por suma de likes).
- La actualización debe ser por **polling** cada ~2 segundos.

### FR-05 Likes por skill
- Un participante registrado puede dar **like** a un skill específico de otro participante.
- Solo participantes registrados en la sesión pueden votar (se usa su `participantId` como identificador de votante).
- Debe existir idempotencia:
  - un participante no puede dar más de 1 like al mismo `participantId + skillId` de otro.
- El `participantId` (obtenido en el registro) se envía en el body de la request de like como identificador del votante.
- Debe devolver el nuevo conteo de likes.

### FR-06 Leaderboard
- Debe existir un leaderboard con:
  - Top participantes (por total de likes en todos sus skills).
  - Top skills (por likes acumulados en la sesión).
- Debe actualizarse junto con Wall (polling cada ~2s).

### FR-07 Administración mínima (solo API, sin UI)
- La administración se limita a dos endpoints protegidos por `adminToken`:
  - `POST /admin/sessions` → crear sesión.
  - `DELETE /admin/sessions/{sessionCode}` → eliminar sesión y todos sus datos.
- No existe interfaz gráfica de administración.
- No hay endpoint para ocultar/eliminar participantes individuales (fuera de alcance para demo).
- No hay endpoint de consulta de auditoría (fuera de alcance para demo).

### FR-08 Salud y diagnóstico
- `GET /health` debe indicar estado de:
  - Lambda (viva),
  - acceso a DynamoDB,
  - (opcional) acceso a S3.

---

## 6) Requerimientos no funcionales (NFR)

### NFR-01 Performance y escalabilidad
- Soportar 60–300 usuarios concurrentes en sesión.
- `p95` de API (wall/like/join) objetivo: < 500ms bajo carga moderada.
- El endpoint del Wall retorna todos los participantes sin paginación (payload manejable para 60–300 participantes).

### NFR-02 Resiliencia y operación
- El sistema debe tolerar fallos parciales (p.ej. error de upload):
  - permitir join con foto default si el upload falla.
- Debe existir "modo demo":
  - reset rápido de sesión.
- Sin seed de datos (la sesión inicia limpia).
- Timeouts claros en frontend con reintentos controlados.

### NFR-03 Seguridad (mínimo viable, demo-grade)
- **CORS** restringido al dominio de Vercel (y localhost si aplica).
- **Rate limiting**: **5 transacciones por segundo** por IP para endpoints `join` y `like`, con respuesta `429`.
- Validación de inputs (longitudes, enumeraciones, tamaño de payload).
- Upload seguro:
  - tamaño máximo **2MB**,
  - tipos permitidos (jpeg/png/webp),
  - negar SVG,
  - objectKey no predecible y con prefijo por sesión.
- Headers recomendados en frontend:
  - CSP básica, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- Auditoría mínima (solo en logs, sin endpoint de consulta):
  - eventos `SESSION_CREATED`, `SESSION_DELETED`, `JOIN_CREATED`, `LIKE_CAST`, `RATE_LIMITED`.

### NFR-04 Observabilidad (OTel E2E)
- Debe instrumentarse con OpenTelemetry:
  - traces por request en Lambda,
  - métricas RED (rate, errors, duration),
  - logs estructurados con `traceId`.
- Debe existir correlación front→back:
  - el frontend envía `traceparent` (W3C) en requests,
  - el backend lo usa como contexto padre.
- Exportación OTLP/HTTP a New Relic (SaaS).
- Access logs de API Gateway en CloudWatch como complemento operacional.

### NFR-05 Calidad y pruebas
- Unit tests para:
  - idempotencia de likes,
  - validación de join,
  - rate limiting.
- E2E (Playwright):
  - crear participante (con fixture),
  - verificar aparición en wall,
  - dar like y verificar incremento.
- Smoke test post-deploy:
  - health + join + like.

### NFR-06 Infraestructura y despliegue
- Infra AWS declarada en Terraform:
  - HTTP API + integración Lambda,
  - DynamoDB tabla `participants` (skills y likes embebidos),
  - S3 bucket (uploads, acceso de lectura directo sin CloudFront),
  - IAM roles/policies mínimos,
  - logs de API Gateway (access logs) a CloudWatch.
- Despliegue de Lambda code vía script bash + AWS CLI:
  - build (esbuild) → zip → `aws lambda update-function-code`.
- Versionado por ambiente: `dev`, `demo`, `prod` (tags/variables).

### NFR-07 Privacidad y cumplimiento (demo)
- No recolectar PII innecesaria (solo alias + foto).
- Aviso visible: "No subas información sensible; contenido puede ser removido".
- Retención: datos se borran al reset de sesión.

### NFR-08 Llaves de Configuración (demo)
<!--
  ⚠️ NOTA DE SEGURIDAD (2026-05-12):
  Esta sección originalmente contenía una llave real de ingesta de NewRelic
  hardcoded. La llave fue revocada
  y reemplazada por un placeholder. Cualquier nueva cohorte debe:
    1. Generar su propia ingest key en https://one.newrelic.com → API keys.
    2. Pasarla por env var (TF_VAR_new_relic_license_key) o tfvars LOCAL, jamás
       commitearla en este archivo ni en ningún otro.
    3. Ver `infra/terraform.tfvars.example` para el patrón correcto.
  El admin_token también es solo un placeholder; reemplázalo por un secreto fuerte.
-->
- Utilizar la llave de ingesta de logs de NewRelic: "REPLACE_WITH_NEW_RELIC_INGEST_KEY"
- Utilizar session code: "LATAM2026"
- Utilizar admin_token: "REPLACE_WITH_STRONG_ADMIN_TOKEN"

**Nota NFR-08:** Se encierran los valores en comillas, solo tomar lo que está dentro de las comillas. **Nunca commitear los valores reales** — usar `infra/terraform.tfvars` (gitignored) o `-var` en la línea de comandos.


---

## 7) API (endpoints)
- `POST /upload-url` → `{ uploadUrl, objectKey }`
- `POST /join` → `{ participantId, displayName, photoUrl, skills[] }`
- `GET /wall?sessionCode=&sort=new|top` → `{ items[] }`
- `POST /like` → `{ targetParticipantId, skillId, voterId (participantId del votante) }` → `{ likeCount }`
- `GET /leaderboard?sessionCode=` → `{ topParticipants[], topSkills[] }`
- `POST /admin/sessions` (adminToken) → `{ sessionCode, createdAt }`
- `DELETE /admin/sessions/{sessionCode}` (adminToken) → `{ ok: true }`
- `GET /health` → `{ status: "ok" }`

---

## 8) Métricas de éxito (para la demo)
- ≥ 30 participantes creados en 5–10 minutos.
- ≥ 200 likes emitidos sin caídas.
- Dashboard muestra p95 latency y error rate.
- Se puede abrir un trace real con correlación (traceId visible en logs).

---

## 9) Riesgos y mitigaciones
- **Red / Wi-Fi**: tener URL pública (Vercel + AWS) y fallback "sin foto".
- **CORS**: pre-configurar allow-origin correcto.
- **OTLP export**: validar keys y conectividad antes (smoke test).
- **Spam**: rate limit (5 TPS) + sessionCode + admin remove.
- **Uploads**: límite estricto 2MB + tipos permitidos + fallback avatar.

---
