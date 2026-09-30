import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/infrastructure/logging/logger';
import { enrichActiveSpan } from '@/infrastructure/telemetry/enrich-span';
import { getTenantContext } from '@/infrastructure/auth/get-tenant';

const VALID_LEVELS = ['INFO', 'WARN', 'ERROR'] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { level, service, message, context } = body;

    if (!VALID_LEVELS.includes(level) || !service || !message) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
    }

    const sessionTraceId = req.headers.get('x-session-trace-id');

    // getTenantContext can be slow/fail for unauthenticated requests — don't block
    let tenant: Awaited<ReturnType<typeof getTenantContext>> = null;
    try {
      tenant = await getTenantContext();
    } catch {
      // No session — continue without tenant context
    }

    // Enrich the active span so client logs appear correlated in Tempo
    enrichActiveSpan({ sessionTraceId, tenant, route: `client:${service}` });

    const extra = {
      tenantId: tenant?.tenantId,
      sessionTraceId: sessionTraceId ?? undefined,
      context: {
        ...context,
        source: 'client',
        userId: tenant?.userId,
        userAgent: req.headers.get('user-agent') ?? undefined,
      },
    };

    if (level === 'ERROR') {
      logger.error(service, message, { ...extra, error: new Error(message) });
    } else if (level === 'WARN') {
      logger.warn(service, message, extra);
    } else {
      logger.info(service, message, extra);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
}
