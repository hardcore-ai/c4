/**
 * Client-side logger that sends structured logs to /api/log,
 * which forwards them to the server-side OTel pipeline (Loki).
 *
 * Automatically attaches x-session-trace-id header so the server
 * can correlate logs and spans to the user's session.
 */

import { getSessionTraceId } from '@/infrastructure/telemetry/session-trace';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface ClientLogPayload {
  level: LogLevel;
  service: string;
  message: string;
  context?: Record<string, unknown>;
}

function send(payload: ClientLogPayload): void {
  // Fire-and-forget: don't block the UI
  if (typeof window === 'undefined') return;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const sessionTraceId = getSessionTraceId();
  if (sessionTraceId) {
    headers['x-session-trace-id'] = sessionTraceId;
  }

  fetch('/api/log', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  }).catch(() => {
    // Silently fail — logging should never break the app
  });
}

export const clientLogger = {
  info(service: string, message: string, context?: Record<string, unknown>) {
    send({ level: 'INFO', service, message, context });
  },
  warn(service: string, message: string, context?: Record<string, unknown>) {
    send({ level: 'WARN', service, message, context });
  },
  error(service: string, message: string, context?: Record<string, unknown>) {
    send({ level: 'ERROR', service, message, context });
  },
};
