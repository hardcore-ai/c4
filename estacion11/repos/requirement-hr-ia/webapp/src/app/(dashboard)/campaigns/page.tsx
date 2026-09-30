import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTenantContext } from '@/infrastructure/auth/get-tenant';
import { listCampaigns } from '@/application/campaign/list-campaigns';
import { logger } from '@/infrastructure/logging/logger';
import { enrichActiveSpan } from '@/infrastructure/telemetry/enrich-span';

const SVC = 'campaigns-page';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  draft: 'secondary',
  inactive: 'outline',
  archived: 'destructive',
};

const statusLabel: Record<string, string> = {
  active: 'Activa',
  draft: 'Borrador',
  inactive: 'Inactiva',
  archived: 'Archivada',
};

async function getCampaigns() {
  const ctx = await getTenantContext();
  if (!ctx) {
    logger.warn(SVC, 'No tenant context — cannot load campaigns');
    return [];
  }
  enrichActiveSpan({ tenant: ctx, route: 'GET /campaigns (SSR)' });
  logger.info(SVC, 'Loading campaigns', { tenantId: ctx.tenantId, context: { userId: ctx.userId } });
  const campaigns = await listCampaigns(ctx.tenantId);
  logger.info(SVC, 'Campaigns loaded', { tenantId: ctx.tenantId, context: { count: campaigns.length } });
  return campaigns;
}

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();
  logger.info(SVC, 'Rendering campaigns page', { context: { campaignCount: campaigns.length } });

  return (
    <div className="space-y-6" data-testid="campaigns-page">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Campañas</h2>
        <Link href="/campaigns/new">
          <Button data-testid="create-campaign-button">Nueva Campaña</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Enlace Telegram</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                    No hay campañas creadas. Crea tu primera campaña para comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign: Record<string, string>) => (
                  <TableRow key={campaign.campaignId} data-testid={`campaign-row-${campaign.campaignId}`}>
                    <TableCell className="font-medium">
                      <Link href={`/campaigns/${campaign.campaignId}`} className="hover:underline">
                        {campaign.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[campaign.status] || 'secondary'}>
                        {statusLabel[campaign.status] || campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{campaign.telegramLink}</code>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(campaign.createdAt).toLocaleDateString('es')}
                    </TableCell>
                    <TableCell>
                      <Link href={`/campaigns/${campaign.campaignId}`}>
                        <Button variant="ghost" size="sm">Ver</Button>
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
