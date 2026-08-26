# ADR Index — SkillWall Live (Demo 30X)

> Estado: **Accepted**  
> Fecha: **2026-03-02**  
> Contexto: Demo en 30 minutos enfocada en *proceso de desarrollo y puesta en operación* (spec → arquitectura → IaC → deploy → pruebas → observabilidad → seguridad), no en IA dentro de la funcionalidad.

---

## ADR-000 — Objetivo de la iniciativa (Demo-first)
### Decisión
La iniciativa prioriza **velocidad, reproducibilidad y operación** sobre complejidad funcional. El valor debe provenir del **proceso de construcción y puesta en operación**, no del uso de IA en el producto.

### Consecuencias
- Requerimiento funcional deliberadamente simple.
- Se privilegia "golden path" y automatización por scripts/Makefile.
- Se evita dependencia de servicios externos que puedan fallar en vivo (salvo proveedor SaaS de observabilidad).

---

## ADR-001 — Experiencia de participación remota (LatAm)
### Decisión
La solución debe funcionar para una sesión remota con participantes desde distintos países, usando **link público + QR opcional** (en pantalla), y un **sessionCode** para agrupar la actividad del evento.

### Consecuencias
- HTTPS obligatorio.
- Latencia y variabilidad de red consideradas (polling o SSE).
- Controles anti-abuso necesarios (rate limiting y reset admin).

---

## ADR-002 — Stack de frontend
### Decisión
El frontend será **Next.js 16** desplegado en **Vercel**, usado **solo como frontend** (sin backend/SSR obligatorio para la demo). Se debe usar Tailwind y Shadcn. Las versiones para trabajar son Node.js: 22, Next.js: 16, Tailwind CSS: 4.2.1 y React: 19.

### Consecuencias
- La API pública estará en AWS.
- CORS debe permitir el origen de Vercel y (si aplica) localhost.
- La instrumentación en el browser no debe exponer secretos.

---

## ADR-003 — API Gateway: HTTP API vs REST API
### Decisión
Se usará **API Gateway HTTP API (v2)** para minimizar configuración y riesgo en demo.

### Consecuencias
- Integración Lambda proxy con **payload format 2.0**.
- CORS se configura en HTTP API.
- No se depende de features específicas de REST API (usage plans, API keys, request validation nativa, etc.).

---

## ADR-004 — Backend serverless y runtime
### Decisión
El backend será **AWS Lambda** con runtime **Node.js 22**.

### Consecuencias
- Se unifica el tooling local (Node para front, build, tests y lambda).
- Se reduce fricción con packaging al usar bundling.
- Se evita Python en esta iteración por simplicidad operacional y consistencia de pipeline (aunque Python era viable).

---

## ADR-005 — Diseño de Lambda: 1 Lambda con router interno
### Decisión
Se implementará **una sola Lambda** con **router interno** para ~5 endpoints, en lugar de múltiples funciones.

### Consecuencias
- Menos recursos/roles/artefactos a desplegar y mantener.
- Despliegues más rápidos (un zip).
- Se simplifica el troubleshooting (un punto de entrada).

---

## ADR-006 — Persistencia y almacenamiento de imágenes
### Decisión
- Persistencia de datos: **DynamoDB** con una tabla principal `participants` que incluye skills y conteos de likes embebidos.
- Imágenes: **S3** con **pre-signed URL** tanto para upload (escritura) como para lectura.
- **Sin CloudFront**. Las fotos se sirven directamente desde S3 mediante pre-signed read URLs o configuración de acceso público al bucket.

### Diseño de tabla DynamoDB: `participants`

| Atributo | Tipo | Descripción |
|---|---|---|
| `PK` | String | Partition key. Formato: `SESSION#<sessionCode>` |
| `SK` | String | Sort key. Formato: `PARTICIPANT#<participantId>` |
| `participantId` | String | UUID v4 generado por el backend |
| `sessionCode` | String | Código de la sesión (ej. `LATAM2026`) |
| `displayName` | String | Nombre o alias del participante |
| `photoObjectKey` | String | Key del objeto en S3 (ej. `LATAM2026/abc123.jpg`) |
| `photoUrl` | String | URL de lectura directa desde S3 |
| `skills` | List of Map | Skills seleccionados con sus votos. Cada elemento: `{ skillId: String, skillName: String, likeCount: Number }` |
| `totalLikes` | Number | Suma total de likes en todos los skills (para ordenar en leaderboard) |
| `createdAt` | String | Timestamp ISO 8601 de creación |

**Ejemplo de item:**
```json
{
  "PK": "SESSION#LATAM2026",
  "SK": "PARTICIPANT#550e8400-e29b-41d4-a716-446655440000",
  "participantId": "550e8400-e29b-41d4-a716-446655440000",
  "sessionCode": "LATAM2026",
  "displayName": "Carlos",
  "photoObjectKey": "LATAM2026/550e8400.jpg",
  "photoUrl": "https://bucket.s3.amazonaws.com/LATAM2026/550e8400.jpg",
  "skills": [
    { "skillId": "backend-engineer", "skillName": "Backend Engineer — APIs y microservicios", "likeCount": 12 },
    { "skillId": "cloud-architect", "skillName": "Cloud Architect — AWS", "likeCount": 8 },
    { "skillId": "sre", "skillName": "Site Reliability Engineering (SRE)", "likeCount": 5 }
  ],
  "totalLikes": 25,
  "createdAt": "2026-02-28T15:30:00Z"
}
```

**Patrones de acceso:**
- **Wall (todos los participantes):** `Query PK = SESSION#<sessionCode>` → retorna todos los participantes de la sesión.
- **Join (crear participante):** `PutItem` con PK/SK.
- **Like (incrementar voto):** `UpdateItem` con `SET skills[idx].likeCount = skills[idx].likeCount + 1, totalLikes = totalLikes + 1` y validación de idempotencia por `voterParticipantId + targetParticipantId + skillId`.
- **Leaderboard (top participantes):** misma query del Wall, ordenado en backend por `totalLikes`.
- **Admin reset:** `Query PK = SESSION#<sessionCode>` + `BatchWriteItem` (delete all participants and votes).
- **Admin create session:** `PutItem` con `PK = SESSION#<sessionCode>`, `SK = METADATA`.

**Idempotencia de likes:** se usa un item separado con `PK = VOTE#<sessionCode>`, `SK = <voterParticipantId>#<targetParticipantId>#<skillId>` para registrar votos emitidos y prevenir duplicados con `ConditionExpression`.

### Consecuencias
- El backend no recibe bytes de imágenes (reduce carga y latencia).
- Se requiere endpoint `POST /upload-url` y política IAM específica para pre-signed.
- Se aplican restricciones: tamaño máximo, tipos permitidos (jpg/png/webp), negar SVG.
- El frontend en Vercel consume las imágenes directamente desde S3.
- Los skills de cada participante y sus conteos de likes se almacenan como atributos dentro del item del participante en DynamoDB (no en tabla separada).
- La idempotencia de likes se garantiza con items de voto separados y `ConditionExpression` en DynamoDB.

---

## ADR-007 — Comunicación "casi realtime"
### Decisión
Para minimizar riesgo, la actualización del Wall/Leaderboard será por **polling** cada ~2 segundos. SSE es opcional.

### Consecuencias
- Menos complejidad que WebSockets.
- Mayor consumo de requests, mitigado con rate limiting.
- **Sin paginación**: el endpoint del Wall retorna todos los participantes de la sesión en una sola respuesta. Dado el alcance de la demo (60–300 participantes), el payload es manejable.

---

## ADR-008 — Infraestructura como código y despliegue
### Decisión
- Infraestructura AWS definida con **Terraform**.
- Despliegue del código de Lambda con un **script bash + AWS CLI** (build → zip → update-function-code).

### Consecuencias
- Terraform maneja recursos estables (API, roles, Dynamo, S3, logs).
- El script permite iteración rápida en vivo sin `terraform apply` frecuente.
- Se requiere asegurar credenciales AWS (STS) y permisos antes de la demo.

---

## ADR-009 — Observabilidad: OpenTelemetry end-to-end con proveedor SaaS
### Decisión
Se usará **OpenTelemetry** para instrumentación y exportación de trazas/métricas/logs a un proveedor **SaaS**.

- Se eliminó SQS del alcance.
- Se busca visibilidad E2E en un solo lugar.
- Adicionalmente, se mantienen **access logs de API Gateway en CloudWatch** como complemento operacional.

### Consecuencias
- El backend debe exportar OTLP a un endpoint SaaS.
- El frontend debe **propagar contexto** (W3C `traceparent`) sin exponer secretos.
- CloudWatch recibe access logs de API Gateway para diagnóstico rápido independiente del SaaS.

---

## ADR-010 — Proveedor de observabilidad: menor riesgo para OTel E2E
### Decisión
Para OTel E2E, se prioriza un proveedor con **OTLP traces estable y directo** sin "preview/gated access".  
En el análisis se concluye que **New Relic** presenta **menor riesgo** que Datadog para OTLP traces directos en un setup de demo.

### Consecuencias
- Exportación OTLP/HTTP desde backend al endpoint de New Relic con `api-key` (license key).
- Evita depender de OTLP traces "preview" o de instalar/agregar Agent/Collector adicional solo para ingest.
- Se mantiene la opción de Datadog si ya existe cuenta/feature habilitada, pero no como default de menor riesgo.

---

## ADR-011 — Seguridad mínima viable (demo-grade)
### Decisión
Se incluirá seguridad **en runtime** y **en pipeline** como parte del valor del proceso:

Runtime:
- CORS restringido
- Rate limiting: **5 transacciones por segundo** por IP para endpoints `join` y `like`, con respuesta `429`
- Validación estricta de inputs
- Upload seguro (tamaño máximo 2MB, tipos permitidos jpeg/png/webp, negar SVG, objectKey no predecible)
- Auditoría mínima (eventos en logs, sin endpoint de consulta)
- Headers de seguridad en frontend (CSP básica, nosniff, frame deny, referrer policy, permissions policy)

Pipeline:
- Secret scanning (gitleaks)
- SCA (npm audit)
- DAST (OWASP ZAP baseline) contra el host público o ambiente demo

### Consecuencias
- Se implementan endpoints admin protegidos con token para crear y eliminar sesiones (solo API, sin UI).
- Se generarán reportes en `./reports` para mostrar en demo.
- Se diseñan límites de payload y controles anti-abuso para sesión remota.

---

## ADR-012 — Pruebas y calidad (demostrables en vivo)
### Decisión
El sistema debe incluir pruebas mínimas automatizadas:
- Unit tests (idempotencia like, validación join, rate limit).
- E2E (Playwright): crear participante, verificar en wall, dar like, verificar incremento.
- Smoke test post-deploy (health + flujo mínimo).

### Consecuencias
- Se requiere entorno Node estable para ejecutar Playwright.
- Se incluyen fixtures (imágenes no sensibles) para pruebas repetibles.
- Se implementan comandos `make dev/test/security` o scripts equivalentes.

---

## ADR-013 — Limitaciones deliberadas por tiempo de demo
### Decisión
Para garantizar completitud en 30 minutos:
- Sin autenticación formal de usuarios (el `participantId` del registro se usa como identidad para votar).
- Sin interfaz gráfica de administración (solo endpoints API para crear/eliminar sesión).
- Sin moderación avanzada (no hay endpoint para ocultar/eliminar participantes individuales).
- Sin WebSockets.
- Sin SQS.
- Sin CloudFront.
- Sin paginación en el Wall (se retornan todos los participantes).
- Sin endpoint de consulta de auditoría (solo logs).
- Sin seed de datos (reset limpio).
- Sin dependencia de servicios de IA en la funcionalidad.

### Consecuencias
- Se documenta explícitamente como "fuera de alcance" para producción.
- Se conserva un camino claro para evolución futura (auth, moderation, realtime, CloudFront, paginación, etc.).

---

## ADR-014 — Catálogo de skills
### Decisión
El catálogo de skills será una **lista fija definida en el código** (constante compartida entre frontend y backend). No se almacena en base de datos ni se expone como endpoint.

### Consecuencias
- Cambiar el catálogo requiere un redespliegue.
- Simplifica la implementación: no hay CRUD de skills ni tabla adicional.
- El frontend renderiza la lista directamente; el backend la usa para validación.

---

## ADR-015 — Identidad del votante = participante registrado
### Decisión
El votante es siempre un **participante registrado**. El `participantId` obtenido en el registro (`POST /join`) se usa como identificador del votante en las requests de like. No existe un `voterId` anónimo separado.

- Solo quien se ha registrado en la sesión (join) puede votar.
- El frontend almacena el `participantId` en **localStorage** tras el registro y lo envía en cada request de like.

### Consecuencias
- No se necesitan cookies ni mecanismos separados para identificar votantes.
- La idempotencia de likes se valida con `participantId (votante) + targetParticipantId + skillId`.
- Se simplifica el modelo: un solo concepto de identidad (participante) en lugar de dos (participante + votante anónimo).
- El backend puede validar que el `participantId` del votante existe en la sesión antes de aceptar el like.
