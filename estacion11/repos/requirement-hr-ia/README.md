# EntreVista AI — Plataforma de Entrevistas Agenticas

Plataforma de screening conversacional via Telegram para reclutamiento de alto volumen en LATAM. Utiliza agentes de IA para conducir entrevistas, evaluar candidatos y generar reportes para reclutadores.

## Arquitectura

```
webapp/              Next.js 16 (App Router, React 19, TypeScript) instrumentada con OpenTelemetry
scripts/             Bootstrap de LocalStack (tablas DynamoDB)
grafana-dashboards/  Dashboards de Grafana como codigo (JSON) — Grafana los carga via provisioning
```

> Esta copia es la version de la **Clase 11 (Observabilidad)** del producto EntreVista AI: trae la webapp instrumentada, los dashboards y el bootstrap local. La infraestructura Terraform y la documentacion AI-DLC viven en el repo completo del producto y no hacen falta para esta sesion.

## Quick Start (Desarrollo Local)

> **Atajo para la demo de la Clase 11:** `scripts/demo-up.sh` levanta todo en orden (Docker, LocalStack, tablas, otel-stack, webapp, bot de Telegram) y deja una campaña activa lista para el simulador y para Telegram. Es idempotente: ejecútalo antes de la sesión y otra vez si algo se cae. `scripts/demo-up.sh status` solo verifica.

### Prerrequisitos

- Node.js 20+
- Docker (para LocalStack y otel-stack)
- AWS CLI (lo usa `scripts/localstack-init.sh`)
- Una `OPENAI_API_KEY` válida (el chat y la evaluación llaman a OpenAI). Cómo obtenerla: [Llaves necesarias](#llaves-necesarias-openai-y-telegram)
- Opcional: un bot de Telegram propio (misma sección)

### Llaves necesarias (OpenAI y Telegram)

Solo una llave es obligatoria: la de OpenAI. La de Telegram es opcional; sin ella la demo funciona igual con el simulador.

**OpenAI (obligatoria, 5 minutos)**

1. Entra a [platform.openai.com](https://platform.openai.com/) y crea una cuenta o inicia sesión.
2. En **Settings → Billing** agrega un método de pago o crédito. Sin saldo la API responde `429 insufficient_quota` aunque la llave sea válida.
3. Ve a [platform.openai.com/api-keys](https://platform.openai.com/api-keys) y pulsa **Create new secret key**. Ponle un nombre (por ejemplo `entrevista-ai-local`) y copia la llave: empieza por `sk-` y **solo se muestra una vez**.
4. Pégala en `webapp/.env.local` como `OPENAI_API_KEY=sk-...`.
5. Costo de referencia: la app usa `gpt-4o` y una entrevista completa de prueba cuesta unos pocos centavos de dólar. En **Billing → Limits** puedes fijar un tope mensual.

**Telegram (opcional, 3 minutos)**

1. En Telegram busca **@BotFather** (el bot oficial para crear bots, con verificación).
2. Envíale `/newbot`. Te pide un **nombre** para mostrar (por ejemplo `EntreVista AI Dev`) y un **usuario** único que debe terminar en `bot` (por ejemplo `entrevista_tunombre_bot`).
3. BotFather responde con el token, con la forma `123456789:AAF...`. Cópialo.
4. En `webapp/.env.local` pon `TELEGRAM_BOT_TOKEN=123456789:AAF...` y `TELEGRAM_BOT_USERNAME=entrevista_tunombre_bot` (sin `@`).
5. Arranca el bot con `npm run telegram` (sección 4) y entra por `https://t.me/<usuario>?start=<campaignId>`.

**Cuida las llaves**

- `.env.local` está en `.gitignore`: no lo subas al repo ni lo pegues en un chat o una captura de pantalla.
- Si una llave se filtra: en OpenAI bórrala desde la página de API keys y crea otra; en Telegram envía `/revoke` a BotFather.
- `NEXTAUTH_SECRET` puede ser cualquier cadena larga; una forma rápida de generarla es `openssl rand -base64 32`.

### 1. Levantar infraestructura local

La webapp guarda campanas, candidatos y conversaciones en DynamoDB. En desarrollo DynamoDB corre en LocalStack (puerto `4566`); sirve cualquier LocalStack, por ejemplo el `docker-compose.yml` del repo `iac-infra` de la Estación 9 (`estacion9/repos/iac-infra`).

```bash
# Con LocalStack ya corriendo en localhost:4566, crear tablas, secretos y tenant de prueba
./scripts/localstack-init.sh
```

### 2. Levantar el stack de observabilidad

El stack de OTel (Collector, Tempo, Prometheus, Loki, Grafana) es el repo hermano `../otel-stack/`. La webapp se conecta a su red Docker `otel-stack_otel-net` cuando corre en contenedor, o al Collector en `localhost:4318` cuando corre con `npm run dev`.

```bash
# Desde el directorio ../otel-stack/
docker compose up -d
```

Grafana carga automaticamente los cuatro dashboards de `grafana-dashboards/` (ver [Dashboards de Grafana](#dashboards-de-grafana)).

Servicios disponibles:

| Servicio   | Puerto | URL                    |
|------------|--------|------------------------|
| Grafana    | 3001   | http://localhost:3001   |
| Prometheus | 9090   | http://localhost:9090   |
| Tempo      | 3200   | http://localhost:3200   |
| Loki       | 3100   | http://localhost:3100   |
| Collector  | 4318   | http://localhost:4318   |

### 3. Levantar la webapp

```bash
cd webapp
cp .env.example .env.local    # editar: OPENAI_API_KEY (obligatoria). Deja NEXT_PUBLIC_DEV_MODE=true para el login local test/test
npm install
npm run dev    # http://localhost:3000
```

Al arrancar, la consola muestra `[OTel] Instrumentation started — service: hr-ia-webapp, collector: http://localhost:4318`. Navega la app y chatea con el agente: los traces aparecen en Grafana → Explore → Tempo y las metricas del LLM en el dashboard **Agente LLM**.

### 4. Levantar el bot de Telegram (opcional)

Telegram entrega los mensajes llamando a un webhook publico, y `localhost` no lo es. Por eso en desarrollo el bot corre como **proceso aparte en long polling**: es el bot quien le pregunta a Telegram si hay mensajes nuevos.

```bash
cd webapp
# .env.local necesita TELEGRAM_BOT_TOKEN y TELEGRAM_BOT_USERNAME: ver "Llaves necesarias" más arriba
npm run telegram
```

La consola muestra `[OTel] Instrumentation started — service: hr-ia-webapp, instance: telegram-bot` y luego `Bot @<tu_bot> is running!`. Abre el enlace de la campana (`https://t.me/<tu_bot>?start=<campaignId>`, boton **Copiar enlace de Telegram** en el detalle de la campana) y pulsa **Iniciar**.

A tener en cuenta:

- **Sin proceso, sin respuesta.** Si el bot no contesta, lo primero es revisar que `npm run telegram` siga corriendo.
- **La conversacion arranca con el enlace de la campana.** Un "hola" suelto recibe "No tienes una entrevista activa".
- **Un solo proceso por token.** Dos procesos con el mismo bot hacen que Telegram responda `409 Conflict`.
- **Es otro proceso, asi que lleva su propio arranque de OpenTelemetry** (`webapp/scripts/otel-bootstrap.ts`). `src/instrumentation.ts` solo lo ejecuta Next.js. Usa el mismo `service.name` que la webapp y `service.instance.id = telegram-bot`, de modo que aparece en los mismos dashboards y se puede filtrar con `instance="telegram-bot"`.
- **Cada mensaje es un trace** con raiz `telegram /start` o `telegram message`, y dentro los spans `DynamoDB.*` y `llm.conversation`.
- **Las llamadas a `api.telegram.org` no se instrumentan** a proposito: la URL lleva el token del bot y terminaria como atributo de un span.

Sin bot de Telegram la demo funciona igual con el simulador (`POST /api/simulator`).

### Credenciales de desarrollo

| Campo    | Valor                  |
|----------|------------------------|
| Usuario  | `test`                 |
| Password | `test`                 |
| Tenant   | `tenant-dev-001`       |
| Email    | `test@entrevista.dev`  |
| Grafana  | `admin` / `admin` (o anonimo como Viewer) |

## Estructura del Proyecto

```
webapp/src/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Rutas autenticadas
│   │   ├── campaigns/            #   Gestion de campanas
│   │   ├── review/               #   Cola de revision de candidatos
│   │   └── settings/             #   Configuracion
│   ├── api/                      # API Routes
│   │   ├── auth/                 #   NextAuth endpoints
│   │   ├── campaigns/            #   CRUD campanas
│   │   ├── candidates/           #   Candidatos + review
│   │   ├── evaluations/          #   Evaluaciones
│   │   ├── log/                  #   Receptor de logs del cliente
│   │   ├── telegram/webhook/     #   Webhook de Telegram
│   │   └── health/               #   Health check
│   └── login/                    # Pagina de login
├── application/                  # Logica de negocio (use cases)
├── domain/                       # Entidades, reglas de dominio
├── infrastructure/
│   ├── auth/                     # NextAuth, tenant context
│   ├── dynamodb/                 # Cliente DynamoDB + 6 repositorios
│   ├── logging/                  # Sistema de logging estructurado
│   ├── telemetry/                # OpenTelemetry (traces, metricas, sesion)
│   ├── openai/                   # Cliente de chat con OpenAI
│   └── telegram/                 # Bot de Telegram + webhook
├── components/
│   ├── layout/                   # Sidebar, Header, SessionProvider, SessionTraceInit
│   ├── shared/                   # Componentes reutilizables
│   └── ui/                       # Shadcn-ui
└── shared/                       # Tipos, constantes, utilidades
```

## Datos — Tablas DynamoDB

En desarrollo las tablas viven en LocalStack y las crea `scripts/localstack-init.sh`. En AWS las crea el modulo `dynamodb` del Terraform del producto (fuera de esta copia).

| Tabla          | Partition Key | Sort Key         | GSIs                |
|----------------|---------------|------------------|---------------------|
| conversations  | tenantId      | conversationId   | ByTelegram          |
| campaigns      | tenantId      | campaignId       | —                   |
| candidates     | tenantId      | candidateId      | ByCampaign, ByTelegram |
| evaluations    | tenantId      | conversationId   | —                   |
| audit-events   | tenantId      | eventId          | —                   |
| consent        | tenantId      | candidateId      | —                   |

Prefijo de tablas: `entrevista-ai-local-*` (configurado via `DYNAMODB_TABLE_PREFIX`).

---

## Observabilidad (OpenTelemetry)

La aplicacion implementa los tres pilares de observabilidad usando OpenTelemetry, con un stack completo de Grafana (Tempo, Prometheus, Loki) para visualizacion.

### Arquitectura de Telemetria

```
                          ┌─────────────────────────────────────────┐
                          │            BROWSER (Client)             │
                          │                                         │
                          │  clientLogger ──► POST /api/log ────┐   │
                          │  SessionTraceInit ──► fetch patch   │   │
                          │    (x-session-trace-id header)      │   │
                          └─────────────────────────────────────┼───┘
                                                                │
                          ┌─────────────────────────────────────▼───┐
                          │         NEXT.JS SERVER (Node.js)        │
                          │                                         │
                          │  instrumentation.ts                     │
                          │   ├── NodeSDK (auto-instrumentations)   │
                          │   ├── HostMetrics (CPU, mem, net)       │
                          │   └── ProcessMetrics (heap, ELU, RSS)   │
                          │                                         │
                          │  logger.ts ──► OTel Logs API            │
                          │  enrichActiveSpan() ──► span attrs      │
                          │  apiHandler() ──► span + log context    │
                          └──────────────┬──────────────────────────┘
                                         │ OTLP HTTP (:4318)
                          ┌──────────────▼──────────────────────────┐
                          │        OTEL COLLECTOR                   │
                          │  receivers: otlp (gRPC + HTTP)          │
                          │  processors: batch, resource            │
                          │  exporters:                             │
                          │   ├── traces  → Tempo (:4317)           │
                          │   ├── metrics → Prometheus (:9090)      │
                          │   └── logs    → Loki (:3100)            │
                          └─────────────────────────────────────────┘
                                         │
                          ┌──────────────▼──────────────────────────┐
                          │          GRAFANA (:3001)                 │
                          │  Datasources: Tempo, Prometheus, Loki   │
                          │  Correlacion: logs ↔ traces ↔ metricas  │
                          │  Dashboards: 4 JSON provisionados       │
                          └─────────────────────────────────────────┘
```

### Instrumentacion (instrumentation.ts)

El archivo `src/instrumentation.ts` es detectado automaticamente por Next.js al iniciar el servidor. Configura:

- **Traces**: `OTLPTraceExporter` → Collector → Tempo
- **Metricas**: `PeriodicExportingMetricReader` cada **5 segundos** → Collector → Prometheus
- **Logs**: `BatchLogRecordProcessor` → Collector → Loki
- **Auto-instrumentaciones**: HTTP, fetch, runtime-node (event loop, GC). Deshabilitadas: fs, dns, net.
- **Host Metrics** (`@opentelemetry/host-metrics`): CPU, memoria del sistema, network I/O, disco.
- **Process Metrics** (custom `ObservableGauge`): heap, RSS, CPU del proceso, event loop utilization, active handles.

### Metricas Disponibles en Prometheus

#### Host (sistema operativo)

| Metrica                        | Descripcion                             |
|--------------------------------|-----------------------------------------|
| `system_cpu_utilization`       | % de uso de CPU por core                |
| `system_cpu_time_seconds_total`| Tiempo de CPU por estado (user/system/idle) |
| `system_memory_usage`          | Memoria del sistema (used/free/cached)  |
| `system_memory_utilization`    | % de uso de memoria                     |
| `system_network_io_total`      | Bytes TX/RX por interfaz                |
| `system_network_errors_total`  | Errores de red                          |
| `system_network_dropped_total` | Paquetes descartados                    |

#### Proceso Node.js

| Metrica                              | Descripcion                                   |
|--------------------------------------|-----------------------------------------------|
| `process_memory_heap_used_bytes`     | Heap V8 en uso                                |
| `process_memory_heap_total_bytes`    | Heap total asignado                           |
| `process_memory_rss_bytes`           | Resident Set Size del proceso                 |
| `process_memory_external_bytes`      | Memoria de objetos C++ enlazados a JS         |
| `process_memory_array_buffers_bytes` | Memoria de ArrayBuffers                       |
| `process_cpu_user_microseconds`      | Tiempo CPU usuario acumulado                  |
| `process_cpu_system_microseconds`    | Tiempo CPU sistema acumulado                  |
| `process_uptime_seconds`             | Uptime del proceso                            |
| `process_event_loop_utilization_ratio` | Ratio de uso del event loop (0-1)           |
| `process_active_handles`             | Handles activos (sockets, timers)             |

#### Event Loop & GC (auto-instrumentacion runtime-node)

| Metrica                                 | Descripcion                          |
|-----------------------------------------|--------------------------------------|
| `nodejs_eventloop_delay_mean_seconds`   | Latencia media del event loop        |
| `nodejs_eventloop_delay_p50_seconds`    | p50 del event loop                   |
| `nodejs_eventloop_delay_p90_seconds`    | p90 del event loop                   |
| `nodejs_eventloop_delay_p99_seconds`    | p99 del event loop                   |
| `nodejs_eventloop_utilization_ratio`    | Utilizacion del event loop           |

#### HTTP (auto-instrumentacion)

| Metrica                                    | Descripcion                       |
|--------------------------------------------|-----------------------------------|
| `http_server_duration_milliseconds_*`      | Latencia de requests entrantes    |
| `http_client_duration_milliseconds_*`      | Latencia de requests salientes    |

#### Negocio (custom en chat-client.ts)

| Metrica                  | Descripcion                             |
|--------------------------|-----------------------------------------|
| `llm.request.duration`   | Histogram de latencia de llamadas a OpenAI |
| `llm.tokens.total`       | Counter de tokens consumidos            |
| `llm.request.errors`     | Counter de errores de LLM               |

### Logging Estructurado

#### Server-side (`logger.ts`)

```typescript
import { logger } from '@/infrastructure/logging/logger';

logger.info('campaigns-page', 'Loading campaigns', {
  tenantId: 'tenant-dev-001',
  sessionTraceId: 'st-abc123',
  context: { userId: 'dev-user-001', count: 5 },
});
```

Cada log emite:
1. **Console**: JSON estructurado (stdout)
2. **OTel Logs API**: Log record con atributos para Loki:
   - `log.service`, `log.tenant_id`, `session.trace.id`
   - `trace_id`, `span_id` (del span activo, para correlacion con Tempo)
   - `context.*` (campos aplanados para filtrado en Loki)

#### Client-side (`clientLogger.ts`)

```typescript
import { clientLogger } from '@/infrastructure/logging/client-logger';

clientLogger.info('sidebar', 'Navigation click', {
  target: '/campaigns',
  from: '/review',
});
```

Los logs del browser se envian via `POST /api/log` al servidor, que los enruta al pipeline de OTel. Automaticamente incluyen:
- `x-session-trace-id` header (via fetch patch)
- `source: client`, `userAgent`

#### Componentes con logging

| Componente          | Servicio          | Eventos logueados                              |
|---------------------|-------------------|-------------------------------------------------|
| auth-options.ts     | `auth`            | Login attempt, success/failure, JWT, session    |
| login/page.tsx      | `login-page`      | Form submit, SSO, error display                 |
| sidebar.tsx         | `sidebar`         | Navigation clicks (from/to)                     |
| header.tsx          | `header`          | Logout con sessionTraceId                       |
| campaigns/page.tsx  | `campaigns-page`  | Load, count, render                             |
| campaigns/[id]      | `campaign-detail` | Fetch, load, copy link                          |
| campaigns/new       | `new-campaign`    | Creation start/success/failure                  |
| review/page.tsx     | `review-queue`    | Fetch con filtro, load count                    |
| review/[id]         | `candidate-review`| Decision submit, success/failure, AI disagreement |

### Correlacion de Trazas por Sesion

El sistema genera un `sessionTraceId` al login y lo propaga en cada request para correlacionar **todas las trazas de una sesion** (login → navegacion → logout).

#### Flujo

```
Login exitoso
  └─► SessionTraceInit genera "st-xxx" → sessionStorage
       └─► Patch de window.fetch inyecta header x-session-trace-id
            └─► Cada request del browser lleva el header
                 └─► Server: apiHandler / /api/log lee el header
                      ├─► enrichActiveSpan() → session.trace.id en el span
                      └─► logger → sessionTraceId en los logs de Loki
Logout
  └─► Log "Session ended" con sessionTraceId → clearSessionTraceId()
```

#### Atributos en cada span (Tempo)

| Atributo            | Ejemplo           | Descripcion                  |
|---------------------|--------------------|------------------------------|
| `session.trace.id`  | `st-m1abc-xyz789`  | ID unico de la sesion        |
| `user.id`           | `dev-user-001`     | ID del usuario               |
| `tenant.id`         | `tenant-dev-001`   | ID del tenant                |
| `user.email`        | `test@entrevista.dev` | Email del usuario         |
| `app.route`         | `GET /campaigns`   | Ruta de la aplicacion        |

#### Busqueda en Grafana

**Tempo (TraceQL)**:
```
{ span.session.trace.id = "st-m1abc-xyz789" }
{ span.user.email = "test@entrevista.dev" }
{ span.tenant.id = "tenant-dev-001" }
```

**Loki (LogQL)** — los atributos del log (`trace_id`, `log_service`, `context_*`) son structured metadata, se filtran con `| campo="valor"`:
```
{service_name="hr-ia-webapp"} |= `st-m1abc-xyz789`
{service_name="hr-ia-webapp"} |= `test@entrevista.dev`
{service_name="hr-ia-webapp"} | log_service="openai"
{service_name="hr-ia-webapp"} | trace_id="<TRACE_ID>"
```

### Dashboards de Grafana

Cuatro dashboards versionados como JSON en `grafana-dashboards/`. Son **codigo**: viven junto a la app que instrumentan, se revisan en PRs y `otel-stack` los monta en Grafana via provisioning, sin importar nada a mano.

| Dashboard                  | UID                    | Contenido                                          |
|----------------------------|------------------------|-----------------------------------------------------|
| **Host Metrics**           | `host-metrics-hr-ia`   | CPU utilization, memory usage/gauge, network I/O, errors |
| **Next.js App**            | `nextjs-app-hr-ia`     | Heap, RSS, event loop delay, HTTP latency (p50/p90/p99), active handles |
| **Session Traces Explorer**| `traces-explorer-hr-ia`| Busqueda de trazas por sesion/usuario/tenant, logs correlacionados, user journey |
| **Agente LLM**             | `llm-agent`            | Latencia de inferencia P50/P95/P99 por modelo y operacion, tokens por hora (entrada/salida), tokens por llamada, errores y tasa de error del modelo |

El dashboard **Agente LLM** se alimenta de las tres metricas custom de `chat-client.ts`. Al pasar por el Collector a Prometheus los nombres cambian de puntos a guiones bajos y reciben sufijo de unidad:

| Metrica OTel (codigo)   | Serie en Prometheus                            |
|-------------------------|-------------------------------------------------|
| `llm.request.duration`  | `llm_request_duration_milliseconds_{bucket,sum,count}` |
| `llm.tokens.total`      | `llm_tokens_total` (label `llm_token_type`)     |
| `llm.request.errors`    | `llm_request_errors_total`                      |

#### Como se cargan

`../otel-stack/docker-compose.yml` monta esta carpeta en `/var/lib/grafana/dashboards` y el provider `grafana/provisioning/dashboards/dashboards.yaml` la lee al arrancar y la recarga cada 10 s. Para cargar los dashboards de otro producto: `DASHBOARDS_DIR=/ruta/a/tus/json docker compose up -d`.

Si prefieres importarlos a mano (por ejemplo en un Grafana que no es el del stack):

```bash
curl -X POST http://localhost:3001/api/dashboards/db \
  -H "Content-Type: application/json" \
  -u admin:admin \
  -d "{\"dashboard\": $(cat grafana-dashboards/llm-agent.json), \"overwrite\": true}"
```

#### Datasources requeridos

Los dashboards asumen los siguientes UIDs (configurados en otel-stack):

| Datasource | UID          | Tipo       |
|------------|--------------|------------|
| Prometheus | `prometheus` | prometheus |
| Tempo      | `tempo`      | tempo      |
| Loki       | `loki`       | loki       |

### Archivos de Telemetria

| Archivo                                      | Descripcion                                       |
|----------------------------------------------|---------------------------------------------------|
| `src/instrumentation.ts`                     | Hook de Next.js — configura NodeSDK, exporters, host/process metrics |
| `src/infrastructure/telemetry/process-metrics.ts` | Metricas de proceso Node.js (ObservableGauge)  |
| `src/infrastructure/telemetry/session-trace.ts`   | Genera/lee/limpia sessionTraceId en sessionStorage |
| `src/infrastructure/telemetry/enrich-span.ts`     | Inyecta session/user/tenant attrs en span activo   |
| `src/infrastructure/logging/logger.ts`       | Logger server-side con dual output (console + OTel) |
| `src/infrastructure/logging/client-logger.ts`| Logger client-side via POST /api/log               |
| `src/components/layout/session-trace-init.tsx`| Componente que inicializa trace ID y patchea fetch  |
| `src/app/api/log/route.ts`                   | Endpoint receptor de logs del browser              |

### Variables de Entorno (Observabilidad)

| Variable                         | Default                  | Descripcion                          |
|----------------------------------|--------------------------|--------------------------------------|
| `OTEL_EXPORTER_OTLP_ENDPOINT`   | `http://localhost:4318`  | URL del OTel Collector               |
| `OTEL_SERVICE_NAME`             | `hr-ia-webapp`           | Nombre del servicio en trazas        |

---

## Stack Tecnologico

| Capa             | Tecnologia                                     |
|------------------|-------------------------------------------------|
| Frontend         | Next.js 16, React 19, Tailwind CSS 4, Shadcn-ui |
| Backend          | Next.js API Routes, NextAuth 4 (JWT)            |
| Base de datos    | DynamoDB (LocalStack en desarrollo)              |
| IA               | OpenAI GPT-4o (chat + evaluacion)                |
| Mensajeria       | Telegram (Grammy SDK)                            |
| Auth (prod)      | AWS Cognito                                      |
| Infra            | Terraform, ECS Fargate, ALB, VPC                 |
| Observabilidad   | OpenTelemetry, Grafana, Tempo, Prometheus, Loki  |
| Testing          | Vitest, Testing Library                          |
