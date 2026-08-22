# Construye tu primer agente de IA: triage de tickets de soporte con Claude, MCP y Skills

Bienvenido. En esta guía vas a construir, paso a paso, un **agente de IA** que trabaja de verdad: lee tickets de soporte pendientes desde una base de datos en Supabase, los clasifica por criticidad (alta, media o baja) siguiendo las reglas de tu negocio, y actualiza la base de datos con su evaluación.

Lo interesante no es el resultado final, sino el camino. Vas a ver con tus propios ojos la diferencia entre tres momentos:

1. **Un LLM solo** — un modelo de lenguaje que razona muy bien, pero que no puede tocar tus sistemas.
2. **Un LLM con MCP** — le conectamos "manos y ojos" para que vea y modifique tu base de datos.
3. **Un agente con Skill** — le entregamos la "receta" de tu empresa para que haga la tarea bien, igual, todas las veces.

Esa suma es, en esencia, lo que hoy llamamos un agente:

```
AGENTE  =  Modelo (razona)  +  MCP (actúa sobre sistemas)  +  Skill (sabe el procedimiento)
```

Esta guía está pensada para que la sigas en vivo durante la clase **y también para que la repitas completa en tu casa**. Si es tu primera vez, empieza por el **Anexo A** (instalar Claude CLI y crear tu cuenta de Supabase) y el **Anexo B** (preparar la base de datos). Si ya tienes todo instalado, sigue de largo.

**Archivos que acompañan esta guía** (carpeta `referencias/`):

| Archivo | Para qué sirve |
|---|---|
| `demo-paso-a-paso.md` | Este documento |
| `SKILL-triage-tickets.md` | El contenido del skill, listo para copiar |
| `setup-tickets.sql` | Alternativa: crear tabla y datos con SQL directo |
| `reset-tickets.sql` | Alternativa: "rebobinar" la demo con SQL directo |

---

## Antes de empezar: checklist

Verifica que tienes todo esto listo (los anexos te explican cómo conseguir cada cosa):

- [ ] Claude Code CLI instalado y con sesión iniciada → **Anexo A**
- [ ] Una cuenta de Supabase con un proyecto creado → **Anexo A**
- [ ] Un *Personal Access Token* de Supabase (`sbp_...`) y el *project ref* de tu proyecto → **Anexo A**
- [ ] La tabla `tickets` creada y con los 8 tickets de prueba cargados → **Anexo B**
- [ ] Una carpeta de trabajo para el ejercicio (aquí usamos `agente-soporte/`)

Un consejo si vas a compartir pantalla o grabar: ten tu token en un archivo aparte fuera de la vista. Un token es una contraseña.

---

## ACTO 1 — El LLM solo: sabe pensar, no puede actuar

Empecemos por lo más básico: abrir una conversación con un modelo de lenguaje. Vamos a usar **Haiku**, el modelo más rápido y económico de la familia Claude, porque para esta tarea no necesitamos más.

Abre una terminal, entra a tu carpeta de trabajo y arranca el chat:

```bash
cd agente-soporte
claude --model haiku
```

Ya estás conversando con un LLM. Ahora hagamos un experimento en dos partes.

**Primero, comprobemos que razona bien.** Escríbele esto:

> Eres un analista de soporte. Si te doy este ticket: "Ningún usuario puede ingresar a la plataforma, error 500 en login", ¿qué criticidad le pondrías y por qué?

Fíjate en la respuesta: es buena. El modelo entiende el dominio de soporte, argumenta, probablemente diga "criticidad alta" con razones sensatas. El "cerebro" funciona.

**Ahora, pidámosle algo que requiere actuar.** Escríbele:

> Perfecto. Ahora revisa los tickets pendientes que tenemos en nuestra base de datos y clasifícalos.

Y aquí viene el momento importante: **no puede**. Te va a responder algo como "no tengo acceso a tu base de datos". Y tiene razón: un LLM, por sí solo, es un motor de razonamiento encerrado en una caja. No ve tus sistemas, no ejecuta acciones, no toca datos.

> 💡 **La idea que te llevas del Acto 1:** el modelo ya sabe *pensar* como un analista de soporte. Lo que le falta no es inteligencia: son *manos*. Eso es exactamente lo que resuelve MCP.

Sal del chat con `/exit` (o `Ctrl+C`).

---

## ACTO 2 — Conectamos las manos: MCP de Supabase

**MCP (Model Context Protocol)** es un protocolo abierto que estandariza cómo un modelo de IA se conecta con sistemas externos. Piénsalo como el USB-C de la IA: un mismo "enchufe" para bases de datos, APIs, navegadores, lo que sea. Cada *servidor MCP* expone un conjunto de herramientas (listar tablas, ejecutar SQL, etc.) que el modelo puede invocar cuando las necesita.

Supabase publica su propio servidor MCP oficial. Vamos a registrarlo en Claude Code. En la terminal (fuera del chat), ejecuta — reemplazando `sbp_TU_TOKEN` y `TU_PROJECT_REF` por tus valores del Anexo A:

```bash
claude mcp add supabase \
  -e SUPABASE_ACCESS_TOKEN=sbp_TU_TOKEN \
  -- npx -y @supabase/mcp-server-supabase@latest \
  --project-ref=TU_PROJECT_REF
```

Dos detalles de este comando que vale la pena entender:

- `--project-ref=...` limita el acceso a **un solo proyecto** de Supabase. El agente no podrá tocar nada más de tu cuenta.
- Existe también un flag `--read-only` para conectar en modo solo-lectura. Hoy **no** lo usamos, porque nuestro agente necesita actualizar tickets. Pero en un escenario real, arrancar en solo-lectura es una excelente práctica de seguridad.

Comprueba que quedó conectado:

```bash
claude mcp list
```

Debe aparecer `supabase: ... ✓ Connected`. Ahora vuelve a entrar al chat:

```bash
claude --model haiku
```

Dentro del chat puedes escribir `/mcp` para ver el servidor y la lista de herramientas que le acaba de "crecer" al modelo. Vale la pena mirarla un momento: ahí están las manos nuevas.

**Repitamos la pregunta que antes falló.** Escríbele:

> Lista los tickets de soporte pendientes de nuestra base de datos, en una tabla con id, título, cliente y estado.

Observa lo que pasa: el agente explora la base de datos, encuentra la tabla `tickets`, arma una consulta SQL, y te muestra los 8 tickets. En el camino, Claude Code te pedirá **aprobación** antes de ejecutar cada herramienta del MCP. Eso no es un estorbo, es una característica: tú sigues en control de lo que el agente puede hacer.

**Ahora descubramos el problema que nos falta resolver.** Pídele:

> Clasifica el ticket 3 por criticidad.

Va a responder con *su* criterio: el criterio genérico de un modelo entrenado con conocimiento general. Y aquí hazte (o hazle a tu audiencia) estas preguntas:

- ¿Y si en mi empresa todo lo que afecta ventas es automáticamente criticidad alta?
- ¿Quién garantiza que además de clasificar, actualice los campos correctos (`estado`, `actualizado_en`)?
- ¿Y si mañana otra persona del equipo corre esto y el modelo clasifica distinto?

> 💡 **La idea que te llevas del Acto 2:** con MCP el agente ya *puede* actuar, pero actúa con criterio genérico. Le falta el procedimiento de TU empresa. Eso es un skill.

Sal del chat con `/exit`.

---

## ACTO 3 — La receta: un Skill de triage

Un **skill** es, en su forma más simple, un archivo markdown con instrucciones que el agente carga automáticamente cuando detecta que la tarea lo amerita. Es la "receta" de cómo se hace algo en tu organización: qué proceso seguir, qué reglas aplicar, qué campos actualizar. Y como es un archivo de texto, se versiona en git y se comparte con el equipo — la receta deja de vivir en la cabeza de una persona.

En Claude Code, los skills de un proyecto viven en `.claude/skills/<nombre>/SKILL.md`. Creemos el nuestro:

```bash
mkdir -p .claude/skills/triage-tickets
cp referencias/SKILL-triage-tickets.md .claude/skills/triage-tickets/SKILL.md
```

Abre el archivo y léelo con calma (está completo en `referencias/SKILL-triage-tickets.md`). Su estructura tiene tres partes que conviene entender:

**1. El frontmatter** (el bloque entre `---` al inicio):

```yaml
---
name: triage-tickets
description: Realiza el triage de tickets de soporte pendientes en Supabase,
  asignando criticidad (alta, media, baja) según las reglas del negocio...
---
```

La `description` no es decorativa: es lo que el agente lee para decidir **cuándo** activar este skill. Si le pides "haz el triage de los tickets", el agente conecta tu petición con esta descripción y carga la receta.

**2. El proceso**: la secuencia exacta de pasos — consultar los pendientes, clasificar, y actualizar cada ticket con `criticidad`, `nota_triage`, `estado = 'clasificado'` y `actualizado_en = now()`. Sin el skill, nada garantiza que el agente actualice esos campos; con el skill, es parte de la receta.

**3. Las reglas de criticidad**: aquí vive el criterio del negocio. Fíjate en particular en esta regla:

> ALTA: errores que impiden al cliente vender, facturar o cobrar (**aunque sean intermitentes**).

Un LLM genérico clasificaría un "error intermitente con workaround de reintentar" como criticidad media. Nuestra regla dice que si el cliente pierde ventas, es alta, punto. **Esa es la diferencia entre el criterio del modelo y el criterio del negocio** — y es la razón de ser de los skills.

Ahora sí, el momento que veníamos construyendo. Entra de nuevo al chat:

```bash
claude --model haiku
```

Y escribe una sola frase:

> Haz el triage de los tickets de soporte pendientes.

Observa la secuencia completa: el agente detecta y carga el skill (lo verás indicado en la terminal), consulta los tickets pendientes por MCP, clasifica cada uno con TUS reglas, ejecuta los UPDATEs (aprobándolos tú), y al final te presenta el resumen ordenado por criticidad.

Cuando termine, revisa los resultados con ojo crítico:

- El **"error intermitente al guardar pedidos"** debió quedar en **ALTA** — el cliente pierde ventas, la regla del negocio le ganó al criterio genérico.
- La **"posible fuga de datos"** debió quedar en **ALTA** — la regla dice "ante la duda, seguridad es alta".
- El **"reporte no exporta a PDF"** debió quedar en **MEDIA** — hay workaround (Excel).
- El **logo** y el **modo oscuro** debieron quedar en **BAJA**.

Si el agente no activara el skill solo (raro, pero puede pasar), invócalo explícitamente escribiendo `/triage-tickets` en el chat.

---

## Cerrando el círculo: verificar en la base de datos

Un agente que dice "listo" no es suficiente: verifiquemos que la base de datos realmente cambió. Abre el dashboard de Supabase en el navegador, ve a **Table Editor → tickets** y comprueba:

- `criticidad` y `nota_triage` ahora tienen valores.
- `estado` pasó de `pendiente` a `clasificado`.
- `actualizado_en` es más reciente que `creado_en`.

También puedes pedírselo al propio agente, desde el chat:

> ¿Cuántos tickets quedaron en cada nivel de criticidad? Dame el conteo desde la base de datos.

**¿Quieres repetir todo el ejercicio?** Pídele al agente que "rebobine" (ver el prompt de reset en el Anexo B) o ejecuta `referencias/reset-tickets.sql` en el SQL Editor de Supabase. Los tickets vuelven a `pendiente` y puedes correr el triage de nuevo.

---

## Qué acabas de construir (y a dónde llevarlo)

En menos de una hora pasaste de un chat "encerrado en una caja" a un agente que consulta, decide con reglas de negocio y escribe en una base de datos real. El patrón que aplicaste es general:

- **Otros casos del mismo patrón:** conciliación contable, revisión de PQRs, calificación de leads en un CRM, moderación de contenido, seguimiento de inventario.
- **Siguiente nivel:** programar el agente para que corra solo (tareas programadas / agentes en la nube) y el triage ocurra sin que nadie lo pida.
- **Gobernanza:** permisos por herramienta, modo `--read-only`, aprobación humana de acciones sensibles. Un agente con acceso a sistemas se diseña con la misma seriedad que un empleado con accesos.

---
---

# ANEXO A — Instalación y cuentas (hazlo una sola vez)

## A.1 Instalar Claude Code CLI

Claude Code es la herramienta de línea de comandos de Anthropic para trabajar con agentes desde la terminal. Necesitas una cuenta de Claude (plan Pro o Max) o una cuenta de la API de Anthropic.

**macOS / Linux / WSL:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows (PowerShell):**

```powershell
irm https://claude.ai/install.ps1 | iex
```

(Alternativa vía npm, si ya usas Node.js: `npm install -g @anthropic-ai/claude-code`)

Verifica la instalación e inicia sesión:

```bash
claude --version
claude          # dentro del chat, escribe /login y sigue el flujo en el navegador
```

Documentación oficial: https://code.claude.com/docs

## A.2 (Opcional) Instalar Claude Desktop

Claude Desktop es la aplicación de escritorio de Claude para Mac y Windows. No la usamos en este ejercicio (todo corre en la CLI), pero también soporta servidores MCP y es útil para uso conversacional diario.

1. Descárgala desde https://claude.ai/download
2. Instala y entra con la misma cuenta de Claude.

## A.3 Crear una cuenta y un proyecto en Supabase

Supabase es una plataforma de base de datos PostgreSQL en la nube con un plan gratuito más que suficiente para este ejercicio.

1. Entra a https://supabase.com y regístrate (con GitHub o correo). El plan **Free** basta.
2. Crea una **organización** (te la pedirá la primera vez) y luego un **proyecto**, por ejemplo `demo-triage`. Elige la región más cercana y guarda la contraseña de la base de datos que te pide (no la usaremos hoy, pero guárdala).
3. Espera 1–2 minutos a que el proyecto termine de aprovisionarse.

## A.4 Obtener las dos credenciales que necesita el MCP

1. **Personal Access Token:** en el dashboard de Supabase, haz clic en tu avatar → **Account Settings → Access Tokens → Generate new token**. Dale un nombre (ej. `mcp-demo`) y copia el token que empieza con `sbp_...`. **Se muestra una sola vez**: guárdalo en un lugar seguro.
2. **Project ref:** es el identificador de tu proyecto. Lo ves en la URL del dashboard: `https://supabase.com/dashboard/project/<ESTE-ES-TU-PROJECT-REF>`, o en **Project Settings → General**.

> 🔐 Trata el token como una contraseña: no lo pegues en documentos, no lo muestres en pantalla compartida, y revócalo cuando termines de practicar.

---

# ANEXO B — Preparar la base de datos usando el propio MCP

Aquí hay algo bonito: **vamos a usar el mismo agente para preparar su propia base de datos**. En lugar de escribir SQL a mano en el dashboard, le describimos al agente la estructura y los datos que queremos, y él ejecuta las operaciones por MCP. (Si prefieres el camino tradicional, al final tienes la alternativa con SQL directo.)

**Prerrequisito:** haber registrado el MCP de Supabase (comando `claude mcp add supabase ...` del Acto 2).

## B.1 Crear la estructura

Entra al chat (`claude --model haiku`, aunque para este paso puedes usar cualquier modelo) y pídele:

> Crea en Supabase una tabla llamada `tickets` para tickets de soporte, con estas columnas:
> - `id`: serial, llave primaria
> - `titulo`: texto, obligatorio
> - `descripcion`: texto
> - `cliente`: texto
> - `estado`: texto, con valor por defecto 'pendiente' (valores posibles: pendiente, clasificado)
> - `criticidad`: texto, puede ser nulo (valores posibles: alta, media, baja)
> - `nota_triage`: texto, puede ser nulo
> - `creado_en`: timestamp con zona horaria, por defecto now()
> - `actualizado_en`: timestamp con zona horaria, por defecto now()

El agente generará el `CREATE TABLE` y lo aplicará (aprueba la operación cuando te lo pida).

## B.2 Cargar los datos de prueba

Los 8 tickets están diseñados a propósito: hay casos obvios en ambos extremos y casos "grises" donde se nota el valor del skill. Pídele al agente:

> Inserta en la tabla `tickets` estos 8 tickets de prueba (deja estado, criticidad y fechas en sus valores por defecto):
>
> 1. titulo: "Sistema caído en producción" — descripcion: "Ningún usuario puede ingresar a la plataforma desde las 8am. Error 500 en login. Afecta a todos los clientes." — cliente: "Acme Corp"
> 2. titulo: "Posible fuga de datos" — descripcion: "Un usuario reporta que al iniciar sesión vio datos de otra cuenta. Podría ser un incidente de seguridad." — cliente: "Banco Delta"
> 3. titulo: "Reporte mensual no exporta a PDF" — descripcion: "El botón de exportar a PDF falla, pero el export a Excel sí funciona como alternativa." — cliente: "Logística Sur"
> 4. titulo: "Lentitud en el módulo de facturas" — descripcion: "Cargar la lista de facturas tarda 30 segundos. Se puede usar pero es molesto." — cliente: "Ferretería Norte"
> 5. titulo: "Cambiar logo en la página de inicio" — descripcion: "Queremos actualizar el logo por el nuevo branding. No hay urgencia." — cliente: "Café Andino"
> 6. titulo: "¿Cómo creo un usuario nuevo?" — descripcion: "Pregunta de uso: el cliente no encuentra dónde agregar usuarios a su cuenta." — cliente: "Tienda Luna"
> 7. titulo: "Error al guardar pedidos intermitente" — descripcion: "Aproximadamente 1 de cada 10 pedidos falla al guardar y hay que reintentar. Los clientes están perdiendo ventas." — cliente: "Distribuidora Este"
> 8. titulo: "Solicitud de nueva funcionalidad: modo oscuro" — descripcion: "Varios usuarios piden modo oscuro en la aplicación." — cliente: "Acme Corp"

## B.3 Verificar

> Muéstrame todos los registros de la tabla `tickets` con sus columnas estado y criticidad.

Debes ver los 8 tickets en estado `pendiente` y con `criticidad` vacía (null). Listo: la base está preparada para el ejercicio.

## B.4 Rebobinar la demo (para repetirla)

Cuando quieras volver a correr el triage desde cero, pídele al agente:

> Deja todos los tickets como recién creados: estado 'pendiente', criticidad y nota_triage en null, y actualizado_en igual a creado_en. No borres ningún registro.

## B.5 Alternativa: SQL directo (sin MCP)

Si prefieres o si algo falla con el MCP, en el dashboard de Supabase abre el **SQL Editor** y ejecuta:

- `referencias/setup-tickets.sql` — crea la tabla y carga los 8 tickets.
- `referencias/reset-tickets.sql` — rebobina la demo.

---

# ANEXO C — Glosario: los conceptos detrás de lo que hiciste

**LLM (Large Language Model / Modelo de Lenguaje Grande).** Un modelo de IA entrenado con enormes volúmenes de texto que aprende a predecir y generar lenguaje. Es un motor de razonamiento y redacción: entiende instrucciones, analiza información y produce respuestas. Por sí solo, no tiene acceso a tus sistemas ni memoria de tus datos. Ejemplos: la familia Claude (Haiku, Sonnet, Opus), GPT, Gemini.

**Prompt.** La instrucción o mensaje que le das al modelo. La calidad del prompt condiciona la calidad de la respuesta: contexto, rol, formato esperado y reglas claras mejoran el resultado.

**Ventana de contexto (context window).** La "memoria de trabajo" del modelo: todo lo que puede tener presente en una conversación (tus mensajes, sus respuestas, los resultados de las herramientas). Es finita; por eso existen mecanismos como los skills, que cargan instrucciones solo cuando se necesitan.

**Token.** La unidad mínima en que el modelo procesa texto (fragmentos de palabras, más o menos). Los servicios de LLM se cobran por tokens de entrada y salida — por eso para tareas simples conviene un modelo pequeño y rápido como Haiku.

**Agente (agente de IA).** Un sistema donde un LLM no solo responde: **decide y actúa en ciclos** para lograr un objetivo. Recibe una meta ("haz el triage"), planifica, usa herramientas, observa los resultados y ajusta hasta terminar. Fórmula práctica: modelo + herramientas + instrucciones de procedimiento.

**Herramienta (tool).** Una capacidad concreta que el agente puede invocar: ejecutar una consulta SQL, leer un archivo, llamar a una API. El modelo decide *cuándo* usarla y con qué parámetros; el sistema anfitrión (Claude Code) la ejecuta y le devuelve el resultado.

**ReAct (Reasoning + Acting).** El patrón de funcionamiento de los agentes modernos: el modelo alterna **razonar** ("necesito ver los tickets pendientes") → **actuar** (ejecuta la consulta por MCP) → **observar** (lee los resultados) → y vuelve a razonar, en ciclo, hasta completar la tarea. Lo viste en vivo cada vez que el agente encadenó consultas y actualizaciones.

**MCP (Model Context Protocol).** Protocolo abierto (creado por Anthropic, hoy estándar de la industria) que define cómo conectar modelos de IA con sistemas externos. La analogía habitual: el USB-C de la IA — un solo conector estándar en lugar de una integración a medida por cada sistema.

**Servidor MCP.** El programa que expone un sistema concreto a través del protocolo. El servidor MCP de Supabase expone herramientas como "listar tablas" o "ejecutar SQL". Existen servidores MCP para GitHub, Slack, navegadores, sistemas de archivos y cientos de servicios más.

**Cliente MCP.** La aplicación donde vive el modelo y que consume servidores MCP: Claude Code, Claude Desktop, y otros IDEs y chats compatibles.

**Skill.** Un paquete de instrucciones (en esencia, un archivo `SKILL.md` con metadatos) que le enseña al agente **cómo** ejecutar una tarea según tus reglas: proceso, criterios, formatos. El agente lo carga automáticamente cuando la petición coincide con su descripción. Diferencia clave con MCP: **MCP le da capacidades (poder hacer); un skill le da procedimiento (saber hacer bien)**.

**Triage.** Término tomado de las salas de urgencias: clasificar los casos entrantes por severidad para atender primero lo más crítico. En soporte, es asignar criticidad a los tickets para priorizar el trabajo del equipo.

**Supabase.** Plataforma de backend en la nube construida sobre PostgreSQL: base de datos, autenticación, APIs y almacenamiento. En este ejercicio la usamos como la "base de datos de la empresa" que el agente consulta y actualiza.

**Human-in-the-loop (humano en el circuito).** Práctica de diseño donde las acciones del agente requieren aprobación humana. Lo viviste cada vez que Claude Code te pidió confirmar una operación sobre la base de datos antes de ejecutarla.
