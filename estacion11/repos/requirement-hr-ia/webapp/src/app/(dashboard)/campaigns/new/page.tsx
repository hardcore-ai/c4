'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { clientLogger } from '@/infrastructure/logging/client-logger';

const SVC = 'new-campaign';

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    const name = formData.get('name') as string;
    const rubricTemplate = formData.get('rubricTemplate') as string;
    clientLogger.info(SVC, 'Creating campaign', { name, rubricTemplate });

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          roleDescription: formData.get('roleDescription'),
          rubricTemplate,
          knowledgeBaseContent: formData.get('knowledgeBaseContent') || undefined,
          careerPageUrl: formData.get('careerPageUrl') || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear la campaña');
      }

      const { campaign } = await res.json();
      clientLogger.info(SVC, 'Campaign created successfully', {
        campaignId: campaign.campaignId,
        name,
      });
      router.push(`/campaigns/${campaign.campaignId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      clientLogger.error(SVC, 'Failed to create campaign', { name, error: msg });
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto" data-testid="new-campaign-page">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva Campaña</h2>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la campaña *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Agentes de Servicio Q1 2026"
                required
                maxLength={200}
                data-testid="campaign-name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleDescription">Descripción del rol *</Label>
              <Textarea
                id="roleDescription"
                name="roleDescription"
                placeholder="Describe el rol, responsabilidades y requisitos..."
                required
                maxLength={2000}
                rows={4}
                data-testid="campaign-role-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rubricTemplate">Plantilla de rúbrica *</Label>
              <Select name="rubricTemplate" required>
                <SelectTrigger data-testid="campaign-rubric-select">
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bpo">BPO - Agente de Servicio al Cliente</SelectItem>
                  <SelectItem value="tech">Tech - Desarrollador de Software</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="knowledgeBaseContent">Base de conocimiento (opcional)</Label>
              <Textarea
                id="knowledgeBaseContent"
                name="knowledgeBaseContent"
                placeholder="Información sobre la empresa, el rol, preguntas frecuentes..."
                rows={4}
                data-testid="campaign-kb-input"
              />
              <p className="text-xs text-gray-500">
                Este contenido estará disponible para el agente durante la entrevista.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="careerPageUrl">URL de página de carreras (opcional)</Label>
              <Input
                id="careerPageUrl"
                name="careerPageUrl"
                type="url"
                placeholder="https://empresa.com/carreras"
                data-testid="campaign-career-url-input"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" data-testid="campaign-error">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} data-testid="campaign-submit-button">
                {loading ? 'Creando...' : 'Crear Campaña'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
