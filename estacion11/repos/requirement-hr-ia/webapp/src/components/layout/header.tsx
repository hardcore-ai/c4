'use client';

import { signOut, useSession } from 'next-auth/react';
import { clientLogger } from '@/infrastructure/logging/client-logger';
import { clearSessionTraceId, getSessionTraceId } from '@/infrastructure/telemetry/session-trace';

const SVC = 'header';

export function Header() {
  const { data: session } = useSession();
  const email = session?.user?.email || '';
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6" data-testid="header">
      <div className="md:hidden">
        <h1 className="text-lg font-bold">EntreVista AI</h1>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
          {initials}
        </span>
        <span className="hidden sm:inline text-sm text-gray-600">{email}</span>
        <button
          onClick={() => {
            clientLogger.info(SVC, 'Session ended — user logout', {
              email,
              sessionTraceId: getSessionTraceId(),
            });
            clearSessionTraceId();
            signOut({ callbackUrl: '/login' });
          }}
          className="text-sm text-gray-500 hover:text-gray-700 ml-2"
          data-testid="logout-button"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
