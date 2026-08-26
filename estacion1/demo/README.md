# SkillWall Live

Aplicación web para eventos en vivo donde los asistentes se registran en una sesión, opcionalmente suben una foto, eligen 3-5 skills y pueden dar **like a las skills** de otros participantes (no a la persona). Wall y leaderboard se actualizan vía polling de 2 s.

El "efecto wow" no está en la app — es el **proceso de desarrollo end-to-end con AIDLC**: requirements → spec → arquitectura → IaC → backend → frontend → deploy → pruebas E2E. **Estación 1 — Cohorte 4 (HardcoreAI)**: este repo parte con la fase INCEPTION completa (requirements, user stories, diseño); tu trabajo es ejecutar la fase CONSTRUCTION con IA y generar las 3 unidades de código hasta dejarlas desplegadas. El prompt de arranque está al final de este README.

## Arquitectura

```
Browser (Next.js 15 @ Vercel)
   │  HTTPS, traceparent
   ▼
API Gateway HTTP v2 (8 rutas, 5 TPS en POST /join, /like)
   │  AWS_PROXY, payload v2
   ▼
Lambda Node 22 (single bundle, esbuild CJS)
   │  AWS SDK v3
   ├─► DynamoDB (single-table: SESSION#, PARTICIPANT#, VOTE#)
   ├─► S3 (fotos via pre-signed PUT/GET, 1 h)
   └─► CloudWatch Logs / OpenTelemetry → New Relic (opcional)
```

3 unidades de desarrollo independientes (las carpetas **no existen aún** — las genera la IA durante la estación):

| Unit | Tech | Deploy |
|---|---|---|
| `infra/` | Terraform >= 1.5, AWS provider ~> 5.0 | `terraform apply` en `us-east-1` |
| `backend/` | Node.js 22, TypeScript, esbuild → CJS, Zod, OTel | `aws lambda update-function-code` |
| `frontend/` | Next.js 15, React 19, Tailwind 4, TS strict | `vercel --prod` |

## Pre-requisitos

| Herramienta | Versión mínima | Para qué |
|---|---|---|
| **Node.js** | 18.19+ (20+ ideal) | Backend build, frontend build |
| **npm** | 9+ | Dependency install |
| **Terraform** | 1.5+ | Provisionar AWS |
| **AWS CLI** | 1.x o 2.x | Deploy Lambda + smoke tests |
| **Vercel CLI** | 50+ | Deploy frontend (`npm i -g vercel`) |
| **jq** | 1.6+ | JSON helpers en scripts |
| **zip** | cualquiera | Empaquetado del bundle Lambda |
| **Cuenta AWS** | con credenciales `aws configure` | Crear ~25 recursos en free tier |
| **Cuenta Vercel** | autenticada con `vercel login` | Deploy frontend |

> ⚠️ **AWS CLI v1**: si lo usas, los scripts ya están adaptados (troubleshooting [#23](troubleshooting.md) y [#24](troubleshooting.md)).
> ⚠️ **`~/.aws/config`** corrupto rompe los scripts — ver troubleshooting [#22](troubleshooting.md).

## Despliegue end-to-end (orden importa)

Esta secuencia es el **bootstrap correcto** documentado en troubleshooting [#31](troubleshooting.md). El dominio de Vercel no existe hasta el primer `vercel --prod`, así que el CORS se actualiza al final.

### 1. Infra (Terraform → AWS)

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # crea el archivo local (gitignored)
# Edita terraform.tfvars y reemplaza admin_token con un secreto real.

terraform init
terraform apply -var-file=terraform.tfvars
# → Plan: 25 to add. Aprueba con 'yes'.
# → Outputs: api_gateway_url, lambda_function_name, dynamodb_table_name, s3_bucket_name
```

> ⚠️ `terraform.tfvars` está en `.gitignore` (puede contener secretos). Usa `terraform.tfvars.example` como plantilla. **Nunca commitees tokens ni llaves.**

### 2. Backend (Lambda code)

```bash
cd backend
./scripts/deploy.sh
# → npm ci → esbuild → zip → update Lambda code → bump DEPLOY_TIMESTAMP (troubleshooting #15)
```

### 3. Seedear la sesión inicial (necesario para que `/join` funcione)

```bash
./scripts/seed-session.sh
# → POST /admin/sessions con sessionCode=LATAM2026
# → 201 Created. Si no haces esto, /join devuelve 404 (troubleshooting #32).
```

Verificación rápida del API:
```bash
API_URL=$(cd ../infra && terraform output -raw api_gateway_url | sed 's:/*$::')
curl "${API_URL}/health"
# → {"status":"ok","dynamodb":"ok","timestamp":"..."}
```

### 4. Frontend (primer deploy a Vercel)

```bash
cd frontend
vercel login        # una vez por cuenta
vercel link --yes --project skillwall-frontend

# Setear env vars (printf, no echo — troubleshooting #5)
./scripts/env-add.sh NEXT_PUBLIC_API_URL "$(cd ../infra && terraform output -raw api_gateway_url | sed 's:/*$::')"
./scripts/env-add.sh NEXT_PUBLIC_SESSION_CODE LATAM2026

./scripts/deploy.sh
# → npm run build → vercel --prod → URL: https://skillwall-frontend.vercel.app
```

> Si el build local falla con `Cannot find native binding` (Tailwind 4 oxide), corre:
> ```bash
> npm install @tailwindcss/oxide-linux-x64-gnu --no-save
> ```
> Detalles en troubleshooting [#27](troubleshooting.md).

### 5. CORS: agregar el dominio Vercel y re-aplicar infra

```bash
cd ../infra
# Editar terraform.tfvars:
#   cors_origins = ["https://skillwall-frontend.vercel.app", "http://localhost:3000"]
terraform apply -var-file=terraform.tfvars -var='admin_token=tu-token-secreto'
# → 3 resources changed (API Gateway + S3 + Lambda env)
```

Sin este paso, el frontend en Vercel ve `CORS error: Origin not allowed` en todos los fetches.

## Validar que todo funciona

1. Abre la URL de Vercel.
2. Llena el form de join: nombre + 3 skills (sin foto está OK).
3. Verifica el wall: aparece tu card con badge **(tú)** y skills disabled (anti self-vote).
4. Abre el mismo URL en otro browser/dispositivo; registra otra persona; dale like a tus skills.
5. El polling de 2 s debe actualizar los counts sin recargar.
6. La pestaña **Leaderboard** debe mostrar top participantes + top skills.

## Tear down (cleanup completo)

```bash
# 1. Vaciar S3 (terraform falla si hay objetos)
aws s3 rm s3://$(cd infra && terraform output -raw s3_bucket_name) --recursive

# 2. Destruir AWS
cd infra
terraform destroy -var-file=terraform.tfvars -var='admin_token=cualquier-cosa'

# 3. Resetear el setting account-level de API Gateway (no se borra automáticamente)
aws apigateway update-account --patch-operations 'op=replace,path=/cloudwatchRoleArn,value='

# 4. Borrar el proyecto Vercel
cd ../frontend
printf 'y\n' | vercel project rm skillwall-frontend
rm -rf .vercel
```

Costo del demo en free tier: **~$0** mientras dure el evento y todo se destruye al final.

## Estructura del repo

```
.
├── README.md                              ← este archivo
├── adr.md                                 ← decisiones arquitectónicas (input para INCEPTION)
├── requirement.md                         ← PRD (input para INCEPTION)
├── troubleshooting.md                     ← 33 lecciones aprendidas
├── .claude/                               ← Workflow AIDLC para Claude Code
│   ├── CLAUDE.md
│   └── settings.json                      ← Allowlist restringido del proyecto
├── .aidlc-rule-details/                   ← Reglas detalladas por fase AIDLC
├── aidlc-docs/                            ← Documentos del flujo AIDLC
│   ├── audit.md                           ← Log de interacción usuario↔IA (lo alimenta el flujo)
│   ├── aidlc-state.md                     ← Checkpoint del workflow
│   ├── inception/                         ← Requirements + design (inmutable, no regenerar)
│   └── construction/                      ← Diseños per-unit (los plans los genera la IA)
├── infra/                                 ← Unidad 1: Terraform (la genera la IA; solo trae terraform.tfvars.example)
├── backend/                               ← Unidad 2: Lambda Node 22 (la genera la IA)
└── frontend/                              ← Unidad 3: Next.js 15 (la genera la IA)
```

## Troubleshooting

Todas las lecciones aprendidas en las cohortes anteriores están en [`troubleshooting.md`](troubleshooting.md) — 33 issues indexados por unidad, fase y prioridad. Los más críticos:

- **Backend**: #1 (CJS bundle), #2 (base64 body), #3 (IAM completo), #7 #8 (jest config), #13 (photo opcional), #15 (cold start), #20 (CORS solo en API GW), #22-#26 (AWS CLI quirks)
- **Frontend**: #5 #6 #19 (Vercel env vars con printf), #14 (trailing slash), #16 (CSP dinámico), #27 (oxide native binding), #28 (Next 15 vs Node 18), #29 (ESLint flat config), #30 (`<img>` vs `next/image`)
- **Infra**: #21 (cors_origins list), #22 (~/.aws/config corrupto), #31 (bootstrap order), #32 (seed session), #33 (throttling de lecturas + límite de concurrencia Lambda en cuentas nuevas)

## Cómo arrancar la estación

Abre Claude Code en la raíz de este directorio y pega el siguiente prompt — el workflow de `.claude/CLAUDE.md` hace el resto (te irá pidiendo aprobación en cada etapa):

```text
Inicia el flujo AIDLC. Ten en cuenta que la fase de INCEPTION ya está completa
(revisa aidlc-docs/aidlc-state.md): requirements, user stories, application design
y units ya existen en aidlc-docs/. Vamos a ejecutar la fase de CONSTRUCTION desde
cero para las 3 unidades en este orden: infra (Terraform → AWS), backend (Lambda
Node.js → AWS) y frontend (Next.js → Vercel).

Empieza con la unidad infra: genera el plan de code generation, espera mi
aprobación y luego genera el código en /infra. Usa los diseños existentes en
aidlc-docs/construction/{unidad}/ como referencia (no los regeneres) y aplica la
revisión de troubleshooting.md después de generar el código de cada unidad
(infra: #21 y #31; backend: #1, #2, #3, #7, #8; frontend: #5, #6, #14, #16, #19).
```

## Licencia

Material de entrenamiento HardcoreAI / 30X — uso interno educativo.
