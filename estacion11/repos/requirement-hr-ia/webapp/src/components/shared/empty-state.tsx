import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12" data-testid="empty-state">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
      {action && (
        <Link href={action.href} className="mt-4 inline-block">
          <Button variant="outline">{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
