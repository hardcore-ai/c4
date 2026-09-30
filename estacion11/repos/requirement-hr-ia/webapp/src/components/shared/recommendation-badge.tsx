import { Badge } from '@/components/ui/badge';

const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  highly_recommended: { label: 'Altamente Recomendado', variant: 'default' },
  recommended: { label: 'Recomendado', variant: 'secondary' },
  not_recommended: { label: 'No Recomendado', variant: 'destructive' },
};

interface RecommendationBadgeProps {
  recommendation: string;
}

export function RecommendationBadge({ recommendation }: RecommendationBadgeProps) {
  const { label, variant } = config[recommendation] || { label: recommendation, variant: 'outline' as const };

  return (
    <Badge variant={variant} data-testid="recommendation-badge">
      {label}
    </Badge>
  );
}
