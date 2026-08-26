# Troubleshooting — SkillWall Live

Lecciones aprendidas durante el desarrollo y despliegue del proyecto. Referencia para futuros proyectos con stack similar (Next.js + Lambda + API Gateway + DynamoDB + Terraform).

**Uso**: Durante la ejecución de CONSTRUCTION phase, consulta el índice abajo para identificar qué lecciones aplican a tu unidad de trabajo.

---

## Index — By Unit & Status

### Legend
- ✅ **Applied**: Incorporada en construcción (cohorte1 2026-03-02 o cohorte2 2026-05-11)
- ⏳ **Pending**: Aún no ejecutada, debe aplicarse en próxima ronda
- 🔴 **Critical**: Bloqueador de build/test si no se aplica
- 📌 **Reference**: Lección sin issue directo pero relevante para debugging

### Backend Unit Issues
| # | Problem | Status | Phase | Priority |
|---|---------|--------|-------|----------|
| 1 | Lambda ESM vs CJS bundle | ✅ Applied | Development | 🔴 Critical |
| 2 | API GW HTTP v2 base64-encoded body | ✅ Applied | Development | 🔴 Critical |
| 3 | IAM permissions missing (DescribeTable, TransactWriteItems) | ✅ Applied | Deployment | 🔴 Critical |
| 7 | Jest + Node 22 dynamic import crash | ✅ Applied | Testing | 🔴 Critical |
| 8 | Jest env var capture order | ✅ Applied | Testing | 🔴 Critical |
| 13 | Backend validation: optional photoObjectKey | ✅ Applied | Development | ✅ High |
| 15 | Cold start after IAM change | ✅ Applied (cohorte2) | Deployment | ⚠️ Medium |
| 18 | Race condition Playwright router.replace | ⏳ Pending | Testing | ⚠️ Medium |
| 23 | AWS CLI v1: `--no-cli-pager` / `--cli-binary-format` unsupported | ✅ Applied (cohorte2) | Deployment | ⚠️ Medium |
| 24 | AWS CLI v1: `--environment Variables=<json>` shorthand fails | ✅ Applied (cohorte2) | Deployment | ⚠️ Medium |
| 26 | TS: DocumentClient `QueryCommandOutput.Items` type narrowing | ✅ Applied (cohorte2) | Development | ✅ High |

**Backend Summary**: All critical issues applied. Issue #18 may occur during E2E testing phase.

---

### Frontend Unit Issues
| # | Problem | Status | Phase | Priority |
|---|---------|--------|-------|----------|
| 5 | Vercel env var newline (echo vs printf) | ✅ Applied (cohorte2) | Deployment | 🔴 Critical |
| 6 | NEXT_PUBLIC_* build-time only | ✅ Applied (cohorte2) | Deployment | 🔴 Critical |
| 11 | Playwright: Chromium segfaults | ⏳ Pending | Testing | ⚠️ Medium |
| 12 | Playwright navigation race condition | ⏳ Pending | Testing | ⚠️ Medium |
| 14 | API URL trailing slash | ✅ Applied (cohorte2) | Development | ✅ High |
| 16 | CSP hardcoded blocks WebKit requests | ✅ Applied (cohorte2) | Development | 🔴 Critical |
| 17 | Playwright page.route() glob wildcard | ⏳ Pending | Testing | ⚠️ Medium |
| 19 | Vercel env var NEXT_PUBLIC_API_URL incorrect | ✅ Applied (cohorte2) | Deployment | 🔴 Critical |
| 27 | Tailwind 4 `@tailwindcss/oxide` native binding missing | ✅ Applied (cohorte2) | Development | 🔴 Critical |
| 28 | Next.js 16 requires Node 22+ (Next 15 OK on Node 18) | ✅ Applied (cohorte2) | Development | ⚠️ Medium |
| 29 | ESLint flat config doesn't auto-ignore generated files | ✅ Applied (cohorte2) | Development | ⚠️ Medium |
| 30 | `<img>` vs `next/image` with S3 pre-signed URLs | ✅ Applied (cohorte2) | Development | 📌 Reference |
| 31 | CORS chicken-and-egg: Vercel URL desconocido antes del primer deploy | ✅ Applied (cohorte2) | Deployment | ✅ High |
| 32 | `/join` retorna 404 si la sesión no fue seedeada previamente | ✅ Applied (cohorte2) | Deployment / Testing | 🔴 Critical |

**Frontend Summary**: All critical dev/deploy issues applied in cohorte2. Issues #11, #12, #17 pending for E2E testing phase. First-deploy bootstrap order documented in #31; session seeding documented in #32.

---

### Infrastructure Unit Issues
| # | Problem | Status | Phase | Priority |
|---|---------|--------|-------|----------|
| 9 | Terraform: apply targeted no detecta cambios | ⏳ Pending | Development | ⚠️ Medium |
| 10 | Terraform: CORS origin no se actualiza | ⏳ Pending | Deployment | ⚠️ Medium |
| 21 | Terraform: cors_origin string vs list(string) | ✅ Applied | Development | 🔴 Critical |
| 22 | AWS CLI: `~/.aws/config` con `output=` corrupto rompe comandos | ✅ Applied (cohorte2) | All phases | ⚠️ Medium |

**Infrastructure Summary**: Issue #21 handled with list(string). Issue #22 mitigated via `AWS_DEFAULT_OUTPUT=json` env var override en scripts (config del usuario debe corregirse manualmente).

---

### Testing & CI Issues
| # | Problem | Status | Phase | Priority |
|---|---------|--------|-------|----------|
| 4 | CORS config API Gateway vs Lambda | ✅ Applied (cohorte2) | Deployment | ⚠️ Medium |
| 11 | Playwright: segfault Chromium | ⏳ Pending | Testing | ⚠️ Medium |
| 12 | Playwright: navigation race condition | ⏳ Pending | Testing | ⚠️ Medium |
| 20 | API GW HTTP v2 overwrites Lambda CORS headers | ✅ Applied (cohorte2) | Deployment | ✅ High |
| 25 | `aws lambda invoke` payload format incompatible entre CLI v1 y v2 | ✅ Applied (cohorte2) | Testing | 📌 Reference |

**Testing Summary**: CORS issues (#4, #20) resueltos en cohorte2 — Lambda no setea headers CORS, API Gateway es la única autoridad. Playwright issues (#11, #12) pendientes para fase E2E.

---

## Quick Reference by Phase

### 🔨 Development Phase (Code Generation)
| Unit | Critical Issues | Recommended Action |
|------|-----------------|-------------------|
| **backend** | #1, #2, #3 (applied ✅) | esbuild CJS bundle from start |
| **frontend** | #14, #16, #27, #28, #29, #30 (applied ✅) | Strip trailing slash + CSP from env + native binding fix + Next 15 on Node 18 + ESLint ignores + `<img>` for signed URLs |
| **infra** | #21 (applied ✅) | Use list(string) for cors_origins |

### 🚀 Deployment Phase (Terraform + Scripts)
| Unit | Critical Issues | Recommended Action |
|------|-----------------|-------------------|
| **backend** | #15, #23, #24 (applied ✅), #32 | DEPLOY_TIMESTAMP bump por IAM cold start; deploy.sh sin flags CLI v2; seedear sesión post-deploy |
| **frontend** | #5, #6, #19 (applied ✅), #31 | `env-add.sh` con `printf` + `rm` previo; bootstrap order: deploy → leer URL → `terraform apply` CORS |
| **infra** | #10, #22 | AWS CLI fallback para CORS; export AWS_DEFAULT_OUTPUT=json en scripts |
| **all** | #22, #31 | Validar `~/.aws/config` antes de scripts; primer deploy E2E exige update de CORS posterior |

### 🧪 Testing Phase (E2E & Unit Tests)
| Unit | Critical Issues | Recommended Action |
|------|-----------------|-------------------|
| **backend** | #7, #8 (applied ✅), #25, #26 | jest.config.cjs + setup order; smoke con `aws lambda invoke --payload file://`; cast narrowing en QueryCommandOutput |
| **frontend** | #11, #12, #17, #18 | Use WebKit instead of Chromium, await waitForURL |
| **all** | #4, #20 (applied ✅ en cohorte2) | CORS truth is API Gateway config, not Lambda headers |

---

## 1. Lambda: ESM vs CJS bundle

**Síntoma**: `SyntaxError: Cannot use import statement outside a module` al invocar la Lambda.

**Causa**: esbuild generaba el bundle con `format: 'esm'` pero Lambda nodejs22.x trata archivos `.js` como CommonJS por defecto.

**Solución**: Cambiar a `format: 'cjs'` en `esbuild.config.mjs`. Alternativa: incluir un `package.json` con `"type": "module"` dentro del zip, pero CJS es más simple para un bundle único.

**Regla**: Si el entrypoint es `.js` y no hay `package.json` con `type: module` en el zip, Lambda lo ejecuta como CJS.

---

## 2. API Gateway HTTP API: body base64-encoded

**Síntoma**: El backend recibe `event.body` como string base64 en vez de JSON plano. `JSON.parse(body)` falla silenciosamente y retorna `null`, causando errores de validación como "Invalid or missing sessionCode".

**Causa**: API Gateway HTTP API (payload format 2.0) codifica el body en base64 cuando detecta ciertos content-types o cuando el request viene del browser con headers específicos. El campo `event.isBase64Encoded` indica cuándo esto ocurre.

**Solución**: Decodificar antes de parsear:
```typescript
const raw = isBase64 ? Buffer.from(body, 'base64').toString('utf-8') : body;
return JSON.parse(raw);
```

**Regla**: Siempre verificar `event.isBase64Encoded` en handlers de API Gateway v2. Esto no se reproduce fácilmente con `curl` (que envía texto plano), solo con browsers reales.

---

## 3. IAM: permisos faltantes en Lambda

**Síntoma**: `GET /health` retorna `{"status":"ok","dynamodb":"error"}` aunque la tabla existe y está activa.

**Causa**: El IAM policy de la Lambda no incluía `dynamodb:DescribeTable` (usado por el health check) ni `dynamodb:TransactWriteItems` (usado por vote idempotency).

**Solución**: Agregar ambas acciones al IAM policy en Terraform.

**Regla**: Revisar TODAS las operaciones de AWS SDK usadas en el código y cruzarlas con el IAM policy. Las operaciones comunes que se olvidan:
- `DescribeTable` para health checks
- `TransactWriteItems` para transacciones
- `BatchWriteItem` para operaciones batch

---

## 4. CORS: configuración en API Gateway vs Lambda

**Síntoma**: `Access-Control-Allow-Origin header is not present` en preflight OPTIONS.

**Causa**: El CORS se configura en dos niveles independientes:
1. **API Gateway** (`cors_configuration`): maneja preflight OPTIONS automáticamente y agrega headers CORS a las respuestas.
2. **Lambda** (`CORS_ORIGIN` env var): agrega `Access-Control-Allow-Origin` en las respuestas JSON del handler.

Ambos deben estar sincronizados con el dominio correcto del frontend.

**Solución**: Actualizar `allow_origins` en API Gateway Y `CORS_ORIGIN` en las env vars de Lambda al dominio de Vercel.

**Regla**: Al cambiar el dominio del frontend, actualizar CORS en ambos lugares. Durante desarrollo, usar `*` en Lambda pero el dominio específico en API Gateway.

---

## 5. Vercel: env vars con newline

**Síntoma**: El frontend envía `"LATAM2026\n"` como sessionCode, causando "Invalid sessionCode" en el backend.

**Causa**: Al agregar env vars con `echo "valor" | vercel env add`, el comando `echo` agrega un `\n` al final que se guarda como parte del valor. Next.js inlinea el valor tal cual en build time.

**Solución**: Usar `printf` en vez de `echo`:
```bash
printf 'LATAM2026' | vercel env add NEXT_PUBLIC_SESSION_CODE production
```

**Regla**: Siempre usar `printf` (sin newline) al pipear valores a `vercel env add`. Verificar el valor inlined en el bundle JS desplegado buscando el string en los chunks.

---

## 6. Vercel: NEXT_PUBLIC_* son build-time only

**Síntoma**: El frontend usa `http://localhost:3001` como API URL en producción a pesar de tener la env var configurada.

**Causa**: Las variables `NEXT_PUBLIC_*` se inlinan durante `next build`. Pasarlas con `vercel deploy -e` no las persiste en el proyecto — solo aplican a ese deploy. Si el build usa cache, puede que no se apliquen.

**Solución**: Agregar las env vars al proyecto con `vercel env add` y luego hacer redeploy.

**Regla**: Para variables `NEXT_PUBLIC_*`, siempre usar `vercel env add` (persistente) en vez de `-e` (efímero). Después de cambiar env vars, siempre redeploy.

---

## 7. Jest + Node 22: dynamic import crash

**Síntoma**: `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG` al ejecutar tests que usan `@aws-sdk/s3-request-presigner`.

**Causa**: `getSignedUrl` de `@aws-sdk/s3-request-presigner` usa dynamic imports internamente. Jest en Node 22 con ESM tiene un bug conocido con dynamic imports en el contexto de VM.

**Solución**: Mockear el módulo completo en el setup de tests:
```typescript
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://s3.example.com/presigned-url'),
}));
```

**Regla**: En Node 22 + Jest + ESM, mockear módulos que usan dynamic imports internamente. Esto aplica especialmente a AWS SDK v3 presigners.

---

## 8. Jest: orden de imports en tests de integración

**Síntoma**: `ADMIN_TOKEN` env var no se reconoce en el handler. Tests de admin retornan 401.

**Causa**: El archivo de test importaba el handler (`index.ts`) ANTES del setup (`setup.ts`). El handler captura `process.env.ADMIN_TOKEN` al momento de importación, cuando aún no está seteado.

**Solución**: Importar setup ANTES del handler:
```typescript
// ✅ Correcto
import { dynamoMock } from './setup.js';  // setea process.env primero
import { handler } from '../../src/index.js';

// ❌ Incorrecto
import { handler } from '../../src/index.js';  // captura env vars vacías
import { dynamoMock } from './setup.js';
```

**Regla**: En tests de integración, el archivo que setea `process.env` debe importarse PRIMERO. El orden de imports en ESM importa.

---

## 9. Terraform: apply targeted no detecta cambios

**Síntoma**: `terraform apply -target=aws_iam_role_policy.lambda_policy` reporta 0 changes.

**Causa**: El nombre del recurso en el state era `aws_iam_role_policy.lambda`, no `aws_iam_role_policy.lambda_policy`.

**Solución**: Verificar nombres exactos con `terraform state list | grep iam` antes de usar `-target`.

**Regla**: Siempre verificar el nombre del recurso en el state antes de hacer apply targeted. Los nombres en el state pueden diferir de lo que uno asume.

---

## 10. Terraform: CORS origin no se actualiza

**Síntoma**: `terraform apply` no detecta cambio en `cors_configuration` del API Gateway.

**Causa**: La variable `cors_origin` tenía un default de `http://localhost:3000` y no se pasó el nuevo valor como `TF_VAR_cors_origin` en el apply.

**Solución**: Pasar explícitamente: `TF_VAR_cors_origin="https://mi-dominio.vercel.app" terraform apply`. O actualizar directamente con AWS CLI: `aws apigatewayv2 update-api --cors-configuration ...` y luego `terraform refresh`.

**Regla**: Cuando se usan variables de Terraform con defaults, verificar que se pasen los valores correctos en cada apply. Considerar usar `terraform.tfvars` para valores de ambiente.

---

## 11. Playwright: segfaults intermitentes

**Síntoma**: `SIGSEGV` aleatorio al ejecutar tests con Chromium o Firefox en el entorno.

**Causa**: Incompatibilidad entre la versión de Playwright, Node 22, y las dependencias del sistema (librerías gráficas en Linux).

**Solución**: Usar WebKit como browser alternativo — más estable en este entorno. Configurar retries para manejar segfaults esporádicos.

**Regla**: Si Chromium da segfaults en CI/entornos headless, probar con WebKit. Siempre configurar al menos 1 retry en Playwright para entornos inestables.

---

## 12. Playwright: navigation race condition

**Síntoma**: `Navigation to "/wall" is interrupted by another navigation to "/wall"`.

**Causa**: El patrón `page.goto('/')` → `localStorage.set(...)` → `page.goto('/wall')` falla porque la página `/` detecta el localStorage y hace un redirect client-side a `/wall`, que colisiona con el segundo `goto('/wall')`.

**Solución**: Usar `page.addInitScript()` para setear localStorage ANTES de que la página cargue:
```typescript
await page.addInitScript(({ pid, sc }) => {
  localStorage.setItem('skillwall_participantId', pid);
  localStorage.setItem('skillwall_sessionCode', sc);
}, { pid: participantId, sc: sessionCode });
await page.goto('/wall');
```

**Regla**: Cuando la app tiene redirects basados en localStorage, usar `addInitScript` para setear el estado antes de la navegación. Nunca hacer `goto('/')` → set state → `goto('/wall')` si `/` redirige a `/wall`.

---

## 13. Backend: validación estricta vs UX

**Síntoma**: El join falla con "Invalid photoObjectKey" cuando el usuario no sube foto.

**Causa**: `validatePhotoObjectKey` requería un string no vacío que matcheara un regex. El frontend enviaba `""` cuando no había foto (path de default avatar).

**Solución**: Hacer `photoObjectKey` opcional — validar solo si tiene valor:
```typescript
if (body.photoObjectKey && !validatePhotoObjectKey(body.photoObjectKey)) {
  return jsonResponse(400, { error: 'Invalid photoObjectKey' }, corsOrigin);
}
```

**Regla**: Cuando un campo es opcional en el flujo de usuario (ej: foto con fallback a avatar), la validación del backend debe reflejar esa opcionalidad. Revisar los acceptance criteria — si dice "fallback to default avatar", el campo debe ser opcional.

---

## 14. API URL: trailing slash

**Síntoma**: Requests a `https://api.example.com//join` (doble slash) fallan o retornan 404.

**Causa**: Terraform output de API Gateway incluye trailing slash: `https://xxx.execute-api.../`. Al concatenar con `/join`, queda `//join`.

**Solución**: Sanitizar la URL al leerla:
```typescript
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/+$/, '');
```

**Regla**: Siempre stripear trailing slashes de URLs base. Nunca asumir que una URL de output de infra viene limpia.

---

## 15. Lambda: cold start después de cambio de IAM

**Síntoma**: Después de actualizar el IAM policy, la Lambda sigue retornando errores de permisos.

**Causa**: La Lambda reutiliza el execution environment (warm instance) que tiene las credenciales cacheadas del IAM role anterior.

**Solución**: Forzar cold start actualizando cualquier env var de la Lambda (ej: agregar `DEPLOY_TS=<timestamp>`).

**Regla**: Después de cambiar IAM policies, forzar un cold start de la Lambda. Los cambios de IAM no se reflejan inmediatamente en instancias warm.

---

## 16. CSP hardcodeada bloquea Playwright route mocks en WebKit

**Síntoma**: Tests E2E con Playwright (WebKit) fallan con timeout en `participant-card-*`. Los mocks de `page.route()` nunca interceptan las llamadas a la API. Las participant cards nunca aparecen aunque el `beforeEach` completa sin errores.

**Causa**: `next.config.ts` tenía la URL del API Gateway hardcodeada en el header `Content-Security-Policy`. Al desplegar en Vercel con una `NEXT_PUBLIC_API_URL` diferente, la CSP solo permitía el gateway ID viejo. WebKit aplica la CSP **antes** de que el request llegue a la capa de red, por lo que Playwright lo ve como nunca enviado — el route mock nunca se activa y `fetchData` captura silenciosamente el error.

**Solución**: Leer la URL de la env var en `next.config.ts`:
```typescript
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'https://fallback.execute-api.us-east-1.amazonaws.com'
).replace(/[\s]+$/, '')
```

**Regla**: Los headers de seguridad en `next.config.ts` deben leer de las mismas env vars que el código de la app. Una CSP que no coincide con la URL real hace que WebKit bloquee silenciosamente los fetches, lo que rompe tests E2E de una forma muy difícil de diagnosticar.

---

## 17. Playwright: `page.route()` con glob de hostname wildcard no funciona en WebKit

**Síntoma**: `page.route('https://*.execute-api.us-east-1.amazonaws.com/wall*', handler)` no intercepta las llamadas aunque la URL real coincide con el patrón.

**Causa**: El glob string de `page.route()` usa `*` como `[^/]*` en regex. El `*` antes del hostname (después de `://`) no se comporta como wildcard de subdominio en WebKit — el patrón no matchea correctamente cuando el hostname tiene múltiples niveles de dominio.

**Solución**: Usar una `RegExp` en lugar de un string glob:
```typescript
// ❌ No funciona en WebKit con wildcard de subdominio
await page.route('https://*.execute-api.us-east-1.amazonaws.com/wall*', handler)

// ✅ Funciona siempre
await page.route(/execute-api\.us-east-1\.amazonaws\.com\/wall/, handler)
```

**Regla**: Preferir `RegExp` sobre string glob en `page.route()` cuando el patrón incluye wildcards en el hostname. Los strings glob son confiables en paths pero no en subdominios.

---

## 18. Playwright: race condition entre `router.replace` de Next.js y `page.goto`

**Síntoma**: `Error: Navigation to "/wall" is interrupted by another navigation to "/wall"` en el `beforeEach` del test. Solo ocurre en algunos retries.

**Causa**: El patrón `page.goto('/') → setRegistered(page) → page.goto('/wall')` falla porque al setear localStorage, el `useEffect` de la homepage detecta la sesión y llama `router.replace('/wall')` de forma inmediata. Si este redirect client-side se inicia antes de que Playwright dispare `page.goto('/wall')`, ambas navegaciones colisionan.

**Solución**: Esperar el redirect de React en lugar de forzar la navegación:
```typescript
await page.goto('/')
await setRegistered(page)
// Dejar que React redirija, con fallback explícito si tarda más de 3s
await page.waitForURL('**/wall', { timeout: 3000 }).catch(() => page.goto('/wall'))
```

**Regla**: Cuando la app tiene redirects automáticos basados en estado del cliente (localStorage, cookies), usar `waitForURL` en vez de `page.goto` para el destino esperado. Esto evita colisionar con la navegación que la propia app inicia.

---

## 19. Vercel env var `NEXT_PUBLIC_API_URL` incorrecta rompe la app silenciosamente

**Síntoma**: La app en Vercel hacía requests a un API Gateway inexistente (`ERR_NAME_NOT_RESOLVED`). El formulario cargaba pero cualquier acción (join, wall, leaderboard) fallaba sin mensaje de error al usuario.

**Causa**: La env var `NEXT_PUBLIC_API_URL` en Vercel production apuntaba a un ID de API Gateway que no existía (`1ndf2214v2`), diferente al ID real del Terraform state local (`abc123xyz0`). El API URL incorrecto se bakeaba en el bundle de Next.js durante el build de Vercel.

**Solución**:
```bash
vercel env rm NEXT_PUBLIC_API_URL production --yes
printf 'https://abc123xyz0.execute-api.us-east-1.amazonaws.com' | vercel env add NEXT_PUBLIC_API_URL production
vercel --prod --yes
```

**Regla**: Verificar que `NEXT_PUBLIC_API_URL` en Vercel coincide exactamente con el `api_gateway_url` del output de `terraform output`. Revisar también que no tenga `\n` al final (usar `printf` en vez de `echo` al pipear a `vercel env add`).

---

## 20. API Gateway HTTP v2: sobreescribe headers CORS del Lambda

**Síntoma**: Configurar `Access-Control-Allow-Origin` en el `jsonResponse` del Lambda no es suficiente — el header del Lambda es ignorado si la CSP o el CORS del API Gateway no está configurado correctamente.

**Causa**: En API Gateway HTTP API v2, cuando `cors_configuration` está activo, el gateway **sobreescribe** los headers CORS de las respuestas del Lambda. El header que el Lambda retorna en `Access-Control-Allow-Origin` no llega al browser — el gateway lo reemplaza con el valor de su propia config.

**Solución**: La fuente de verdad para CORS es la `cors_configuration` del API Gateway, no el Lambda. Actualizar siempre el API Gateway:
```bash
aws apigatewayv2 update-api \
  --api-id <ID> \
  --region us-east-1 \
  --cors-configuration "AllowOrigins=[\"https://mi-app.vercel.app\",\"http://localhost:3000\"],AllowMethods=[\"GET\",\"POST\",\"DELETE\",\"OPTIONS\"],AllowHeaders=[\"Content-Type\",\"traceparent\",\"tracestate\"],MaxAge=3600"
```

**Regla**: Con API Gateway HTTP v2, la configuración de CORS en el Lambda es redundante y puede confundir. Mantener la lógica CORS exclusivamente en `cors_configuration` del API Gateway y en el Terraform correspondiente. Al agregar un nuevo frontend, actualizar solo el API Gateway.

---

## 21. Terraform: `cors_origin` como string no soporta múltiples orígenes

**Síntoma**: Al tener localhost para desarrollo y el dominio de Vercel para producción, un `terraform apply` revertía el CORS a un solo origen, dejando uno de los dos entornos bloqueado.

**Causa**: La variable `cors_origin` era `type = string` y se usaba como `allow_origins = [var.cors_origin]`. Solo un origen era posible. Actualizarlo manualmente con AWS CLI era efectivo pero el siguiente `terraform apply` lo revertía.

**Solución**: Cambiar el tipo de la variable a lista:
```hcl
# variables.tf
variable "cors_origins" {
  type    = list(string)
  default = ["http://localhost:3000"]
}

# api-gateway.tf
cors_configuration {
  allow_origins = var.cors_origins
}

# terraform.tfvars
cors_origins = ["https://mi-app.vercel.app", "http://localhost:3000"]
```
El mismo cambio aplica a `s3.tf` si tiene CORS, y en `lambda.tf` usar `join(",", var.cors_origins)` para la env var.

**Regla**: Definir `cors_origins` como `list(string)` desde el inicio si el proyecto tiene más de un entorno (local + staging + producción). Un string único siempre termina siendo insuficiente.

---

## 22. AWS CLI: línea `output=` corrupta en `~/.aws/config` rompe comandos

**Síntoma**: Comandos AWS CLI fallan intermitentemente con `Unknown output type: <basura>` y exit code 120, incluso comandos básicos como `aws lambda get-function-configuration`. Aparece `arc-zonal-shift                          | artifact` (o similar) como output type.

**Causa**: El bloque `[default]` de `~/.aws/config` tiene una línea de output inválida, típicamente porque se pegó por accidente texto de la salida de `aws help` (que muestra tablas con `|` y nombres de subcomandos):
```ini
[default]
region = us-east-2
output = arc-zonal-shift                          | artifact
```
AWS CLI lee esa línea como el output format por defecto y la rechaza en cada subcomando que produce output estructurado. El flag `--output json` explícito ayuda en algunos casos pero no siempre sobreescribe.

**Solución**:
1. **Fix permanente** (recomendado): editar `~/.aws/config` y cambiar la línea a `output = json` (o `text`, `table`, `yaml`).
2. **Workaround sin tocar config del usuario**: exportar `AWS_DEFAULT_OUTPUT=json` al inicio del script:
```bash
#!/usr/bin/env bash
set -euo pipefail
export AWS_DEFAULT_OUTPUT="json"
# ... resto del script
```

**Regla**: Los scripts de deploy deben ser inmunes a configs corruptos del usuario. Exportar `AWS_DEFAULT_OUTPUT=json` al inicio. Si los comandos fallan inexplicablemente, validar `~/.aws/config` con `aws configure list` antes de debuggear más.

---

## 23. AWS CLI v1: flags `--no-cli-pager` y `--cli-binary-format` no soportados

**Síntoma**: Scripts escritos asumiendo AWS CLI v2 fallan con:
- `Unknown options: --no-cli-pager`
- `Unknown options: --cli-binary-format, lambda-response.json`

**Causa**: AWS CLI v1 (la versión instalada por defecto en muchos paquetes de Linux, incluida la versión snap usada en este equipo) no soporta varios flags introducidos en v2. Esto es transparente cuando se ejecutan los mismos scripts en CI (que suele tener v2) pero rompe en máquinas dev.

**Solución**:
- **Remover `--no-cli-pager`**: CLI v1 no pagina por defecto, así que el flag es innecesario en general.
- **Reemplazar `--cli-binary-format`**: en lugar de pasar payload inline con `--payload '<json>' --cli-binary-format raw-in-base64-out`, escribir el JSON a un archivo y usar `--payload file://path.json`.
- Detectar versión con `aws --version | grep -q 'aws-cli/2'` si se necesita lógica condicional.

**Ejemplo deploy.sh corregido**:
```bash
# ❌ Solo funciona en CLI v2
aws lambda update-function-code \
  --function-name foo \
  --zip-file fileb://function.zip \
  --no-cli-pager

# ✅ Funciona en v1 y v2
aws lambda update-function-code \
  --function-name foo \
  --zip-file fileb://function.zip \
  > /dev/null
```

**Regla**: No asumir AWS CLI v2 en scripts de deploy locales. Usar el lowest common denominator o detectar versión y bifurcar. CI lanes pueden tener v2 mientras dev machines aún corren v1.

---

## 24. AWS CLI v1: `--environment "Variables={...}"` shorthand falla con JSON con comillas

**Síntoma**: `aws lambda update-function-configuration --environment "Variables=${JSON_STRING}"` falla con:
```
Error parsing parameter '--environment': Expected: '=', received: '"' for input
```

**Causa**: La sintaxis shorthand `Variables=k1=v1,k2=v2` del parser de AWS CLI v1 no acepta JSON anidado con comillas. Cuando un script construye el JSON con `jq` y lo inyecta como string, las comillas internas (`"`) rompen el parser shorthand que espera el formato `key=value,key2=value2`.

Esto se da con frecuencia en deploy scripts que leen las env vars actuales, agregan una (ej. `DEPLOY_TIMESTAMP` para forzar cold start — ver #15), y las re-suben.

**Solución**: Usar archivo JSON via `file://`:
```bash
ENV_JSON_FILE=$(mktemp /tmp/lambda-env.XXXXXX.json)
trap 'rm -f "${ENV_JSON_FILE}"' EXIT

aws lambda get-function-configuration \
  --function-name "${FUNCTION_NAME}" \
  --region "${REGION}" \
  --query 'Environment.Variables' \
  --output json \
  | jq --arg ts "$(date +%s)" '{Variables: (. + {DEPLOY_TIMESTAMP: $ts})}' \
  > "${ENV_JSON_FILE}"

aws lambda update-function-configuration \
  --function-name "${FUNCTION_NAME}" \
  --environment "file://${ENV_JSON_FILE}" \
  --region "${REGION}"
```

**Regla**: Para parámetros estructurados (Map, List<Map>) en AWS CLI, preferir siempre `file://` con JSON sobre la sintaxis shorthand `Key=Value`. Es más robusto, debuggeable (puedes inspeccionar el JSON antes de enviarlo) y compatible con cualquier versión del CLI.

---

## 25. `aws lambda invoke`: payload format incompatible entre CLI v1 y v2

**Síntoma**: Smoke tests con `aws lambda invoke` fallan según la versión del CLI:
- En v2: `aws lambda invoke ... --payload '<base64>'` funciona, `--payload '<json>'` falla.
- En v1: lo opuesto — `--cli-binary-format` no existe, y el JSON crudo se interpreta como base64 → error de parsing.

**Causa**: AWS CLI v2 introduce `--cli-binary-format` y por defecto trata `--payload` como base64. AWS CLI v1 espera el payload como JSON crudo o vía archivo. Ambos comportamientos son válidos en su contexto pero incompatibles cross-version.

**Solución universal**: usar `--payload file://` con un archivo JSON. Funciona idéntico en ambas versiones:
```bash
cat > /tmp/payload.json <<'EOF'
{
  "routeKey": "GET /health",
  "rawPath": "/health",
  "headers": {},
  "requestContext": {"http": {"method": "GET", "path": "/health"}, "requestId": "smoke"},
  "isBase64Encoded": false
}
EOF

aws lambda invoke \
  --function-name skillwall-dev-api \
  --region us-east-1 \
  --payload file:///tmp/payload.json \
  /tmp/response.json

cat /tmp/response.json
```

**Regla**: Para smoke tests reproducibles de Lambdas, siempre usar `--payload file://`. Documentar los payloads de smoke test como archivos `.json` en `backend/tests/smoke/` para que el equipo pueda re-correrlos sin importar la versión del CLI.

---

## 26. TypeScript + AWS SDK v3 lib-dynamodb: `Items` type no permite narrow directo

**Síntoma**: TypeScript error al asignar el response de `DynamoDBDocumentClient.send(new QueryCommand(...))` a una variable con tipo strict:
```
src/services/dynamodb.ts(202,13): error TS2322:
Type 'QueryCommandOutput' is not assignable to type
'{ Items?: { PK: string; SK: string; }[] | undefined; LastEvaluatedKey?: Record<string, unknown> | undefined; }'.
  Types of property 'Items' are incompatible.
    Type 'Record<string, any>[] | undefined' is not assignable to type '{ PK: string; SK: string; }[] | undefined'.
```

**Causa**: `DynamoDBDocumentClient` retorna `Items?: Record<string, any>[]` para preservar flexibilidad runtime (el shape real depende del schema de la tabla, no del SDK). TypeScript no permite "narrow" un response type así anotando la variable.

**Solución**: No anotar el tipo del response — hacer cast local a la propiedad después de leerla:
```typescript
// ❌ Falla en compilación
const res: { Items?: { PK: string; SK: string }[]; LastEvaluatedKey?: Record<string, unknown> } =
  await doc.send(new QueryCommand({...}));

// ✅ Compila y mantiene el narrow
const res = await doc.send(new QueryCommand({...}));
const items = (res.Items ?? []) as Array<{ PK: string; SK: string }>;
const lastKey = res.LastEvaluatedKey;
```

**Regla**: Con AWS SDK v3 DocumentClient, dejar que el response infiera su tipo genérico (`QueryCommandOutput`, `GetCommandOutput`, etc.) y hacer narrowing local en cada uso (`as Array<T>`, `as MyRecord | undefined`). No anotar el tipo de la variable que recibe el `.send()` con un shape custom — el SDK no lo soporta y el cast en sitio es más explícito.

---

## 27. Tailwind 4 + `@tailwindcss/oxide`: native binding faltante (npm optional-deps bug)

**Síntoma**: `next build` falla con error de webpack del CSS loader:
```
Error: Cannot find native binding. npm has a bug related to optional dependencies
(https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing
both package-lock.json and node_modules directory.
  at Object.<anonymous> (.../node_modules/@tailwindcss/oxide/index.js:563:11)
```
La carpeta `node_modules/@tailwindcss/` solo contiene `node`, `oxide`, `postcss` — falta la subcarpeta de plataforma (e.g. `oxide-linux-x64-gnu`, `oxide-darwin-arm64`).

**Causa**: `@tailwindcss/oxide` declara los binarios nativos como `optionalDependencies` (uno por plataforma: linux/darwin/freebsd × x64/arm64 × gnu/musl). Hay un bug conocido en npm donde, si el primer install falla a medias o cachea optional packages como skipped, los reinstalls subsecuentes no los vuelven a intentar. Tailwind 4 (en beta/early-stable) lo dispara con frecuencia.

**Solución**:
```bash
# 1. Clean reinstall (lockfile + node_modules)
rm -rf node_modules package-lock.json
npm install

# 2. Si aún falla, instalar explícitamente el binario para tu plataforma
npm install @tailwindcss/oxide-linux-x64-gnu --no-save
# Plataformas disponibles (ver node_modules/@tailwindcss/oxide/package.json):
#   @tailwindcss/oxide-linux-x64-gnu      Linux glibc x64 (Ubuntu, Debian, Fedora)
#   @tailwindcss/oxide-linux-x64-musl     Linux musl x64 (Alpine)
#   @tailwindcss/oxide-linux-arm64-gnu    Linux glibc ARM64
#   @tailwindcss/oxide-darwin-arm64       macOS Apple Silicon
#   @tailwindcss/oxide-darwin-x64         macOS Intel
#   @tailwindcss/oxide-wasm32-wasi        WASM fallback
```

Para diagnosticar tu plataforma:
```bash
node -e "console.log(process.platform, process.arch)"
# linux x64 → @tailwindcss/oxide-linux-x64-gnu (en glibc) o -musl (en Alpine)
```

**Regla**: En proyectos con Tailwind 4 + Linux/macOS dev environments mezclados, documentar en README qué binario explícito instalar como fallback. En Vercel/CI, `npm ci` suele resolverlo automáticamente, pero si falla, agregar un `vercel-build` script que haga el `npm install <package> --no-save` antes del build.

---

## 28. Next.js 16 requiere Node 22+; Next 15 funciona con Node 18

**Síntoma**: `npm install next@^16` produce warnings de engine; al hacer `npm run dev` o `npm run build` la app crashea con errores tipo "structuredClone is not a function" o usos de APIs nativas que no existen en Node 18.

**Causa**: Next 16 declara `engines.node >= 22.0.0` y consume APIs de Node 22 (improvements en worker_threads, structuredClone, etc.). Node 18 entró en maintenance mode en octubre 2024 y Next 16 explícitamente lo deprecó.

**Solución**: 
- **Dev local con Node 18 (LTS)**: usar Next 15.5.x (último de la rama 15). App Router, Turbopack, RSC, headers config, server actions — todo idéntico a Next 16 funcionalmente. El código no cambia entre 15 y 16 para apps típicas.
- **Para producción / Vercel**: en `package.json` declarar `"engines": {"node": ">=20"}` (Vercel respeta esto y usa Node 22 por defecto). Si se quiere Next 16, también ajustar Settings → Build & Development → Node.js version a `22.x` en el dashboard de Vercel.
- **Para upgrade futuro a Next 16**: bump único de `"next": "^16"` + verificar Node 22 en todos los runners. Sin cambios de código esperados.

**Regla**: Antes de elegir versión mayor de Next, verificar `node -v` local + Node versions de tus CI runners. Para proyectos heterogéneos (algunos contributors con Node 18, otros con 22), Next 15 es el lowest common denominator. Migrar a 16 cuando todo el equipo y CI tengan Node 22.

---

## 29. ESLint v9 flat config no ignora archivos generados por defecto

**Síntoma**: `npm run lint` reporta miles de errores ("4128 problems: 109 errors, 4019 warnings") en archivos que no deberían lintearse: `next-env.d.ts`, `.next/types/**.ts`, hasta `node_modules/**`. Casi imposible separar errores reales del ruido.

**Causa**: ESLint v9 con `eslint.config.mjs` (flat config) ya **no** respeta el archivo `.eslintignore`. Además **no ignora `node_modules/` por defecto** — eso solo aplicaba a `.eslintrc.*`. Sin un bloque `ignores: []` explícito al inicio del config, ESLint walkea todos los archivos del repo.

**Solución**: agregar bloque de ignores como primer elemento del array de config:
```javascript
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: { /* ... */ }
  }
];
```

**Regla**: Cuando se migra de `.eslintrc.json` a `eslint.config.mjs` (flat config, ESLint v9+), agregar SIEMPRE un objeto `{ ignores: [...] }` como primer elemento. Mínimo: `node_modules/**`, `.next/**` (o build dir equivalente), `next-env.d.ts`, `coverage/**`. Sin esto, `npm run lint` es inutilizable.

---

## 30. `<img>` vs `next/image` con URLs firmadas (S3 pre-signed)

**Síntoma**: ESLint reporta warnings `@next/next/no-img-element` sobre cada uso de `<img>`. Tentación natural: usar `next/image`, pero hacerlo con S3 pre-signed URLs causa otros problemas (firma rota, credenciales cacheadas en el optimizer de Vercel).

**Causa**: `next/image` requiere declarar `images.remotePatterns` en `next.config.ts` con el hostname remoto. Esto funciona con CDNs estáticos, pero las S3 pre-signed URLs:
1. Incluyen credenciales temporales en el query string (`?X-Amz-Signature=...`).
2. La firma es válida durante un tiempo limitado (e.g. 1 hora) — pasar la URL por el optimizer puede cachearla y servir contenido firmado expirado.
3. Cada upload tiene un objectKey único, así que `remotePatterns` solo puede matchear el hostname, no el path.
4. El optimizer de Vercel/Next hace un fetch server-side; si AWS bloquea ese IP o cambia la región de fetch, se rompe.

**Solución decidida**: usar `<img>` simple con `onError` fallback al avatar local, y desactivar la regla:
```typescript
// eslint.config.mjs
rules: {
  "@next/next/no-img-element": "off"
}

// component
const [imgFailed, setImgFailed] = useState(false);
const src = !photoUrl || imgFailed ? "/default-avatar.png" : photoUrl;
return <img src={src} onError={() => setImgFailed(true)} alt={name} />;
```

**Regla**: Cuando las imágenes vienen de URLs firmadas/efímeras (S3 presigned, Cloudinary signed, Cloudflare Stream tokens, etc.), `<img>` simple es preferible a `next/image`. Documentar la decisión en `next.config.ts` o un ADR, y desactivar `@next/next/no-img-element` explícitamente para no acumular warnings que tapen otros problemas.

---

## 31. CORS chicken-and-egg: el dominio Vercel no existe antes del primer deploy

**Síntoma**: La primera vez que despliegas el frontend a Vercel desde cero, no puedes pre-añadir el dominio en `cors_origins` porque aún no sabes cuál URL va a asignar Vercel. Si lo haces después con `terraform apply`, hay un periodo entre el deploy de Vercel y el apply en el que el frontend ya está live pero los fetches a la API son rechazados con `CORS error: Origin <vercel-url> is not allowed`.

**Causa**: El dominio production de Vercel solo se conoce tras el primer `vercel --prod` (formato: `https://<project>-<random-hash>-<team>.vercel.app` + alias `https://<project>.vercel.app`). El API Gateway (provisionado por Terraform) viene preconfigurado con `cors_origins = ["http://localhost:3000"]` para dev. Sin agregar el dominio Vercel a esa lista, el browser rechaza los fetches por CORS.

**Solución — bootstrap order**:
```bash
# 1. Backend + infra primero (sin saber el dominio frontend aún)
cd infra && terraform apply -var-file=terraform.tfvars
cd ../backend && ./scripts/deploy.sh

# 2. Crear el proyecto Vercel y configurar env vars
cd ../frontend
vercel link --yes --project skillwall-frontend
./scripts/env-add.sh NEXT_PUBLIC_API_URL "$(cd ../infra && terraform output -raw api_gateway_url | sed 's:/*$::')"
./scripts/env-add.sh NEXT_PUBLIC_SESSION_CODE LATAM2026

# 3. Primer deploy → ahora conoces el dominio
vercel --prod --yes
# → https://skillwall-frontend.vercel.app

# 4. Volver a infra y agregar el dominio a cors_origins
cd ../infra
# editar terraform.tfvars:
#   cors_origins = ["https://skillwall-frontend.vercel.app", "http://localhost:3000"]
terraform apply -var-file=terraform.tfvars
# → API Gateway, S3 CORS, Lambda env CORS_ORIGINS — todos actualizados en un solo apply (gracias a #21)
```

**Alternativa**: setear `cors_origins = ["*"]` solo en `dev.tfvars` para dev/staging y el dominio exacto en `prod.tfvars`. Funciona pero `*` no es válido con `AllowCredentials=true` (no aplica aquí, pero es bueno saber).

**Regla**: En primer deploy E2E (greenfield), el flujo correcto es **backend/infra → Vercel deploy → leer URL → terraform apply con la URL**. Documentar este orden en un `BOOTSTRAP.md` o el README del repo raíz. Para CI/CD subsecuentes el flujo es más simple porque la URL ya está fija.

---

## 32. `/join` retorna 404 si la sesión no fue seedeada vía `/admin/sessions`

**Síntoma**: Un usuario nuevo abre el frontend desplegado, llena el formulario, presiona "Unirme" y recibe `Session not found` (HTTP 404). Los logs de Lambda confirman que `/join` recibió el request, validó, y rechazó porque `getSession(sessionCode)` retornó `null`. El frontend luce roto sin razón aparente.

**Causa**: El handler `/join` (en `backend/src/handlers/join.ts`) hace `getSession(sessionCode)` antes de crear el participante. Si no existe el item `PK=SESSION#{code}, SK=METADATA` en DynamoDB, retorna 404. Esto es una decisión deliberada de diseño — evita que cualquier sessionCode arbitrario cree datos en la tabla — pero significa que **el primer paso operacional después del deploy es seedear la sesión via el endpoint admin**.

**Solución — seedeo manual**:
```bash
# Reemplaza ADMIN_TOKEN con el valor real (terraform.tfvars o env var)
curl -sS -X POST https://<api-gateway-url>/admin/sessions \
  -H 'Content-Type: application/json' \
  -d '{"adminToken":"<admin-token>","sessionCode":"LATAM2026"}'
# → 201 Created: {"sessionCode":"LATAM2026","createdAt":"..."}
```

**Solución — script en el repo** (`backend/scripts/seed-session.sh`):
```bash
#!/usr/bin/env bash
set -euo pipefail
export AWS_DEFAULT_OUTPUT=json

SESSION_CODE="${1:-LATAM2026}"
API_URL=$(cd "$(dirname "$0")/../../infra" && terraform output -raw api_gateway_url | sed 's:/*$::')
ADMIN_TOKEN=$(cd "$(dirname "$0")/../../infra" && grep '^admin_token' terraform.tfvars | sed 's/.*= *"\(.*\)"/\1/')

curl -sS -X POST "${API_URL}/admin/sessions" \
  -H 'Content-Type: application/json' \
  -d "{\"adminToken\":\"${ADMIN_TOKEN}\",\"sessionCode\":\"${SESSION_CODE}\"}" \
  -w "\nHTTP %{http_code}\n"
```

**Regla**: Cualquier endpoint que requiera estado pre-existente (sesión, tenant, organización) debe documentar en README **el paso de bootstrapping** justo después del deploy. Idealmente automatizar con un script `scripts/seed-*.sh` que el README invoque. Sin esto, los humanos que prueben la app por primera vez verán errores y asumirán que el sistema está roto. Considerar también un endpoint público `/sessions/{code}` que retorne 404 distinto de "sesión no existe" vs "sesión existe pero algo más falla" — separa los failure modes.

---

## 33. Throttling de lectura sub-dimensionado + límite de concurrencia Lambda 10 en cuentas nuevas

**Síntoma**: Con la clase conectada al muro, `GET /wall?sessionCode=...` retorna **HTTP 429**. Tras subir el throttling del gateway, bursts muy simultáneos retornan **HTTP 503**.

**Causa (doble)**:
1. **429**: el stage tenía `default_route_settings` con 10 TPS / burst 10 **por ruta**. El frontend hace polling de `/wall` + `/leaderboard` cada 2s por cada cliente conectado → con ~20 asistentes ya son >10 req/s en `/wall` y el API Gateway rechaza con 429 antes de llegar a Lambda.
2. **503**: las cuentas AWS nuevas traen `ConcurrentExecutions = 10` (verificar con `aws lambda get-account-settings`). Cuando más de 10 requests llegan a Lambda al mismo tiempo, Lambda throttlea y API Gateway lo traduce a 503.

**Solución**:
```hcl
# api-gateway.tf — lecturas con espacio para un salón, burst moderado para
# que el gateway suavice picos en lugar de dejarlos llegar a Lambda:
default_route_settings {
  throttling_burst_limit = 50
  throttling_rate_limit  = 50
}
# /join y /like conservan sus 5 TPS (NFR-02) — ese rate limiting es intencional.
```
Y pedir el aumento de cuota (tarda horas/días, hacerlo ANTES de la cohorte):
```bash
aws service-quotas request-service-quota-increase \
  --service-code lambda --quota-code L-B99A9384 --desired-value 1000
```

**Regla**: Dimensionar el throttling de lectura como `clientes_concurrentes × endpoints_polleados / intervalo_de_polling` (30 personas × 2 endpoints / 2s = 30 TPS mínimo). En cuentas AWS nuevas, verificar `ConcurrentExecutions` en el primer setup — el default de 10 no aguanta demos con audiencia y el aumento de cuota no es inmediato. El polling se auto-recupera (el siguiente tick refresca), así que fallos residuales bajo burst extremo son tolerables, pero el steady-state debe caber holgado.
