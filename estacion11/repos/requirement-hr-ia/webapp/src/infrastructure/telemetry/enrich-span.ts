/**
 * Enriches the active OTel span with session & user context.
 *
 * Call this from API handlers and server components so every span
 * carries session.trace.id, user.id, and tenant.id attributes.
 * In Tempo/Grafana you can then filter all spans for a session:
 *   { span.session.trace.id = "st-xxxxxxxx" }
 */

import { trace, context } from '@opentelemetry/api';
import type { TenantContext } from '@/shared/types';

interface SessionSpanAttrs {
  sessionTraceId?: string | null;
  tenant?: TenantContext | null;
  route?: string;
}

export function enrichActiveSpan(attrs: SessionSpanAttrs): void {
  try {
    const span = trace.getSpan(context.active());
    if (!span) return;

    if (attrs.sessionTraceId) {
      span.setAttribute('session.trace.id', attrs.sessionTraceId);
    }
    if (attrs.tenant) {
      span.setAttribute('user.id', attrs.tenant.userId);
      span.setAttribute('tenant.id', attrs.tenant.tenantId);
      span.setAttribute('user.email', attrs.tenant.email);
    }
    if (attrs.route) {
      span.setAttribute('app.route', attrs.route);
    }
  } catch {
    // OTel may not be initialized — never break the app
  }
}
