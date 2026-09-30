import { NextResponse } from 'next/server';

// Next.js 16: la convención `middleware.ts` quedó deprecada a favor de `proxy.ts`.
// Corre antes del router. El logging real se hace server-side, donde
// OpenTelemetry está disponible; aquí solo marcamos el inicio de la request.
export function proxy() {
  const response = NextResponse.next();

  // Header con timestamp para correlación con los spans del servidor
  response.headers.set('x-request-start', Date.now().toString());

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
