// ============================================================
// OpenTelemetry para procesos Node que corren FUERA de Next.js
//
// Next.js arranca el SDK con src/instrumentation.ts, pero el bot
// de Telegram (scripts/telegram-polling.ts) es un proceso aparte.
// Sin este archivo, sus spans llm.* y sus métricas llm_* serían
// no-ops y sus conversaciones nunca aparecerían en Grafana.
//
// Debe ser el PRIMER import del script: el SDK tiene que estar
// registrado antes de que se carguen @aws-sdk, openai y chat-client.
// ============================================================
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true, quiet: true });

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const collectorUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
const serviceName = process.env.OTEL_SERVICE_NAME || 'hr-ia-webapp';
// Mismo servicio que la webapp (los dashboards filtran por él), distinta instancia:
// en Prometheus se convierte en la etiqueta `instance` y evita que las series
// llm_* del bot choquen con las de la webapp.
const instanceId = process.env.OTEL_SERVICE_INSTANCE_ID || 'telegram-bot';

// La URL de la API de Telegram lleva el token del bot en el path
// (https://api.telegram.org/bot<TOKEN>/...). Esas llamadas NO se instrumentan
// para que el token jamás termine como atributo de un span.
const isTelegramApi = (host?: string | null) => !!host && host.includes('api.telegram.org');

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    'service.instance.id': instanceId,
    'deployment.environment.name': process.env.NODE_ENV || 'development',
  }),
  traceExporter: new OTLPTraceExporter({ url: `${collectorUrl}/v1/traces` }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: `${collectorUrl}/v1/metrics` }),
    exportIntervalMillis: 5_000,
  }),
  logRecordProcessors: [
    new BatchLogRecordProcessor(new OTLPLogExporter({ url: `${collectorUrl}/v1/logs` })),
  ],
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
      '@opentelemetry/instrumentation-http': {
        ignoreOutgoingRequestHook: (req) => isTelegramApi(req.hostname ?? req.host),
      },
      '@opentelemetry/instrumentation-undici': {
        ignoreRequestHook: (req) => isTelegramApi(req.origin),
      },
    }),
  ],
});

sdk.start();

// Al detener el bot, enviar al Collector lo que quede en los buffers
const shutdown = () => {
  sdk.shutdown().catch(() => undefined).finally(() => process.exit(0));
};
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

console.log(
  `[OTel] Instrumentation started — service: ${serviceName}, instance: ${instanceId}, collector: ${collectorUrl}`
);
