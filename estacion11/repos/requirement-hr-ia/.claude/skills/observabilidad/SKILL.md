---
name: observabilidad
description: Convenciones de observabilidad del proyecto con OpenTelemetry — instrumentation.ts, spans y métricas del LLM (llm.*), logs correlacionados con trace_id, nombres que llegan a Prometheus y dashboards de Grafana como código en grafana-dashboards/. Usar al tocar instrumentation.ts, chat-client.ts, logger.ts, cualquier archivo de src/infrastructure/telemetry/ o un JSON de grafana-dashboards/.
---

# Observabilidad — convenciones del proyecto

> Steering file por defecto del programa AI for Developers | 30X. Cópialo a `.claude/skills/observabilidad/SKILL.md` en tu proyecto y ajusta nombres de servicio, spans y dashboards a tu producto.

## 1. Dónde va cada cosa

```
webapp/src/instrumentation.ts                    → hook de Next.js: NodeSDK, exporters OTLP, auto-instrumentación
webapp/src/infrastructure/telemetry/             → process-metrics, session-trace, enrich-span
webapp/src/infrastructure/logging/logger.ts      → logs estructurados → consola + OTel Logs (con trace_id)
webapp/src/infrastructure/openai/chat-client.ts  → spans y métricas del LLM (la instrumentación manual)
grafana-dashboards/*.json                        → dashboards como código; otel-stack los monta en Grafana
../otel-stack/                                   → Collector + Tempo + Prometheus + Loki + Grafana (no se toca desde la app)
```

## 2. Señales y nombres (obligatorios)

- **Servicio:** `OTEL_SERVICE_NAME` (default `hr-ia-webapp`). Es el `job` en Prometheus y `service.name` en Tempo y Loki.
- **Spans del LLM:** uno por llamada al modelo, nombre `llm.<operacion>` (`llm.conversation`, `llm.evaluation`). Atributos mínimos: `llm.system`, `llm.model`, `llm.operation`, `llm.tokens.input`, `llm.tokens.output`, `llm.tokens.total`, `llm.latency_ms`. Estado `ERROR` + `recordException` cuando falla.
- **Métricas del LLM:** `llm.request.duration` (histogram, `ms`), `llm.tokens.total` (counter, label `llm.token_type` = `input` | `output`), `llm.request.errors` (counter). Labels siempre `llm.model` y `llm.operation`.
- **Logs:** siempre a través de `logger.<nivel>(servicio, mensaje, { context })`. Nunca `console.log` suelto: el logger inyecta `trace_id` y `span_id`, y sin eso el salto log → trace en Grafana no existe.
- **Contexto de negocio:** enriquecer el span activo con `enrichActiveSpan()` (`user.id`, `tenant.id`, `session.trace.id`), no crear spans nuevos para eso.

## 3. Cómo llegan los nombres a Prometheus

El Collector convierte puntos en guiones bajos y añade sufijo de unidad. Al escribir una query o un panel, usar el nombre de Prometheus, no el del código:

| En el código            | En Prometheus                                          |
|-------------------------|--------------------------------------------------------|
| `llm.request.duration`  | `llm_request_duration_milliseconds_{bucket,sum,count}` |
| `llm.tokens.total`      | `llm_tokens_total`                                     |
| `llm.request.errors`    | `llm_request_errors_total`                             |
| atributo `llm.model`    | label `llm_model`                                      |

## 4. Seguridad y costo (no negociable)

1. Nunca poner en un span, métrica o log el prompt completo, la respuesta del modelo, datos del candidato ni la API key. Solo conteos, latencias, modelo y IDs.
2. Las métricas no llevan labels de alta cardinalidad (`conversationId`, `candidateId`, emails). Esos van en el span, que sí se puede filtrar en Tempo.
3. `@opentelemetry/instrumentation-fs`, `-dns` y `-net` siguen desactivadas: generan ruido y costo sin valor.
4. El intervalo de exportación de métricas es 5 s en desarrollo; en producción subirlo a 30–60 s.

## 5. Dashboards como código

- Un dashboard = un JSON en `grafana-dashboards/` con `uid` único y estable (Grafana lo usa como identidad; cambiarlo duplica el dashboard).
- Datasources por `uid` fijo: `prometheus`, `tempo`, `loki`. Nunca por nombre.
- `id: null` en el JSON. Grafana asigna el id al provisionar.
- Cada panel con `description`: es lo que el equipo lee cuando el panel se pone rojo a las 3 a. m.
- Para probar un cambio: guardar el JSON y esperar 10 s; el provider lo recarga sin reiniciar. Si no aparece, `docker compose logs grafana | grep provisioning`.

## 6. Cómo trabaja el agente en este repo

1. Leer `instrumentation.ts` y `chat-client.ts` antes de instrumentar algo nuevo: reutilizar el `tracer` y el `meter` existentes, no crear otros.
2. Para un nuevo punto de integración con IA, copiar el patrón de `generateConversationResponse`: `startActiveSpan('llm.<op>')` → atributos → try/catch con métricas en ambos caminos → `span.end()`.
3. Después de instrumentar, verificar de extremo a extremo: ejecutar la acción en la app → Grafana → Explore → Tempo (el span) → Prometheus (`llm_request_duration_milliseconds_count` sube) → Loki (log con el mismo `trace_id`).
4. Si el stack no recibe nada, aislar primero con `../otel-stack/scripts/test-telemetry.sh`: si el script llega y la app no, el problema es `OTEL_EXPORTER_OTLP_ENDPOINT` o la red Docker.
5. Al añadir una métrica nueva, añadir en el mismo cambio su panel en el dashboard que corresponda y la fila en la tabla de métricas del README.
