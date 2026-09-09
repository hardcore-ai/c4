# 📘 Runbook Estudiante — Estación 5: Diseñando el CÓMO
**Spec Driven Development con AI-DLC · Fase Construction**

**Programa:** Hardcore AI | 30X &nbsp;·&nbsp; **Instructor:** Christian Braatz  
**Producto guía:** *EntreVista AI* — Unidad 1: Auth & Session Management

---

## 📋 Índice

1. [¿Para qué sirve este runbook?](#para-qué-sirve-este-runbook)
2. [Fundamento conceptual: de la especificación al código verificable](#fundamento-conceptual)
3. [Actividad 0 — Re-enfoquemos el framework](#actividad-0--re-enfoquemos-el-framework)
4. [El viaje de una Unidad de trabajo](#el-viaje-de-una-unidad-de-trabajo)
5. [Actividad 1 — Diseño funcional](#actividad-1--diseño-funcional)
6. [Actividad 2 — Requerimientos no funcionales](#actividad-2--requerimientos-no-funcionales)
7. [Actividad 3 — Diseño de requerimientos no funcionales (ADR)](#actividad-3--diseño-de-requerimientos-no-funcionales-adr)
8. [Actividad 4 — Diseño de infraestructura](#actividad-4--diseño-de-infraestructura)
9. [Actividad 5 — Generación de código](#actividad-5--generación-de-código)
10. [Actividad 6 — Pruebas: diseño y enfoques](#actividad-6--pruebas-diseño-y-enfoques)
11. [Checklist de entrega](#checklist-de-entrega)
12. [Recursos](#recursos)

---

## ¿Para qué sirve este runbook?

Este documento es tu guía de trabajo activo para la fase Construction. Asume que tienes los 6 artefactos de Inception completos — si no los tienes, vuelve a la Estación 4 antes de continuar.

Al terminar de aplicarlo tendrás, para cada unidad trabajada:

| Artefacto | Qué responde |
| :--- | :--- |
| `domain-entities.md` | ¿Qué entidades y value objects gobiernan esta unidad? |
| `business-rules.md` | ¿Qué comportamientos y reglas definen la lógica de negocio? |
| `business-logic-model.md` | ¿Cómo fluye el negocio de inicio a fin? |
| `nfr-requirements.md` | ¿Cómo debe comportarse el sistema en condiciones reales? |
| `nfr-design.md` | ¿Qué patrones y decisiones (ADR) resuelven cada NFR? |
| `infrastructure-design.md` | ¿Qué servicios de nube necesita esta unidad y cómo se configuran? |
| `deployment-architecture.md` | ¿Cómo se despliega todo? Diagrama completo. |
| Código fuente + tests | El producto de todas las especificaciones anteriores. |

> **La tarea de la Estación 5 no es llegar al código.** Es generar las especificaciones de Construction más completas posibles. El código es consecuencia — la especificación es el objetivo.

---

## Fundamento conceptual

### De Inception a Construction: qué cambia

En Inception respondiste **el QUÉ**: qué hace el sistema, qué necesitan los usuarios, cómo se estructura el trabajo. En Construction respondes **el CÓMO**: cómo se comporta el dominio tácticamente, qué decisiones arquitectónicas se toman, cómo se despliega, cómo se prueba.

```
INCEPTION (QUÉ)              CONSTRUCTION (CÓMO)
─────────────────────────    ──────────────────────────────
Requirements Analysis    →   Diseño funcional (DDD táctico)
User Stories (Gherkin)   →   Pruebas de comportamiento (GWT)
Application Design       →   NFR Design + ADR
Units Generation         →   Implementación por unidad
```

### Las 5 etapas de la fase Construction

Cada unidad pasa por las mismas 5 etapas en el mismo orden. No son opcionales — saltarse una compromete la calidad de las siguientes:

| Etapa | Qué produce | Alimenta a |
| :--- | :--- | :--- |
| **Modelo de dominio** | Entidades, reglas, flujos E2E | Diseño técnico |
| **Análisis ADR** | Decisiones con contexto, opciones y consecuencias | Diseño técnico + infraestructura |
| **Diseño técnico** | Patrones, interfaces, estructuras | Implementación |
| **Implementación** | Código de producción | Pruebas |
| **Pruebas** | Tests unitarios, integración, aceptación | Validación de Inception |

### Por qué empezar por la Unidad base

La Unidad 1 (Auth & Session Management en *EntreVista AI*) es siempre el primer punto de partida de Construction porque:
- Es transversal: todas las demás unidades dependen de ella.
- Define los contratos de identidad del sistema (¿quién puede hacer qué?).
- Sus NFRs (seguridad, disponibilidad) son los más críticos — un fallo aquí es un fallo total.
- Su código limpio desde el inicio establece los estándares para el resto del sistema.

---

## Actividad 0 — Re-enfoquemos el framework

### El prompt de re-entrada

Construction puede retomarse en sesiones distintas a las de Inception. Antes de cualquier acción, confirma el estado del framework para que el agente no asuma una fase diferente a la real.

> **🚀 PROMPT DE RE-ENTRADA:**
>
> `"Confírmame en qué fase de AI-DLC nos encontramos, para avanzar."`

**Qué esperar como respuesta:** El framework confirmará la fase activa (Construction), la unidad en curso y la siguiente actividad disponible. Si responde con algo diferente a lo esperado, verifica que `CLAUDE.md` esté presente en la raíz del workspace y no haya sido modificado.

### Verificación del estado del workspace antes de empezar

Antes de la primera actividad, confirma que tienes:

```
tu-producto/
├── CLAUDE.md                          ✅ Reglas del framework
├── PRD_tu_producto.md                 ✅ PRD de Inception
├── .aidlc-rule-details/               ✅ Detalles de fases
└── aidlc-docs/
    └── inception/
        ├── workspace-detection.md     ✅
        ├── requirements-analysis.md   ✅
        ├── user-stories.md            ✅
        ├── workflow-planning.md       ✅
        ├── application-design.md      ✅
        └── units-generation.md        ✅ ← entrada principal de Construction
```

Si alguno de estos artefactos está incompleto o falta, el agente generará especificaciones de Construction basadas en suposiciones incorrectas. Completa Inception primero.

---

## El viaje de una Unidad de trabajo

Antes de entrar en las actividades, internaliza el flujo completo. Cada etapa es una cresta en el camino — no hay atajos:

```
Diseño        Requerimientos      Diseño de       Generación      Pruebas
funcional  →  no funcionales  →   req. no     →   de código   →
                                  funcionales
                    ↕                   ↕
              (Diseño NFR / ADR)  (Infraestructura)
```

**Regla de oro de Construction:** nunca generes código antes de tener el `business-logic-model.md` aprobado y al menos un ADR documentado. Sin ese contexto, el agente genera código técnicamente correcto pero funcionalmente incorrecto.

---

## Actividad 1 — Diseño funcional

**Objetivo:** Traducir las User Stories y el Application Design de Inception en el modelo táctico de dominio de la unidad.

**Artefactos generados:** `domain-entities.md` → `business-rules.md` → `business-logic-model.md`

### Por qué DDD táctico aquí

El DDD estratégico (bounded contexts, lenguaje ubicuo) ya se definió en Inception. En Construction aplicamos DDD **táctico**: los patrones concretos que implementan ese modelo dentro de una unidad. Los building blocks que más usarás:

| Patrón | Qué es | Ejemplo (EntreVista AI - U1) |
| :--- | :--- | :--- |
| **Entity** | Objeto con identidad propia que persiste. | `Operator` (tiene `operator_id` único) |
| **Value Object** | Objeto sin identidad, definido por su valor. | `HashedPassword`, `JWTToken` |
| **Aggregate** | Grupo de entidades con una raíz que garantiza consistencia. | `Operator` como raíz del aggregate de autenticación |
| **Domain Service** | Lógica que no pertenece a una sola entidad. | `AuthService` (login, refresh, logout) |
| **Repository** | Abstracción del acceso a datos. | `OperatorRepository` (MongoDB) |

### Artefacto 1: `domain-entities.md`

Captura el bounded context, las entidades y los value objects de la unidad.

**Estructura del artefacto:**

```markdown
# Domain Entities — [Nombre de la Unidad]

## Bounded Context
[Nombre y descripción del contexto delimitado]

## Entities
### [NombreEntidad]
- **Identidad:** [campo que la identifica de forma única]
- **Atributos:** [lista de propiedades con tipos]
- **Comportamientos:** [métodos o acciones que puede realizar]

## Value Objects
### [NombreValueObject]
- **Valor que encapsula:** [qué representa]
- **Reglas de validación:** [restricciones del valor]

## Aggregates
- **Raíz:** [entidad raíz del aggregate]
- **Incluye:** [otras entidades dentro del aggregate]
```

*Ejemplo (EntreVista AI — U1):*

```markdown
# Domain Entities — Auth & Session Management

## Bounded Context
Gestión de identidad y autenticación de operadores (Reclutadores).
Límite: desde el registro del operador hasta la gestión de tokens JWT.

## Entities
### Operator
- Identidad: tenant_id + email (índice compuesto único)
- Atributos: operator_id (UUID), name, email, hashed_password, role, is_active, created_at
- Comportamientos: activate(), deactivate(), update_password()

### RefreshToken
- Identidad: jti (JWT ID)
- Atributos: operator_id, token_hash, expires_at, is_revoked
- Comportamientos: revoke(), is_expired()

## Value Objects
### HashedPassword
- Valor: string bcrypt con factor de trabajo mínimo 10
- Validación: no puede ser almacenado en texto plano; siempre verificado con bcrypt.checkpw()

### JWTAccessToken
- Valor: RS256 signed JWT con claims: sub, tenant_id, role, exp, jti
- Validación: exp > now(); firma verificada con clave pública RSA-4096

## Aggregates
- Raíz: Operator
- Incluye: RefreshToken (colección de tokens activos del operador)
```

**Prompt para generarlo:**

```
"Comenzamos la Actividad 1 (Diseño funcional) para la Unidad [nombre].
Basándote en @units-generation.md y @application-design.md,
genera el domain-entities.md con el bounded context, entidades,
value objects y aggregates de esta unidad."
```

### Artefacto 2: `business-rules.md`

Captura los comportamientos, reglas específicas y lógica de negocio que gobiernan la unidad.

**Estructura del artefacto:**

```markdown
# Business Rules — [Nombre de la Unidad]

## Reglas de [Dominio]
### RULE-[ID]: [Nombre descriptivo]
- **Descripción:** [qué establece la regla]
- **Condición:** [cuándo se aplica]
- **Consecuencia:** [qué pasa si se viola]
- **Fuente:** [historia de usuario o requerimiento de origen]
```

*Ejemplo (EntreVista AI — U1):*

```markdown
# Business Rules — Auth & Session Management

## Reglas de Autenticación
### RULE-AUTH-01: Bloqueo por intentos fallidos
- Descripción: Un operador queda bloqueado tras 5 intentos fallidos consecutivos.
- Condición: contador de intentos >= 5 en ventana de 15 minutos.
- Consecuencia: la cuenta se bloquea por 15 minutos; se genera evento de auditoría.
- Fuente: NFR Seguridad + HU-02 (acceso del Reclutador)

### RULE-AUTH-02: Expiración de tokens
- Descripción: El access token expira en 15 minutos; el refresh token en 7 días.
- Condición: cualquier operación con token.
- Consecuencia: token expirado → 401 Unauthorized → cliente debe solicitar refresh.
- Fuente: NFR Seguridad

### RULE-AUTH-03: Revocación de tokens al logout
- Descripción: El logout invalida tanto el access token como todos los refresh tokens activos del operador.
- Condición: llamada a POST /auth/logout con token válido.
- Consecuencia: tokens añadidos a revoked_tokens con TTL = expires_at original.
- Fuente: HU-03 (seguridad de sesión)
```

### Artefacto 3: `business-logic-model.md`

El artefacto más valioso del Diseño funcional. Integra entidades y reglas en flujos completos E2E.

**Estructura del artefacto:**

```markdown
# Business Logic Model — [Nombre de la Unidad]

## Flujo: [Nombre del flujo]
### Descripción
[Qué hace este flujo de inicio a fin]

### Pasos
1. [paso 1]
2. [paso 2]
...

### Reglas aplicadas
- RULE-[ID]: [cuándo se aplica en este flujo]

### Estados posibles
- [ESTADO_A] → [condición de transición] → [ESTADO_B]
```

*Ejemplo (EntreVista AI — U1 — flujo de login):*

```markdown
## Flujo: Login de Operador

### Descripción
Autenticación de un Reclutador con email/contraseña.
Produce un par (access_token, refresh_token) para sesiones subsiguientes.

### Pasos
1. Recibir credenciales (email, password) via POST /auth/login
2. Verificar que el operador existe y está activo (RULE-AUTH-04)
3. Verificar BruteForceProtector: ¿está bloqueado? (RULE-AUTH-01)
4. Verificar contraseña con bcrypt.checkpw()
5. Si falla → incrementar contador BruteForce, registrar evento de auditoría
6. Si pasa → resetear contador BruteForce
7. Generar access_token (RS256, exp: +15min, claims: sub, tenant_id, role, jti)
8. Generar refresh_token (hash almacenado, exp: +7d)
9. Persistir refresh_token en MongoDB (TTL index en expires_at)
10. Registrar evento de auditoría: LOGIN_SUCCESS
11. Retornar { access_token, refresh_token, token_type: "bearer" }

### Reglas aplicadas
- RULE-AUTH-01: verificada en paso 3
- RULE-AUTH-02: aplicada en generación de tokens (pasos 7-8)

### Estados posibles
- LOCKED → (tiempo > 15min sin intentos) → ACTIVE
- ACTIVE → (5 intentos fallidos) → LOCKED
- ACTIVE → (logout exitoso) → TOKENS_REVOKED
```

> 💡 **Validación del artefacto:** Si no puedes describir el flujo paso a paso sin términos técnicos de implementación (sin mencionar clases, métodos ni frameworks), el modelo de dominio no está listo. Refínalo antes de continuar.

---

## Actividad 2 — Requerimientos no funcionales

**Objetivo:** Definir cómo debe comportarse el sistema en condiciones reales, con valores numéricos verificables para cada atributo de calidad.

**Artefacto generado:** `nfr-requirements.md`

### Los 6 atributos de calidad

Para cada unidad, el framework pregunta sobre estos 6 atributos. Cada uno debe tener un valor concreto y medible:

| Atributo | Pregunta clave | Forma de medirlo |
| :--- | :--- | :--- |
| **Desempeño** | ¿Qué tan rápido debe responder bajo carga? | Latencia en ms al percentil P95/P99 con N usuarios simultáneos |
| **Seguridad** | ¿Cómo protege datos y acceso no autorizado? | Algoritmos específicos, longitudes de clave, protocolos |
| **Confiabilidad** | ¿Con qué frecuencia puede fallar? | % de uptime mensual / horas máximas de downtime |
| **Usabilidad** | ¿Qué tan fácil es para el usuario completar la tarea? | Tiempo de completar flujo clave / tasa de éxito % |
| **Mantenibilidad** | ¿Qué tan difícil es modificarlo sin romper otras cosas? | Máximo de componentes impactados por un cambio |
| **Escalabilidad** | ¿Cuánto puede crecer sin rediseño? | Multiplicador de carga sin degradación > X% |

### Cómo definir un NFR bien formado

❌ **NFR mal formado:** "El sistema debe ser rápido y seguro."

✅ **NFR bien formado:**
```
NFR-U1-01 (Desempeño)
Métrica: P95 de latencia en /auth/login < 500ms con 1,000 requests/min concurrentes.
Condición de fallo: si P95 > 500ms durante > 2 minutos consecutivos → alerta CloudWatch.
```

*Ejemplo completo (EntreVista AI — U1):*

| ID | Atributo | Métrica | Justificación |
| :--- | :--- | :--- | :--- |
| `NFR-U1-01` | Desempeño | P95 latencia /auth/login < 500ms con 1,000 req/min | El login es el primer punto de contacto del Reclutador — lentitud genera abandono |
| `NFR-U1-02` | Seguridad | Passwords: bcrypt factor 10 · JWT: RS256 RSA-4096 · Transmisión: TLS 1.3 | Datos de identidad son los más sensibles del sistema |
| `NFR-U1-03` | Confiabilidad | Disponibilidad 99.5% mensual (~3.6h downtime/mes) | Balance costo/estabilidad para MVP |
| `NFR-U1-04` | Usabilidad | El Reclutador completa el flujo login→dashboard en < 30s con tasa de éxito ≥ 99% | Auth debe ser invisible — si el Reclutador nota el login algo falló |
| `NFR-U1-05` | Mantenibilidad | Cambios en TokenManager no impactan más de 1 componente (AuthService) | Tokens son el componente más volátil de Auth |
| `NFR-U1-06` | Escalabilidad | +300% usuarios sin cambios arquitectónicos, degradación < 20% en latencia | La plataforma puede crecer 3x antes de necesitar rediseño de Auth |

**Prompt para generarlo:**

```
"Iniciamos la Actividad 2 (NFR Requirements) para la Unidad [nombre].
Hazme las preguntas necesarias para definir los NFRs de los 6 atributos
de calidad: desempeño, seguridad, confiabilidad, usabilidad,
mantenibilidad y escalabilidad."
```

> 💡 **Tip:** Si no sabes el valor numérico exacto, es válido razonar desde el negocio: "el candidato no puede esperar más de 2 segundos entre mensajes porque el ritmo conversacional se rompe" → NFR-U2-01: latencia respuesta agente < 2s P95. El número viene del comportamiento esperado del usuario, no de benchmarks técnicos.

---

## Actividad 3 — Diseño de requerimientos no funcionales (ADR)

**Objetivo:** Para cada NFR significativo, definir el patrón o estrategia técnica que lo resuelve, y documentar la decisión como un ADR.

**Artefacto generado:** `nfr-design.md` (que contiene los ADRs por NFR)

### El flujo de diseño NFR en 3 pasos

```
01 Pregunta (cómo)  →  02 NF Requirement  →  03 Diseño NFR (patrón + ADR)
```

Este flujo se repite por cada NFR relevante. No todos los NFRs necesitan un ADR — solo los que impliquen una decisión significativa (difícil o costosa de revertir).

### Estructura completa de un ADR

```markdown
# ADR-[Unidad]-[Número]: [Título descriptivo]

## Contexto
[La situación que fuerza esta decisión. Qué problema existiría sin ella.]

## Decisión
[Qué se decide, sin ambigüedades.]

## Alternativas consideradas
- **[Opción A]** — descartada porque [razón técnica o de negocio]
- **[Opción B]** — descartada porque [razón técnica o de negocio]

## Consecuencias
- ✅ [Resultado positivo de la decisión]
- ⚠️ [Trade-off que se acepta conscientemente]

## NFR relacionado
[ID del NFR que esta decisión resuelve]

## Estado
[Propuesto | Aceptado | Deprecado | Reemplazado por ADR-X]
```

### Los ADRs esperados para la Unidad 1 (referencia)

*Ejemplo completo (EntreVista AI — U1):*

---

**ADR-U1-01: Degraded Mode (Redis → PostgreSQL Fallback)**

```
NFR relacionado: NFR-U1-03 (Confiabilidad — 99.5%)

Contexto:
Redis es la capa de caché de sesiones activas. Su fallo sin fallback
interrumpe a candidatos en medio de una entrevista, violando NFR-U1-03.

Decisión:
Implementar bloque Try/Except en SessionStore con fallback transparente
a PostgreSQL para persistencia de sesión cuando Redis no responde.

Alternativas consideradas:
- Fallar rápido (Fast Fail) — descartada: interrumpe al candidato activo.
- Solo Redis, mayor SLA — descartada: costo desproporcionado para MVP.

Consecuencias:
✅ Garantiza NFR-U1-03 ante fallos de infraestructura de caché.
⚠️ Latencia en modo degradado +200ms por acceso a PostgreSQL vs Redis.
⚠️ Lógica de fallback añade complejidad al SessionStore.

Estado: Aceptado
```

---

**ADR-U1-02: JWT RS256 con rotación de claves via AWS Secrets Manager**

```
NFR relacionado: NFR-U1-02 (Seguridad)

Contexto:
Los tokens JWT son el mecanismo de autenticación principal.
HS256 (simétrico) requiere compartir la clave secreta entre servicios —
riesgo de exposición si un servicio es comprometido.

Decisión:
Usar RS256 con par de claves RSA-4096: la clave privada firma en Auth Service,
la clave pública verifica en todos los Consumer Services via /auth/jwks.
Ambas claves almacenadas en AWS Secrets Manager con rotación cada 90 días.

Alternativas consideradas:
- HS256 (HMAC-SHA256) — descartada: clave compartida aumenta superficie de ataque.
- Ed25519 — descartada: soporte más limitado en librerías Python del ecosistema actual.

Consecuencias:
✅ Verificación de tokens sin compartir secretos entre servicios.
✅ Rotación de claves sin redeploy de consumidores (JWKS endpoint).
⚠️ Mayor latencia en firma (~2ms adicionales vs HS256).
⚠️ Complejidad de gestión de claves en Secrets Manager.

Estado: Aceptado
```

---

**ADR-U1-03: Rate Limiting granular por endpoint en API Gateway**

```
NFR relacionado: NFR-U1-02 (Seguridad — protección contra fuerza bruta)

Contexto:
El endpoint /auth/login es el objetivo más probable de ataques de fuerza bruta.
Un rate limiting genérico no distingue entre endpoints críticos y operacionales.

Decisión:
Rate throttling diferenciado por endpoint en API Gateway HTTP API:
- /auth/login: 5 req/min/IP
- /auth/refresh, /auth/logout: 30 req/min/IP
- /auth/jwks: 100 req/min/IP (solo cold start de consumidores)

Alternativas consideradas:
- Rate limiting uniforme global — descartada: demasiado restrictivo para /auth/jwks.
- Rate limiting solo en Lambda (BruteForceProtector) — descartada:
  no protege a nivel de infraestructura antes de que el request consuma recursos.

Consecuencias:
✅ Protección en capas: API Gateway + BruteForceProtector en dominio.
✅ Sin costo adicional (API Gateway throttling incluido en el tier).
⚠️ Configuración manual por endpoint en cada redeploy.

Estado: Aceptado
```

**Prompt para generarlo:**

```
"Iniciamos la Actividad 3 (NFR Design) para la Unidad [nombre].
Para cada NFR definido, sigue el flujo: Pregunta (cómo) → NFR Requirement
→ Diseño NFR con patrón técnico. Documenta cada decisión significativa
como un ADR con estructura: Contexto, Decisión, Alternativas,
Consecuencias, Estado."
```

> 💡 **Cuántos ADRs necesitas:** mínimo 1 por cada NFR que implique una decisión no reversible. Para la Unidad 1 de Auth, espera entre 3 y 5 ADRs. Para unidades más simples, 1 o 2 puede ser suficiente.

> ⚠️ **Señal de alerta:** Si el campo "Consecuencias" de tu ADR solo tiene ítems positivos (✅), no has pensado suficientemente los trade-offs. Toda decisión arquitectónica tiene un costo — si no puedes verlo, es porque está escondido en deuda técnica futura.

---

## Actividad 4 — Diseño de infraestructura

**Objetivo:** Definir la plataforma tecnológica que soporta la unidad — desde el Build hasta el Deploy — y generar el diagrama de despliegue completo.

**Artefactos generados:** `infrastructure-design.md` + `deployment-architecture.md`

### El proceso en 3 pasos

```
STEP 01: Build         STEP 02: Provision         STEP 03: Deploy
─────────────────      ──────────────────────      ───────────────────
Configurar el          Aprovisionar los            Desplegar el código
entorno de build       recursos de nube            en los recursos
(Makefile, deps,       (Lambda, RDS, Redis,        aprovisionados y
pyproject.toml)        VPC, IAM roles)             verificar health
```

### Artefacto 1: `infrastructure-design.md`

Captura tres capas del diseño de infraestructura:

**Capa 1 — Mapa de servicios:** componente, servicio de nube y configuración base.

*Ejemplo (EntreVista AI — U1):*

| Componente | Servicio AWS | Configuración base |
| :--- | :--- | :--- |
| API Entry Point | API Gateway HTTP API | Route throttling por endpoint; logging a CloudWatch |
| Compute | Lambda `entrevista-auth` | Python 3.12 · arm64 · 512 MB · 30s timeout |
| Database | MongoDB Atlas (VPC Peered) | Motor async driver · maxPoolSize=1 · TLS 1.2+ |
| Secrets | AWS Secrets Manager | 4 secrets: RS256 private/public keys, bootstrap secret, MongoDB URI |
| Networking | VPC Private Subnets | VPC Endpoint privado para Secrets Manager (sin NAT) |
| Observability | CloudWatch Logs + Alarms | 90-day retention · Alarms: Errors > 5/5min, Throttles > 0/5min |

**Capa 2 — Configuración por servicio:** recursos, arquitectura, métodos, políticas.

**Capa 3 — Definiciones transversales:** seguridad, observabilidad, distribución de redes.

*Ejemplo (EntreVista AI — U1):*

```markdown
## Seguridad transversal
- IAM Role: mínimo privilegio (solo GetSecretValue en entrevista/auth/*)
- VPC Endpoint: comunicación privada con Secrets Manager sin salida a internet
- Secrets: rotación cada 90 días via Secrets Manager rotation

## Observabilidad
- Structured JSON logging: todos los eventos de auditoría a stdout (capturados por Lambda runtime)
- CloudWatch Alarms:
  - Errors > 5 en 5 minutos → SNS notification
  - Throttles > 0 en 5 minutos → SNS notification
  - HTTP 5XX en /auth/login > 3 en 5 minutos → SNS critical

## Redes
- Subnets privadas en us-east-1a y us-east-1b (multi-AZ para confiabilidad)
- VPC Peering con MongoDB Atlas (sin tráfico de DB en internet público)
```

### Artefacto 2: `deployment-architecture.md`

El diagrama de despliegue completo en Mermaid. Este es el artefacto que el agente usa como contrato para generar código de infraestructura (IaC).

**Prompt para generarlo:**

```
"Iniciamos la Actividad 4 (Infrastructure Design) para la Unidad [nombre].
Basándote en los NFRs, ADRs y el application-design.md de Inception,
genera el infrastructure-design.md con mapa de servicios, configuración
por servicio y definiciones transversales. Luego genera el
deployment-architecture.md como diagrama Mermaid completo."
```

**Criterios de validación del diagrama:**
- [ ] ¿Todos los componentes del `application-design.md` tienen un servicio de nube correspondiente?
- [ ] ¿Las rutas de tráfico son correctas (API Gateway → Lambda → DB, no al revés)?
- [ ] ¿Los recursos de seguridad (IAM, VPC, Secrets) están explícitamente en el diagrama?
- [ ] ¿El diagrama es legible por alguien que no participó en la sesión?

---

## Actividad 5 — Generación de código

**Objetivo:** Generar código funcional de producción en el orden correcto, usando todos los artefactos anteriores como contrato.

**Artefactos generados:** Código fuente completo de la unidad.

### El orden de generación importa

El agente genera el código en este orden porque cada bloque depende del anterior. No cambies el orden:

```
1. Project Structure Setup    → carpetas y archivos base
2. Config & Secrets           → variables de entorno y conexión a secretos
3. Entry Point                → handler.py (Lambda) + app.py (FastAPI)
4. Database Layer             → conexión async a MongoDB (Motor)
5. Domain Models              → entidades del domain-entities.md
6. Core Services              → lógica del business-logic-model.md
7. Audit Logger               → eventos estructurados JSON
8. Auth Middleware            → validación JWT en requests entrantes
9. Request/Response Schemas   → Pydantic models para validación
10. API Router                → endpoints y sus handlers
11. Unit Tests                → pruebas de lógica de dominio
12. Integration Tests         → pruebas de flujos E2E via API
13. Documentación             → code-summary.md
```

### Estructura de código resultante

*Ejemplo (EntreVista AI — U1):*

```
src/
├── app.py              ← FastAPI application factory
├── handler.py          ← Mangum ASGI adapter (Lambda entry point)
├── config.py           ← Pydantic Settings: env vars y configuración
├── secrets.py          ← AWS Secrets Manager: carga lazy + caché por instancia
├── auth_service.py     ← Domain Service: login, refresh, logout, change-password
├── token_manager.py    ← RS256: firma, verificación, JWKS, revocación
├── operator_manager.py ← Aggregate: create, get, update, deactivate Operator
├── brute_force.py      ← BruteForceProtector: contador de intentos + lockout
├── audit_logger.py     ← Structured JSON audit events → stdout
├── db/
│   └── mongo.py        ← Motor async client + connection pooling
├── middleware/
│   └── auth.py         ← JWT validation FastAPI dependency
├── models/
│   ├── operator.py     ← Operator MongoDB document model
│   └── token.py        ← RefreshToken + RevokedToken MongoDB models
├── schemas/
│   ├── auth.py         ← LoginRequest, TokenResponse, RefreshRequest
│   └── operator.py     ← OperatorCreate, OperatorUpdate, OperatorResponse
└── router.py           ← API routes: /auth/login, /auth/refresh, /auth/logout, /auth/jwks
```

### Cómo trabajar la generación bloque por bloque

El framework genera un bloque, lo presenta para revisión y espera aprobación antes de continuar. **No uses "aprueba todo de una vez"** — ese es el momento donde tú como humano verificas que el código corresponde al contrato de los artefactos anteriores.

Por cada bloque generado, verifica:
- [ ] ¿Los nombres de clases y métodos usan el lenguaje ubicuo del `domain-entities.md`?
- [ ] ¿Las reglas de negocio de `business-rules.md` están implementadas como código, no como comentarios?
- [ ] ¿El código maneja los casos de error definidos en las historias Gherkin?
- [ ] ¿Los type hints están presentes en Python (o equivalente en el lenguaje del proyecto)?

**Prompt para iniciar la generación:**

```
"Iniciamos la Actividad 5 (Code Generation) para la Unidad [nombre].
Genera el código en el orden definido por el framework, un bloque a la vez.
Espera mi aprobación antes de continuar al siguiente bloque.
Sigue los estándares definidos en CLAUDE.md."
```

---

## Actividad 6 — Pruebas: diseño y enfoques

**Objetivo:** Generar pruebas que verifiquen el comportamiento de negocio (no la implementación técnica), usando los escenarios Gherkin de Inception como casos de prueba base.

**Artefactos generados:** Suite de tests unitarios + integración.

### Los 4 principios del diseño de pruebas en AI-DLC

**1. Alta Testabilidad Orgánica**
El código generado desde especificaciones DDD es naturalmente testeable porque cada componente tiene una sola responsabilidad clara. Si un componente es difícil de testear, es señal de que tiene demasiadas responsabilidades — no de que los tests sean difíciles de escribir.

**2. Pruebas de Comportamiento vs Implementación**
Probar *qué hace el sistema desde la perspectiva del negocio*, no *cómo está implementado internamente*. Un test que falla al renombrar una variable interna es un test de implementación. Un test que falla cuando el negocio no funciona correctamente es un test de comportamiento.

**3. Cobertura de Casos Borde (Edge Cases)**
Los escenarios Gherkin de Inception ya identificaron los edge cases (camino alternativo, errores, condiciones límite). Los tests de Construction los ejecutan. Si tu `user-stories.md` tiene 2 escenarios por historia (happy path + alternativo), tienes la mitad del trabajo de testing ya hecho.

**4. Código Mínimo Indispensable**
No se prueban getters, setters ni constructores. Se prueban las **reglas de negocio** y los **contratos de las interfaces públicas**. Cobertura del 100% de líneas no es el objetivo — cobertura del 100% de comportamientos críticos sí lo es.

### Los dos enfoques de escritura de tests

#### Enfoque AAA (Arrange — Act — Assert)

Para pruebas unitarias de **lógica algorítmica pura**: transformaciones de datos, algoritmos, utilidades, patrones de retry, formateadores.

```python
def test_evaluator_aprueba_candidato_con_puntaje_superior():
    # Arrange: preparar el estado inicial
    min_passing_score = 75
    evaluator = InterviewEvaluatorService(min_passing_score)
    candidate = Candidate("Juan Pérez", score=85)

    # Act: ejecutar el método bajo prueba
    result = evaluator.evaluate_candidate(candidate)

    # Assert: verificar el resultado esperado
    assert result.is_approved is True
    assert result.status == "PROCEEDS_TO_NEXT_ROUND"
```

**Cuándo usar AAA:** cuando el test verifica un cálculo o transformación sin contexto de negocio — el foco es el resultado matemático o lógico.

#### Enfoque GWT (Given — When — Then)

Para pruebas de **lógica de dominio, casos de uso y servicios de aplicación**. Fuerza a pensar en comportamientos (lo que al negocio le importa) en lugar de en implementación (lo que al compilador le importa).

```python
def test_operador_bloqueado_tras_cinco_intentos_fallidos():
    # Given: estado del mundo según la regla de negocio
    a_required_lockout_threshold = 5
    brute_force_protector = BruteForceProtector(a_required_lockout_threshold)
    an_operator_email = "reclutador@empresa.com"

    # When: ocurre el evento de negocio (5 intentos fallidos consecutivos)
    for _ in range(5):
        brute_force_protector.record_failed_attempt(an_operator_email)

    # Then: el resultado observable desde el negocio
    assert brute_force_protector.is_locked(an_operator_email) is True
```

**Cuándo usar GWT:** cuando el test verifica que el sistema se comporta según una regla de negocio — el foco es el comportamiento observable por el usuario o el sistema.

> 💡 **Regla práctica:** si puedes leer el test en voz alta y tiene sentido para alguien de negocio (no técnico), es un buen test GWT. Si solo tiene sentido para un desarrollador, es un test AAA.

### Estructura de tests y su conexión con Inception

```
tests/
├── unit/
│   ├── test_auth_service.py         ← GWT: reglas de login, refresh, logout
│   │                                   (escenarios Gherkin de HU-01, HU-03)
│   ├── test_brute_force.py          ← AAA: contador, lockout, reset
│   │                                   (RULE-AUTH-01)
│   └── test_operator_manager.py     ← GWT: ciclo de vida del operador
│                                       (escenarios Gherkin de HU-02)
└── integration/
    ├── test_auth_endpoints.py       ← GWT: flujo completo E2E via HTTP
    │                                   (happy path + casos de error por endpoint)
    └── test_operator_endpoints.py   ← GWT: CRUD de operadores via API
```

**La conexión con Inception:** cada test de integración debería poder trazarse a un escenario Gherkin del `user-stories.md`. Si tienes un test sin escenario de origen, es código sin especificación. Si tienes un escenario sin test, es especificación sin verificación.

**Prompt para generarlos:**

```
"Iniciamos la Actividad 6 (Tests) para la Unidad [nombre].
Genera los tests unitarios con enfoque AAA para lógica algorítmica
y GWT para lógica de dominio. Los tests de integración deben
cubrir los escenarios Gherkin definidos en @user-stories.md.
Genera un bloque de tests a la vez."
```

### Cobertura mínima esperada por unidad

| Tipo | Cobertura objetivo | Qué verificar |
| :--- | :--- | :--- |
| Tests unitarios | Todas las reglas de negocio del `business-rules.md` | Happy path + edge cases de cada regla |
| Tests de integración | Todos los escenarios Gherkin del `user-stories.md` | Happy path + escenario alternativo por historia |
| Tests de aceptación | Criterios de éxito MVP del `requirements-analysis.md` | Los 2-3 criterios que definen si el MVP funciona |

---

## Checklist de entrega

Antes de dar por completa la fase Construction de una unidad, verifica:

### Diseño funcional
- [ ] `domain-entities.md` con bounded context, entidades, value objects y aggregates definidos
- [ ] `business-rules.md` con todas las reglas numeradas (RULE-[ID]) y su fuente en Inception
- [ ] `business-logic-model.md` con flujos E2E completos y estados posibles para cada flujo principal

### NFRs y ADR
- [ ] `nfr-requirements.md` con los 6 atributos de calidad y valores numéricos concretos
- [ ] `nfr-design.md` con al menos 1 ADR por NFR significativo, incluyendo campo Consecuencias con ⚠️ explícitos
- [ ] Cada ADR tiene estado definido (Propuesto / Aceptado / Deprecado)

### Infraestructura
- [ ] `infrastructure-design.md` con mapa de servicios, configuración por servicio y definiciones transversales
- [ ] `deployment-architecture.md` con diagrama Mermaid completo y legible
- [ ] Diagrama validado: todos los componentes del `application-design.md` tienen servicio correspondiente

### Código y pruebas
- [ ] Código generado en el orden correcto (Project Structure → ... → API Router)
- [ ] Nombres de código usan el lenguaje ubicuo del `domain-entities.md`
- [ ] Tests unitarios cubren todas las reglas del `business-rules.md`
- [ ] Tests de integración trazan a escenarios Gherkin del `user-stories.md`

### Criterios de calidad transversales
- [ ] Ningún artefacto fue aprobado sin revisión (no se usó "aprueba todo automáticamente")
- [ ] Cada ADR tiene alternativas descartadas con razón explícita
- [ ] El `business-logic-model.md` es legible sin conocimiento técnico previo

---

## Recursos

| Recurso | Enlace | Para qué |
| :--- | :--- | :--- |
| AI-DLC Framework (AWS Labs) | [aidlc-workflows v1.0.1](https://github.com/awslabs/aidlc-workflows/releases/tag/v1.0.1) | Framework completo — fases Inception y Construction |
| DDD Táctico — referencia | [Domain-Driven Design Reference (Evans)](https://www.domainlanguage.com/ddd/reference/) | Patrones: Entities, Value Objects, Aggregates, Services |
| ADR Examples | [adr.github.io](https://adr.github.io) | Formatos y ejemplos de Architecture Decision Records |
| MADR Template | [github.com/adr/madr](https://github.com/adr/madr) | Template ligero de ADR recomendado para equipos ágiles |
| C4 Model | [c4model.com](https://c4model.com) | Diagramas de despliegue (Nivel 3 — Component) |
| FastAPI + Mangum (Lambda) | [mangum.io](https://mangum.io) | ASGI adapter para deploy de FastAPI en AWS Lambda |
| Motor (MongoDB async) | [motor.readthedocs.io](https://motor.readthedocs.io) | Driver async de MongoDB para Python |
