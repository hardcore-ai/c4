import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { generateCorrelationId } from './correlation';
import { logger } from '@/infrastructure/logging/logger';
import { enrichActiveSpan } from '@/infrastructure/telemetry/enrich-span';
import { getTenantContext } from '@/infrastructure/auth/get-tenant';

type ApiHandler = (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

export function apiHandler(handler: ApiHandler): ApiHandler {
  return async (req, context) => {
    const correlationId = generateCorrelationId();
    const startTime = Date.now();
    const sessionTraceId = req.headers.get('x-session-trace-id');

    // Enrich the active span with session + user context
    let tenant: Awaited<ReturnType<typeof getTenantContext>> = null;
    try { tenant = await getTenantContext(); } catch { /* no session */ }
    enrichActiveSpan({
      sessionTraceId,
      tenant,
      route: `${req.method} ${req.nextUrl.pathname}`,
    });

    try {
      const response = await handler(req, context);

      logger.info('api', `${req.method} ${req.nextUrl.pathname}`, {
        correlationId,
        tenantId: tenant?.tenantId,
        sessionTraceId: sessionTraceId ?? undefined,
        context: {
          status: response.status,
          duration: Date.now() - startTime,
          userId: tenant?.userId,
        },
      });

      return response;
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.issues },
          { status: 400 }
        );
      }

      logger.error('api', `${req.method} ${req.nextUrl.pathname} failed`, {
        correlationId,
        tenantId: tenant?.tenantId,
        sessionTraceId: sessionTraceId ?? undefined,
        error: error instanceof Error ? error : new Error(String(error)),
        context: {
          duration: Date.now() - startTime,
          userId: tenant?.userId,
        },
      });

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
