'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  generateSessionTraceId,
  getSessionTraceId,
  setSessionTraceId,
} from '@/infrastructure/telemetry/session-trace';
import { clientLogger } from '@/infrastructure/logging/client-logger';

/**
 * Initializes session-level tracing. Placed inside the SessionProvider
 * so it runs once when the dashboard mounts with an authenticated session.
 *
 * - Generates a sessionTraceId if one doesn't exist yet
 * - Patches global fetch to attach x-session-trace-id on same-origin requests
 * - Logs session.start for Loki/Tempo correlation
 */
export function SessionTraceInit() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;

    // Generate session trace ID if not present
    let traceId = getSessionTraceId();
    if (!traceId) {
      traceId = generateSessionTraceId();
      setSessionTraceId(traceId);
      clientLogger.info('session', 'Session started', {
        sessionTraceId: traceId,
        email: session.user.email,
      });
    }

    // Patch global fetch to propagate session trace ID on same-origin requests.
    // Use XMLHttpRequest-style header injection to avoid breaking Next.js internals
    // (RSC streaming, Turbopack HMR, etc.) that rely on fetch with special options.
    const originalFetch = window.fetch;
    window.fetch = function patchedFetch(
      input: RequestInfo | URL,
      init?: RequestInit,
    ) {
      try {
        const url =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;

        const isSameOrigin =
          url.startsWith('/') || url.startsWith(window.location.origin);

        // Only inject on same-origin, non-internal Next.js requests
        const isNextInternal =
          url.includes('/_next/') || url.includes('__nextjs');

        if (isSameOrigin && !isNextInternal) {
          const currentTraceId = getSessionTraceId();
          if (currentTraceId) {
            // Merge header without reconstructing the entire init object
            const existingHeaders = init?.headers;
            const merged: Record<string, string> = {};

            if (existingHeaders) {
              if (existingHeaders instanceof Headers) {
                existingHeaders.forEach((v, k) => { merged[k] = v; });
              } else if (Array.isArray(existingHeaders)) {
                existingHeaders.forEach(([k, v]) => { merged[k] = v; });
              } else {
                Object.assign(merged, existingHeaders);
              }
            }

            if (!merged['x-session-trace-id']) {
              merged['x-session-trace-id'] = currentTraceId;
            }

            return originalFetch.call(this, input, { ...init, headers: merged });
          }
        }
      } catch {
        // Never break fetch — fall through to original
      }

      return originalFetch.call(this, input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [status, session]);

  return null;
}
