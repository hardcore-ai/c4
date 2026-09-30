'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScoreBadge } from '@/components/shared/score-badge';
import { RecommendationBadge } from '@/components/shared/recommendation-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { clientLogger } from '@/infrastructure/logging/client-logger';

const SVC = 'review-queue';

interface CandidateForReview {
  candidate: Record<string, string>;
  evaluation: Record<string, unknown> | null;
}

export default function ReviewQueuePage() {
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [recommendationFilter, setRecommendationFilter] = useState('all');
  const [candidates, setCandidates] = useState<CandidateForReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (recommendationFilter !== 'all') params.set('recommendation', recommendationFilter);

    clientLogger.info(SVC, 'Fetching review candidates', { filter: recommendationFilter });
    fetch(`/api/candidates?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setCandidates(data.candidates || []);
        clientLogger.info(SVC, 'Review candidates loaded', {
          filter: recommendationFilter,
          count: (data.candidates || []).length,
        });
      })
      .catch((err) => {
        setCandidates([]);
        clientLogger.error(SVC, 'Failed to load review candidates', { error: err.message });
      })
      .finally(() => setLoading(false));
  }, [recommendationFilter]);

  return (
    <div className="space-y-6" data-testid="review-queue-page">
      <h2 className="text-2xl font-bold text-gray-900">Cola de Revisión</h2>

      <div className="flex gap-4 flex-wrap">
        <Select value={recommendationFilter} onValueChange={(v) => setRecommendationFilter(v ?? 'all')}>
          <SelectTrigger className="w-48" data-testid="filter-recommendation">
            <SelectValue placeholder="Todas las recomendaciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="highly_recommended">Altamente Recomendado</SelectItem>
            <SelectItem value="recommended">Recomendado</SelectItem>
            <SelectItem value="not_recommended">No Recomendado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidato</TableHead>
                <TableHead>Campaña</TableHead>
                <TableHead>Puntaje</TableHead>
                <TableHead>Recomendación</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    Cargando candidatos...
                  </TableCell>
                </TableRow>
              ) : candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      title="Sin candidatos pendientes"
                      description="No hay candidatos esperando revisión en este momento."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((item) => (
                  <TableRow key={item.candidate.candidateId} data-testid={`review-row-${item.candidate.candidateId}`}>
                    <TableCell className="font-medium">
                      {item.candidate.name || `Candidato ${item.candidate.candidateId.slice(0, 8)}`}
                    </TableCell>
                    <TableCell className="text-gray-500">{item.candidate.campaignId.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <ScoreBadge score={item.evaluation?.globalScore as number || 0} />
                    </TableCell>
                    <TableCell>
                      <RecommendationBadge recommendation={(item.evaluation?.recommendation as string) || 'not_recommended'} />
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(item.candidate.createdAt).toLocaleDateString('es')}
                    </TableCell>
                    <TableCell>
                      <Link href={`/review/${item.candidate.candidateId}`}>
                        <Button variant="ghost" size="sm" data-testid={`review-button-${item.candidate.candidateId}`}>
                          Revisar
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
