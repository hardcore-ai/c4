#!/usr/bin/env bash
# ============================================================
# Script de prueba — Envía traces, métricas y logs al Collector
#
# Verifica que el stack completo funciona:
#   App → Collector (OTLP HTTP) → Tempo / Prometheus / Loki
#
# Uso: ./scripts/test-telemetry.sh
# ============================================================

set -euo pipefail

COLLECTOR_URL="${OTEL_EXPORTER_OTLP_ENDPOINT:-http://localhost:4318}"
TRACE_ID=$(printf '%032x' $RANDOM$RANDOM$RANDOM$RANDOM)
SPAN_ID=$(printf '%016x' $RANDOM$RANDOM)
TIMESTAMP=$(date +%s)000000000

echo "=========================================="
echo " OpenTelemetry Stack — Test de Telemetría"
echo "=========================================="
echo ""
echo "Collector: $COLLECTOR_URL"
echo "Trace ID:  $TRACE_ID"
echo ""

# --- 1. Enviar un trace de prueba ---
echo "1/3 Enviando trace de prueba..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "${COLLECTOR_URL}/v1/traces" \
  -H "Content-Type: application/json" \
  -d "{
    \"resourceSpans\": [{
      \"resource\": {
        \"attributes\": [
          { \"key\": \"service.name\", \"value\": { \"stringValue\": \"test-service\" } },
          { \"key\": \"deployment.environment\", \"value\": { \"stringValue\": \"local\" } }
        ]
      },
      \"scopeSpans\": [{
        \"scope\": { \"name\": \"test-script\" },
        \"spans\": [{
          \"traceId\": \"$TRACE_ID\",
          \"spanId\": \"$SPAN_ID\",
          \"name\": \"test-request\",
          \"kind\": 2,
          \"startTimeUnixNano\": \"${TIMESTAMP}\",
          \"endTimeUnixNano\": \"$((TIMESTAMP + 150000000))\",
          \"attributes\": [
            { \"key\": \"http.method\", \"value\": { \"stringValue\": \"GET\" } },
            { \"key\": \"http.route\", \"value\": { \"stringValue\": \"/api/chat\" } },
            { \"key\": \"http.status_code\", \"value\": { \"intValue\": \"200\" } }
          ],
          \"status\": { \"code\": 1 }
        }]
      }]
    }]
  }")

if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✓ Trace enviado correctamente"
else
  echo "   ✗ Error enviando trace (HTTP $HTTP_CODE)"
fi

# --- 2. Enviar métricas de prueba ---
echo "2/3 Enviando métricas de prueba..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "${COLLECTOR_URL}/v1/metrics" \
  -H "Content-Type: application/json" \
  -d "{
    \"resourceMetrics\": [{
      \"resource\": {
        \"attributes\": [
          { \"key\": \"service.name\", \"value\": { \"stringValue\": \"test-service\" } }
        ]
      },
      \"scopeMetrics\": [{
        \"scope\": { \"name\": \"test-script\" },
        \"metrics\": [{
          \"name\": \"http.request.duration\",
          \"unit\": \"ms\",
          \"description\": \"Duration of HTTP requests\",
          \"gauge\": {
            \"dataPoints\": [{
              \"asDouble\": 150.5,
              \"timeUnixNano\": \"${TIMESTAMP}\",
              \"attributes\": [
                { \"key\": \"http.method\", \"value\": { \"stringValue\": \"GET\" } },
                { \"key\": \"http.route\", \"value\": { \"stringValue\": \"/api/chat\" } }
              ]
            }]
          }
        }]
      }]
    }]
  }")

if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✓ Métrica enviada correctamente"
else
  echo "   ✗ Error enviando métrica (HTTP $HTTP_CODE)"
fi

# --- 3. Enviar un log de prueba ---
echo "3/3 Enviando log de prueba..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "${COLLECTOR_URL}/v1/logs" \
  -H "Content-Type: application/json" \
  -d "{
    \"resourceLogs\": [{
      \"resource\": {
        \"attributes\": [
          { \"key\": \"service.name\", \"value\": { \"stringValue\": \"test-service\" } }
        ]
      },
      \"scopeLogs\": [{
        \"scope\": { \"name\": \"test-script\" },
        \"logRecords\": [{
          \"timeUnixNano\": \"${TIMESTAMP}\",
          \"severityNumber\": 9,
          \"severityText\": \"INFO\",
          \"body\": { \"stringValue\": \"Test log — stack de observabilidad funcionando correctamente\" },
          \"attributes\": [
            { \"key\": \"trace_id\", \"value\": { \"stringValue\": \"$TRACE_ID\" } },
            { \"key\": \"span_id\", \"value\": { \"stringValue\": \"$SPAN_ID\" } }
          ]
        }]
      }]
    }]
  }")

if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✓ Log enviado correctamente"
else
  echo "   ✗ Error enviando log (HTTP $HTTP_CODE)"
fi

# --- Resultado ---
echo ""
echo "=========================================="
echo " Verificación"
echo "=========================================="
echo ""
echo "Abre las siguientes URLs para verificar:"
echo ""
echo "  Grafana:    http://localhost:3001  (admin/admin)"
echo "  Tempo:      http://localhost:3200"
echo "  Prometheus: http://localhost:9090"
echo ""
echo "En Grafana → Explore → Tempo:"
echo "  Buscar trace ID: $TRACE_ID"
echo ""
echo "En Grafana → Explore → Prometheus:"
echo "  Query: http_request_duration"
echo ""
echo "En Grafana → Explore → Loki:"
echo "  Query: {service_name=\"test-service\"}"
echo ""
