'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { clientLogger } from '@/infrastructure/logging/client-logger';

const SVC = 'campaign-detail';

const statusLabel: Record<string, string> = {
  active: 'Activa',
  draft: 'Borrador',
  inactive: 'Inactiva',
  archived: 'Archivada',
};

export default function CampaignDetailPage() {
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [campaign, setCampaign] = useState<Record<string, unknown> | null>(null);
  const params = useParams();

  useEffect(() => {
    clientLogger.info(SVC, 'Fetching campaign detail', { campaignId: params.campaignId as string });
    fetch(`/api/campaigns/${params.campaignId}`)
      .then(res => res.json())
      .then(data => {
        setCampaign(data.campaign);
        clientLogger.info(SVC, 'Campaign detail loaded', {
          campaignId: params.campaignId as string,
          name: data.campaign?.name,
          status: data.campaign?.status,
        });
      })
      .catch((err) => {
        setCampaign(null);
        clientLogger.error(SVC, 'Failed to load campaign detail', {
          campaignId: params.campaignId as string,
          error: err.message,
        });
      });
  }, [params.campaignId]);

  if (!campaign) {
    return (
      <div className="text-center py-12 text-gray-500" data-testid="campaign-detail-loading">
        Cargando campaña...
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(campaign.telegramLink as string);
    setCopied(true);
    clientLogger.info(SVC, 'Telegram link copied', { campaignId: params.campaignId as string });
    setTimeout(() => setCopied(false), 2000);
  };

  const isActive = campaign.status === 'active';

  // Solo una campaña "active" acepta candidatos (Telegram o /api/simulator).
  const handleToggleStatus = async () => {
    const next = isActive ? 'inactive' : 'active';
    setUpdating(true);
    clientLogger.info(SVC, 'Campaign status change requested', {
      campaignId: params.campaignId as string,
      from: campaign.status as string,
      to: next,
    });
    try {
      const res = await fetch(`/api/campaigns/${params.campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setCampaign(data.campaign);
      clientLogger.info(SVC, 'Campaign status updated', {
        campaignId: params.campaignId as string,
        status: data.campaign?.status,
      });
    } catch (err) {
      clientLogger.error(SVC, 'Failed to update campaign status', {
        campaignId: params.campaignId as string,
        error: (err as Error).message,
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="campaign-detail-page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{campaign.name as string}</h2>
          <Badge className="mt-2" variant={isActive ? 'default' : 'secondary'} data-testid="campaign-status-badge">
            {statusLabel[(campaign.status as string)] || campaign.status as string}
          </Badge>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={handleToggleStatus}
            disabled={updating}
            variant={isActive ? 'outline' : 'default'}
            data-testid="campaign-toggle-status-button"
          >
            {updating ? 'Guardando...' : isActive ? 'Desactivar campaña' : 'Activar campaña'}
          </Button>
          {!isActive && (
            <p className="text-xs text-gray-500">Los candidatos solo pueden iniciar la entrevista en campañas activas.</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="rubric">Rúbrica</TabsTrigger>
          <TabsTrigger value="link">Enlace Telegram</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Descripción del rol</h4>
                <p className="mt-1 text-gray-900">{campaign.roleDescription as string}</p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Fecha de creación</h4>
                <p className="mt-1 text-gray-900">{new Date(campaign.createdAt as string).toLocaleDateString('es')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rubric">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rúbrica de Evaluación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Plantilla: {(campaign.rubric as Record<string, string>)?.template === 'bpo' ? 'BPO - Agente de Servicio' : 'Tech - Desarrollador'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="link">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enlace de Telegram</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={campaign.telegramLink as string} readOnly data-testid="telegram-link-input" />
                <Button onClick={handleCopyLink} variant="outline" data-testid="copy-link-button">
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Comparte este enlace con los candidatos para que inicien la entrevista.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
