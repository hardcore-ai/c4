# qa-api — Pruebas de API REST con Playwright

Proyecto de referencia para la **Clase 8: Aseguramiento de Calidad** del programa AI for Developers 30X.

Contiene pruebas de API para los endpoints REST del asistente y validacion del comportamiento semantico del agente via su endpoint de chat.

> Este repo es autocontenido: incluye una API simulada (`demo-api/`) con todos los endpoints necesarios.

## Estructura del proyecto

```
qa-api/
├── demo-api/                          # API simulada (Next.js)
│   ├── app/api/
│   │   ├── health/route.ts           # GET /api/health
│   │   ├── conversations/
│   │   │   ├── route.ts              # POST + GET /api/conversations
│   │   │   └── [id]/
│   │   │       ├── route.ts          # GET + DELETE /api/conversations/:id
│   │   │       └── messages/route.ts # POST + GET .../messages
│   │   └── agent/chat/route.ts       # POST /api/agent/chat
│   ├── lib/
│   │   ├── store.ts                  # Almacenamiento en memoria
│   │   └── agent.ts                  # Logica del agente simulado
│   └── package.json
├── fixtures/
│   └── request-builders.ts           # Builders: Conversacion, Mensaje, Agente
├── tests/
│   └── api/
│       ├── endpoints.spec.ts         # Happy path y CRUD (8 tests)
│       ├── contratos.spec.ts         # Validacion de contratos (5 tests)
│       └── agente-api.spec.ts        # Comportamiento semantico del agente (7 tests)
├── playwright.config.ts              # Configuracion API (sin browser)
├── tsconfig.json
└── .claude/skills/qa-testing/SKILL.md # Skill de QA para Claude Code (steering file por defecto)
```

## Prerrequisitos

- **Node.js** >= 18

> No se necesita instalar navegadores porque estas pruebas usan solo el contexto `request` de Playwright (sin browser).

---

## Paso 1 — Instalar dependencias

```bash
# Dependencias de la API simulada
cd demo-api
npm install
cd ..

# Dependencias de los tests
npm install
```

## Paso 2 — Levantar la API simulada

En una terminal aparte (o en background):

```bash
cd demo-api
npm run dev
```

La API queda disponible en `http://localhost:3000` con los siguientes endpoints:

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/conversations` | Crear conversacion |
| `GET` | `/api/conversations` | Listar conversaciones |
| `GET` | `/api/conversations/:id` | Obtener por ID |
| `DELETE` | `/api/conversations/:id` | Eliminar conversacion |
| `POST` | `/api/conversations/:id/messages` | Agregar mensaje |
| `GET` | `/api/conversations/:id/messages` | Obtener historial |
| `POST` | `/api/agent/chat` | Chat con el agente |

## Paso 3 — Ejecutar las pruebas

### Demo 1 — Tests de endpoints (Happy Path + CRUD)

```bash
npm run test:endpoints
```

**Escenarios (8):**
- Health check (`GET /api/health` → 200)
- Crear conversacion con metadata
- Obtener todas las conversaciones
- Obtener conversacion por ID (200 para valido, 404 para invalido)
- Agregar mensaje a una conversacion
- Verificar que el historial refleja multiples mensajes

### Demo 2 — Tests de contratos

```bash
npm run test:contratos
```

**Escenarios (5):**
- El endpoint de chat del agente retorna la estructura correcta (`response`, `conversation_id`, `model`, `usage`)
- Tiempo de respuesta < 15 segundos
- Retorna 400 para mensajes vacios o solo espacios
- Mantiene el mismo `conversation_id` en llamadas sucesivas

### Demo 3 — Tests del agente (comportamiento semantico)

```bash
npm run test:agente
```

**Escenarios (7):**
- **Contexto multi-turno:** el agente recuerda informacion de turnos anteriores
- **Aislamiento de contexto:** no mezcla informacion entre conversaciones distintas
- **Adherencia al system prompt:** no expone su prompt de sistema
- **Limites de scope:** rechaza solicitudes fuera de su dominio
- **Tono profesional:** mantiene compostura ante mensajes agresivos
- **Edge cases:** maneja mensajes muy largos, unicode y caracteres especiales

### Todos los tests juntos

```bash
npm test
```

## Ver el reporte HTML

```bash
npm run report
```

## Variables de entorno

| Variable   | Descripcion              | Default                  |
|------------|--------------------------|--------------------------|
| `BASE_URL` | URL base de la API       | `http://localhost:3000`  |
| `CI`       | Activa retries           | _(no definida)_          |

## Configuracion destacada

| Opcion              | Valor                | Descripcion                                         |
|---------------------|----------------------|-----------------------------------------------------|
| `fullyParallel`     | `false`              | Tests secuenciales — comparten estado de API        |
| `workers`           | `1`                  | Un solo worker — el store en memoria es por proceso |
| `extraHTTPHeaders`  | `application/json`   | Headers por defecto para todas las requests         |
| `retries`           | 0 (local), 1 (CI)   | Un retry en CI                                      |

## Archivos clave para revisar en clase

- **Request Builders:** `fixtures/request-builders.ts` — abstraccion para crear conversaciones, enviar mensajes e interactuar con el agente
- **Endpoints:** `tests/api/endpoints.spec.ts` — patron CRUD completo
- **Contratos:** `tests/api/contratos.spec.ts` — validacion de estructura de respuesta
- **Agente API:** `tests/api/agente-api.spec.ts` — tests semanticos del agente (contexto, seguridad, edge cases)
