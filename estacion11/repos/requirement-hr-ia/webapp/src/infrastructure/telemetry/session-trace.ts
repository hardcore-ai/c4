/**
 * Session-level trace correlation.
 *
 * Generates a unique sessionTraceId at login time, stores it in
 * sessionStorage, and provides it to every outgoing fetch so the
 * server can stamp every span with the same ID.
 *
 * In Tempo you can then query:
 *   { span.session.trace.id = "st-xxxxxxxx" }
 * to see every span for a user's entire session.
 */

const STORAGE_KEY = 'x-session-trace-id';

export function generateSessionTraceId(): string {
  return `st-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getSessionTraceId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setSessionTraceId(id: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, id);
}

export function clearSessionTraceId(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
