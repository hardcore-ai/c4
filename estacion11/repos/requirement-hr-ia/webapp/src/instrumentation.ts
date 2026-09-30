// ============================================================
// OpenTelemetry Instrumentation — Next.js Hook
//
// Este archivo es detectado automáticamente por Next.js al
// iniciar el servidor. Configura el SDK de OpenTelemetry para
// enviar traces, métricas y logs al Collector vía OTLP.
//
// Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
// ============================================================

export async function register() {
  // Solo instrumentar en el runtime de Node.js (no en Edge ni en el browser)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { getNodeAutoInstrumentations } = await import(
      '@opentelemetry/auto-instrumentations-node'
    );
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
    const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-http');
    const { OTLPLogExporter } = await import('@opentelemetry/exporter-logs-otlp-http');
    const { PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics');
    const { BatchLogRecordProcessor } = await import('@opentelemetry/sdk-logs');
    const { resourceFromAttributes } = await import('@opentelemetry/resources');
    const { ATTR_SERVICE_NAME } = await import('@opentelemetry/semantic-conventions');
    const { HostMetrics } = await import('@opentelemetry/host-metrics');
    const { registerProcessMetrics } = await import(
      '@/infrastructure/telemetry/process-metrics'
    );

    const collectorUrl =
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'hr-ia-webapp',
      'deployment.environment.name': process.env.NODE_ENV || 'development',
    });

    const sdk = new NodeSDK({
      resource,

      // Traces → Collector
      traceExporter: new OTLPTraceExporter({
        url: `${collectorUrl}/v1/traces`,
      }),

      // Métricas → Collector (cada 5s)
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${collectorUrl}/v1/metrics`,
        }),
        exportIntervalMillis: 5_000,
      }),

      // Logs → Collector
      logRecordProcessors: [
        new BatchLogRecordProcessor(
          new OTLPLogExporter({
            url: `${collectorUrl}/v1/logs`,
          })
        ),
      ],

      // Auto-instrumentación de HTTP, fetch, runtime-node, etc.
      instrumentations: [
        getNodeAutoInstrumentations({
          // Desactivar instrumentaciones ruidosas que no aportan valor
          '@opentelemetry/instrumentation-fs': { enabled: false },
          '@opentelemetry/instrumentation-dns': { enabled: false },
          '@opentelemetry/instrumentation-net': { enabled: false },
        }),
      ],
    });

    sdk.start();

    // ── Host Metrics: CPU, memoria, network I/O ──
    const hostMetrics = new HostMetrics({
      name: 'host-metrics',
    });
    hostMetrics.start();

    // ── Process Metrics: heap, RSS, CPU del proceso Node.js ──
    registerProcessMetrics();

    console.log(
      `[OTel] Instrumentation started — service: ${process.env.OTEL_SERVICE_NAME || 'hr-ia-webapp'}, collector: ${collectorUrl}`
    );
    console.log(
      '[OTel] Host metrics (CPU, memory, network) + process metrics (heap, RSS, event loop) enabled'
    );
  }
}
