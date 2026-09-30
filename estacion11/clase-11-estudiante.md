# Clase 11: Observabilidad — Instrumentación de Aplicaciones Web e IA con OpenTelemetry

**Programa:** AI for Developers | 30X · **Instructor:** Andres Caicedo · **Duración:** 1h

## 👋 Bienvenida

En la Clase 8 cerraste el ciclo de calidad, en la Clase 9 desplegaste tu producto a la nube con IaC y en la Clase 10 lo aseguraste con SAST, DAST y herramientas agénticas de seguridad. Tu aplicación funciona hoy y está protegida — pero esa es la pregunta más fácil. La difícil es: **¿cómo sabes que sigue funcionando mañana cuando los usuarios reales la usen?** Y cuando algo falla, ¿cómo encuentras la causa antes de que un usuario te lo reporte? Esta sesión abre el ciclo de operación con observabilidad sobre OpenTelemetry, el estándar abierto que define cómo tu app emite telemetría. El formato es demostrativo: el instructor levanta un stack completo en vivo, instrumenta una app Next.js con chat de IA y muestra cómo las métricas tradicionales (HTTP status, latencia) se quedan cortas cuando hay LLMs en el camino.

## 🎯 De qué se trata esta sesión

El producto está en producción. Ahora la pregunta es: ¿cómo sabes que sigue funcionando correctamente cuando los usuarios reales lo están usando? Esta sesión introduce observabilidad con OpenTelemetry — qué es, de dónde viene, y las señales que define el estándar: traces, métricas, logs, baggage y la emergente profiles. Después de la teoría esencial, el instructor demuestra en vivo un stack de observabilidad pre-montado con Docker Compose y la instrumentación paso a paso de una aplicación Next.js con chat de IA, incluyendo las métricas específicas que necesitan las aplicaciones con LLMs. Los participantes se llevan los dos repositorios listos para replicar en su propio producto.

## 📚 Qué vas a aprender

- Diferenciar las **5 señales de OpenTelemetry** (traces, metrics, logs, baggage, profiles) y saber qué pregunta responde cada una sobre tu sistema.
- Configurar un stack de observabilidad completo con **Docker Compose**: OpenTelemetry Collector + Tempo + Prometheus + Loki + Grafana, todo opensource.
- Instrumentar tu app Next.js con **auto-instrumentación** (HTTP, fetch, routing) y **spans manuales** para las llamadas al LLM.
- Definir las **métricas que importan en una app con IA**: latencia de inferencia, tokens consumidos, errores del modelo — cosas que un HTTP 200 nunca te va a contar.
- Navegar entre **traces, logs y métricas correlacionadas** en Grafana: clic en un log → trace, clic en un span lento → exemplar de métrica.

## 🗺 Recorrido de la sesión

1. **Apertura y contexto** — El producto está en producción. La diferencia entre **funciona ahora** y **sigue funcionando mañana**. Por qué observabilidad cierra el ciclo que QA y CI/CD abrieron.
2. **OpenTelemetry y sus señales** — Estándar **CNCF**, vendor-neutral, una instrumentación y múltiples backends. Las 5 señales: **traces** (camino del request), **metrics** (cuánto y qué tan rápido), **logs** (qué pasó), **baggage** (contexto que viaja entre servicios) y **profiles en alpha** (qué línea de código consume recursos). El **Collector** como hub central — receivers, processors, exporters.
3. **¿Qué es diferente con IA generativa?** — Dimensiones nuevas que la observabilidad tradicional no captura: latencia de **segundos** en vez de milisegundos, costo por token, calidad no determinística, **alucinaciones invisibles bajo HTTP 200**. Instrumentación de conversaciones: span por turn, atributos `llm.model`, `llm.tokens.*`, `llm.latency_ms`. Atar lo técnico al negocio enriqueciendo spans con `user.id`, `plan.type`, `cart.value`.
4. **Repositorio `otel-stack`: el stack listo para usar** — Docker Compose con los 5 servicios, el archivo del Collector con su pipeline `receivers → processors → exporters`, levantar todo con un comando, datasources de Grafana pre-conectados y un script `test-telemetry.sh` que confirma extremo a extremo.
5. **Repositorio `requirement-hr-ia`: instrumentar el producto** — EntreVista AI, tu producto de las clases anteriores, ya instrumentado. Auto-instrumentación con `instrumentation.ts` y `@opentelemetry/auto-instrumentations-node`. **Spans manuales** para cada llamada al LLM (`llm.conversation`, `llm.evaluation`). **Métricas personalizadas** del agente (histogram, counters). **Logs estructurados** con `trace_id` inyectado. **Dashboards como código**: cuatro JSON en `grafana-dashboards/` que Grafana carga solo, incluido el del agente LLM. Y un **skill de observabilidad** para que tu coding agent instrumente con las mismas convenciones.

## 🎬 Qué vas a observar en vivo

- **Las 5 señales mapeadas a un request real:** verás cómo un click en el chat genera un trace con spans (frontend → API → LLM), métricas derivadas por span, logs correlacionados vía `trace_id` y dónde encajaría profiles para revelar el hotspot de código.
- **El stack levantándose en un comando:** `docker compose up -d` arranca Collector + Tempo + Prometheus + Loki + Grafana con datasources ya conectados. El script de prueba envía trace + métrica + log y verás los tres aparecer en Grafana en segundos.
- **Auto-instrumentación generando traces sin escribir código:** cada request HTTP a la app produce automáticamente una cascada de spans (routing, fetch, rendering). Demostración tangible de por qué OTel ahorra semanas de instrumentación.
- **Spans manuales del LLM con atributos de IA:** el cliente del LLM envuelve cada llamada al modelo en un span `llm.conversation` o `llm.evaluation` con `llm.model`, `llm.tokens.input`, `llm.tokens.output`, `llm.latency_ms`. En Grafana verás ese span colgando del trace de la request HTTP, junto al acceso a DynamoDB.
- **Correlación cruzada trace ↔ log ↔ métrica:** desde un log de error en Loki, clic en el `trace_id` salta a Tempo; desde un span lento, clic en el exemplar salta a la métrica. Sin salir de Grafana, sin copiar IDs a mano.
- **Dashboards como código:** cuatro dashboards provisionados desde JSON, sin importar nada a mano. El de **Agente LLM** muestra latencia de inferencia P50/P95/P99 por modelo, tokens por hora de entrada y salida, y errores del modelo — actualizándose mientras se chatea con el agente.

## 📋 Antes de la clase: prepárate

Asegúrate de tener listo antes de la sesión:

- [ ] Ten tu producto de **Clase 9** desplegado y funcionando — es el sistema que vas a instrumentar.
- [ ] Instala **Docker** y verifica que `docker ps` y `docker compose version` responden — el stack corre como contenedores.
- [ ] Asegura **Node.js 20+** y `npm` para correr la app Next.js localmente.
- [ ] Configura tu **IDE agéntico** (Claude Code, Cursor o Kiro) — lo usarás para acelerar la instrumentación.
- [ ] Ubica los dos repos de la sesión dentro del repositorio de la cohorte: `estacion11/repos/otel-stack` y `estacion11/repos/requirement-hr-ia`. Están uno junto al otro a propósito: el stack monta los dashboards del segundo.
- [ ] Si quieres correr EntreVista AI en tu máquina, ten **LocalStack** en `localhost:4566` (sirve el de la Estación 9) y una `OPENAI_API_KEY` propia; si además quieres probar el bot, crea uno con **@BotFather**. El README de `requirement-hr-ia` explica cómo obtener ambas llaves en menos de 10 minutos. Para seguir la demo no hace falta nada de esto.
- [ ] Lee la página de [opentelemetry.io/docs/concepts/signals](https://opentelemetry.io/docs/concepts/signals/) — 10 minutos de lectura te ahorran 30 min de la sesión.

## ✅ Tu tarea después de la clase

1. Clona el repo `otel-stack` y levanta el stack de observabilidad con `docker compose up` en tu máquina.
2. Instrumenta tu aplicación Next.js (o el lenguaje y framework que estés usando) con OpenTelemetry usando el repo `requirement-hr-ia` como referencia: auto-instrumentación para requests HTTP y spans manuales para las llamadas al LLM.
3. Implementa al menos 3 métricas personalizadas para tu agente de IA: latencia de inferencia, tokens consumidos y tasa de error del modelo.
4. Verifica que los traces de tu app aparecen en Grafana (Tempo) y que las métricas se registran en Prometheus.
5. Versiona al menos un dashboard de Grafana como JSON en tu repo y cárgalo con `DASHBOARDS_DIR`, y copia el skill `.claude/skills/observabilidad/SKILL.md` ajustado a tu producto.

## 🛠 Qué vas a producir

Al final de la semana entregarás estos artefactos en tu propio proyecto:

| Artefacto | Formato |
|-----------|---------|
| Docker Compose del stack de observabilidad | `docker-compose.yml` |
| Configuración del Collector | `otel-collector-config.yaml` |
| Instrumentación de Next.js | `webapp/src/instrumentation.ts` |
| Spans personalizados del chat con IA | En el cliente del LLM (`chat-client.ts`) |
| Métricas personalizadas del agente | Histograms y counters en el código del agente |
| Dashboards de Grafana como código | `grafana-dashboards/*.json` |
| Skill de observabilidad para el coding agent | `.claude/skills/observabilidad/SKILL.md` |

## 🤖 Herramientas que vas a usar

| Herramienta | Qué hace y dónde la vas a usar |
|-------------|--------------------------------|
| **OpenTelemetry SDK** | Estándar para emitir traces, métricas y logs desde tu app. Lo verás generar telemetría automáticamente y lo usarás para instrumentar manualmente las llamadas al LLM. |
| **OpenTelemetry Collector** | Hub central que recibe la telemetría y la distribuye a los backends. Lo configurarás una sola vez para multiplexar a Tempo, Prometheus y Loki. |
| **Grafana + Tempo + Prometheus + Loki** | Backend opensource para almacenar y visualizar traces, métricas y logs. Lo levantarás con Docker Compose y consultarás desde un único panel. |
| **Coding Agent** (Claude Code / Cursor / Kiro) | Acelera la instrumentación: te ayuda a añadir spans manuales, métricas y a debuggear configuración del Collector cuando algo no llega al backend. |
| **Skill de observabilidad** | Steering file en `.claude/skills/observabilidad/SKILL.md` con las convenciones de spans, métricas, logs y dashboards. Lo copias a tu repo para que tu agente instrumente igual que el de referencia. |
| **Docker Compose** | Levanta el stack completo en un comando. Lo replicarás en tu propio repo para que cualquiera del equipo pueda correr observabilidad local en 30 segundos. |

## 📦 Repositorios de la sesión

Recomendado: clonarlos antes de la sesión para tener el entorno listo.

| Repo | Contenido | Cómo clonar |
|------|-----------|-------------|
| `estacion11/repos/otel-stack` | Docker Compose pre-configurado con OpenTelemetry Collector, Tempo, Prometheus, Loki y Grafana. Datasources conectados, scripts de prueba y diagnóstico. Monta los dashboards del repo hermano vía `DASHBOARDS_DIR`. | Está en este repositorio |
| `estacion11/repos/requirement-hr-ia` | EntreVista AI (Next.js) con `instrumentation.ts`, spans manuales para el chat, métricas personalizadas del agente, cuatro dashboards como código en `grafana-dashboards/` y el skill de observabilidad. | Está en este repositorio |

## 📚 Recursos para profundizar

Material complementario para revisar antes, durante o después de la sesión:

- **OpenTelemetry — documentación oficial** — [opentelemetry.io/docs](https://opentelemetry.io/docs/) — conceptos, SDKs por lenguaje y referencia del Collector.
- **Las 5 señales de OTel** — [opentelemetry.io/docs/concepts/signals](https://opentelemetry.io/docs/concepts/signals/) — definición canónica de cada señal con ejemplos.
- **Grafana Tempo** — [grafana.com/docs/tempo](https://grafana.com/docs/tempo/latest/) — backend de traces, TraceQL y RED metrics auto-generadas.
- **Semantic Conventions de OTel para GenAI** — [opentelemetry.io/docs/specs/semconv/gen-ai](https://opentelemetry.io/docs/specs/semconv/gen-ai/) — atributos estandarizados para spans de LLM (`gen_ai.request.model`, `gen_ai.usage.*`).
- **OpenTelemetry Collector** — [opentelemetry.io/docs/collector](https://opentelemetry.io/docs/collector/) — receivers, processors, exporters y la guía de configuración del pipeline.
- **Honeycomb — Observability Engineering** (libro gratuito) — [honeycomb.io/oreilly-observability-engineering](https://www.honeycomb.io/oreilly-observability-engineering) — el manual de referencia sobre los principios de observabilidad moderna.
