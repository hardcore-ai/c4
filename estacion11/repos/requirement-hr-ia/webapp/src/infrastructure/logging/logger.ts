import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { trace, context } from '@opentelemetry/api';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  correlationId?: string;
  tenantId?: string;
  sessionTraceId?: string;
  service: string;
  message: string;
  context?: Record<string, unknown>;
  error?: { message: string; stack?: string };
}

const SEVERITY_MAP: Record<LogLevel, SeverityNumber> = {
  INFO: SeverityNumber.INFO,
  WARN: SeverityNumber.WARN,
  ERROR: SeverityNumber.ERROR,
};

interface LogExtra {
  correlationId?: string;
  tenantId?: string;
  sessionTraceId?: string;
  context?: Record<string, unknown>;
  error?: Error;
}

function log(level: LogLevel, service: string, message: string, extra?: LogExtra): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
    correlationId: extra?.correlationId,
    tenantId: extra?.tenantId,
    sessionTraceId: extra?.sessionTraceId,
    context: extra?.context,
  };

  if (extra?.error) {
    entry.error = {
      message: extra.error.message,
      stack: extra.error.stack,
    };
  }

  const output = JSON.stringify(entry);

  // 1. Escribir a console (comportamiento original)
  if (level === 'ERROR') {
    console.error(output);
  } else if (level === 'WARN') {
    console.warn(output);
  } else {
    console.log(output);
  }

  // 2. Enviar al Collector vía OpenTelemetry Logs API
  try {
    const otelLogger = logs.getLogger('app-logger');
    const activeSpan = trace.getSpan(context.active());

    const attributes: Record<string, string> = {
      'log.service': service,
    };

    if (extra?.correlationId) attributes['log.correlation_id'] = extra.correlationId;
    if (extra?.tenantId) attributes['log.tenant_id'] = extra.tenantId;
    if (extra?.sessionTraceId) attributes['session.trace.id'] = extra.sessionTraceId;

    // Incluir contexto como atributos individuales para facilitar filtrado en Loki
    if (extra?.context) {
      for (const [key, value] of Object.entries(extra.context)) {
        if (value !== undefined && value !== null) {
          attributes[`context.${key}`] = String(value);
        }
      }
    }

    // Inyectar trace_id y span_id para correlación con Tempo
    if (activeSpan) {
      const spanContext = activeSpan.spanContext();
      attributes['trace_id'] = spanContext.traceId;
      attributes['span_id'] = spanContext.spanId;
    }

    if (extra?.error) {
      attributes['error.message'] = extra.error.message;
      if (extra.error.stack) attributes['error.stack'] = extra.error.stack;
    }

    otelLogger.emit({
      severityNumber: SEVERITY_MAP[level],
      severityText: level,
      body: message,
      attributes,
    });
  } catch {
    // Si OTel no está inicializado aún, silenciar el error
  }
}

export const logger = {
  info: (service: string, message: string, extra?: Omit<LogExtra, 'error'>) =>
    log('INFO', service, message, extra),

  warn: (service: string, message: string, extra?: Omit<LogExtra, 'error'>) =>
    log('WARN', service, message, extra),

  error: (service: string, message: string, extra: LogExtra & { error: Error }) =>
    log('ERROR', service, message, extra),
};
