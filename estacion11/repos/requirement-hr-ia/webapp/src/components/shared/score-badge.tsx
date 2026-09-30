import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const colorClass = score >= 4
    ? 'bg-green-100 text-green-800'
    : score >= 3
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';

  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5'
    : size === 'lg' ? 'text-base px-3 py-1.5'
      : 'text-sm px-2 py-1';

  return (
    <span
      className={cn('inline-flex items-center rounded-full font-semibold', colorClass, sizeClass)}
      data-testid="score-badge"
    >
      {score.toFixed(1)}
    </span>
  );
}
