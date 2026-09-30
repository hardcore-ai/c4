'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { clientLogger } from '@/infrastructure/logging/client-logger';

const SVC = 'sidebar';

const navItems = [
  { href: '/campaigns', label: 'Campañas', icon: '📋' },
  { href: '/review', label: 'Revisión', icon: '✅' },
  { href: '/settings', label: 'Configuración', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-white" data-testid="sidebar">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">EntreVista AI</h1>
        <p className="text-sm text-gray-500 mt-1">Panel de Reclutamiento</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => clientLogger.info(SVC, 'Navigation click', { target: item.href, label: item.label, from: pathname })}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            )}
            data-testid={`nav-${item.label.toLowerCase()}`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
