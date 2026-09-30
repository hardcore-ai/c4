'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScoreBadge } from '@/components/shared/score-badge';
import { RecommendationBadge } from '@/components/shared/recommendation-badge';
import { TranscriptViewer } from '@/components/shared/transcript-viewer';
import { EvidenceQuote } from '@/components/shared/evidence-quote';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { clientLogger } from '@/infrastructure/logging/client-logger';

const SVC = 'candidate-review';

export default function CandidateReviewPage() {
  const router = useRouter();
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
  const [reason, setReason] = useState('');
  const [disagreementReason, setDisagreementReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Data will be fetched via params + SWR in production
  const candidate = null as Record<string, unknown> | null;
  const evaluation = null as Record<string, unknown> | null;
  const messages: { role: string; content: string; timestamp: string }[] = [];

  if (!candidate || !evaluation) {
    return (
      <div className="text-center py-12 text-gray-500" data-testid="review-detail-loading">
        Cargando información del candidato...
      </div>
    );
  }

  const globalScore = evaluation.globalScore as number;
  const recommendation = evaluation.recommendation as string;
  const competencyScores = (evaluation.competencyScores || []) as Record<string, unknown>[];
  const keySignals = (evaluation.keySignals || []) as string[];

  const needsDisagreementReason = decision && (
    (decision === 'approved' && recommendation === 'not_recommended') ||
    (decision === 'rejected' && recommendation !== 'not_recommended')
  );

  async function handleSubmit() {
    if (!decision) return;
    setLoading(true);

    const candidateId = candidate!.candidateId as string;
    clientLogger.info(SVC, 'Submitting review decision', {
      candidateId,
      decision,
      recommendation,
      disagreesWithAI: !!needsDisagreementReason,
    });

    try {
      const res = await fetch(`/api/candidates/${candidateId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          reason: reason || undefined,
          disagreementReason: needsDisagreementReason ? disagreementReason : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al enviar la decisión');
      }

      clientLogger.info(SVC, 'Review decision submitted successfully', {
        candidateId,
        decision,
      });
      router.push('/review');
      router.refresh();
    } catch (err) {
      clientLogger.error(SVC, 'Failed to submit review decision', {
        candidateId,
        decision,
        error: err instanceof Error ? err.message : 'unknown',
      });
      alert(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
      setDialogOpen(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto" data-testid="candidate-review-page">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resumen Ejecutivo</CardTitle>
            <RecommendationBadge recommendation={recommendation} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold" data-testid="global-score">{globalScore.toFixed(1)}</div>
              <div className="text-sm text-gray-500">/ 5.0</div>
            </div>
            <Progress value={(globalScore / 5) * 100} className="flex-1" />
          </div>

          {keySignals.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Señales Clave</h4>
              <ul className="space-y-1">
                {keySignals.map((signal, i) => (
                  <li key={i} className="text-sm text-gray-700">• {signal}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Competency Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluación por Competencia</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion className="space-y-2">
            {competencyScores.map((cs, i) => (
              <AccordionItem key={i} value={`comp-${i}`} data-testid={`competency-${i}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">{cs.competencyName as string}</span>
                    <ScoreBadge score={cs.score as number} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-2">
                  <p className="text-sm text-gray-600">{cs.justification as string}</p>
                  <Separator />
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-gray-500 uppercase">Evidencia</h5>
                    {((cs.evidence || []) as Record<string, unknown>[]).map((ev, j) => (
                      <EvidenceQuote
                        key={j}
                        quote={ev.quote as string}
                        relevance={ev.relevance as string}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Transcript */}
      <Card>
        <CardHeader>
          <CardTitle>Transcripción Completa</CardTitle>
        </CardHeader>
        <CardContent>
          <TranscriptViewer messages={messages} />
        </CardContent>
      </Card>

      {/* Decision Panel */}
      <Card className="sticky bottom-4 shadow-lg border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-3">
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => { setDecision('approved'); setDialogOpen(true); }}
                data-testid="approve-button"
              >
                Aprobar
              </Button>
              <Button
                variant="destructive"
                onClick={() => { setDecision('rejected'); setDialogOpen(true); }}
                data-testid="reject-button"
              >
                Rechazar
              </Button>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent data-testid="decision-dialog">
                  <DialogHeader>
                    <DialogTitle>
                      {decision === 'approved' ? 'Aprobar Candidato' : 'Rechazar Candidato'}
                    </DialogTitle>
                    <DialogDescription>
                      {needsDisagreementReason
                        ? 'Tu decisión difiere de la recomendación de la IA. Por favor explica tu razón.'
                        : 'Confirma tu decisión. Puedes agregar una razón opcional.'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason">Razón (opcional)</Label>
                      <Textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Motivo de tu decisión..."
                        maxLength={1000}
                        data-testid="review-reason-input"
                      />
                    </div>

                    {needsDisagreementReason && (
                      <div className="space-y-2">
                        <Label htmlFor="disagreement" className="text-red-600">
                          Razón del desacuerdo con la IA *
                        </Label>
                        <Textarea
                          id="disagreement"
                          value={disagreementReason}
                          onChange={(e) => setDisagreementReason(e.target.value)}
                          placeholder="Explica por qué tu decisión difiere de la recomendación..."
                          required
                          maxLength={1000}
                          data-testid="disagreement-reason-input"
                        />
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || (!!needsDisagreementReason && !disagreementReason.trim())}
                      data-testid="confirm-decision-button"
                    >
                      {loading ? 'Enviando...' : 'Confirmar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
