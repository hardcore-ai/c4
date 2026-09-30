import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import type { TenantContext } from '@/shared/types';

export async function getTenantContext(): Promise<TenantContext | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const user = session.user as Record<string, string>;
  const tenantId = user.tenantId;

  if (!tenantId) {
    return null;
  }

  return {
    tenantId,
    userId: user.id || '',
    email: user.email || '',
  };
}

export async function requireTenantContext(): Promise<TenantContext> {
  const ctx = await getTenantContext();
  if (!ctx) {
    throw new Error('Unauthorized: no tenant context');
  }
  return ctx;
}
