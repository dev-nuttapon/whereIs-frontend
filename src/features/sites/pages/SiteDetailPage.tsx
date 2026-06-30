import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSite } from '@/features/sites/hooks/useSites';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { SiteFormDialog } from '@/features/sites/components/SiteFormDialog';
import { useI18n } from '@/hooks/useI18n';
import { MOCK_CONTAINERS, MOCK_LOCATIONS } from '@/mocks/mock-data';

export function SiteDetailPage() {
  const { wsId = 'ws-warehouse', siteId = '' } = useParams();
  const siteQuery = useSite(wsId, siteId);
  const [editOpen, setEditOpen] = useState(false);
  const { t } = useI18n();
  const locations = MOCK_LOCATIONS.filter((location) => location.workspaceId === wsId && location.siteId === siteId);
  const locationMap = new Map(locations.map((location) => [location.id, location]));
  const containerCount = MOCK_CONTAINERS.filter((container) => {
    const location = MOCK_LOCATIONS.find((entry) => entry.id === container.locationId);
    return location?.siteId === siteId;
  }).length;

  return (
    <PageShell title={t('sites.detail.title')} description={t('sites.detail.description')}>
      {siteQuery.isLoading ? <LoadingState label={t('sites.detail.loading')} /> : null}
      {siteQuery.isError ? <ErrorState message={t('sites.detail.error')} onRetry={() => siteQuery.refetch()} /> : null}
      {siteQuery.data ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="space-y-2 p-6">
                <CardTitle className="text-base">{siteQuery.data.name}</CardTitle>
                <CardDescription>{siteQuery.data.description ?? t('sites.detail.noDescription')}</CardDescription>
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                  {t('sites.detail.edit')}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-6">
                <CardTitle className="text-base">Coverage</CardTitle>
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">{t('locations.list.title')}</p>
                    <p className="font-medium">{locations.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('containers.list.title')}</p>
                    <p className="font-medium">{containerCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {locations.length > 0 ? (
            <Card>
              <CardContent className="space-y-3 p-6">
                <CardTitle className="text-base">Locations in this site</CardTitle>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {locations.map((location) => (
                    <div key={location.id} className="rounded-lg border border-border/70 bg-background/70 p-3 text-sm">
                      <p className="font-medium">{location.name}</p>
                      <p className="text-muted-foreground">{location.parentId ? locationMap.get(location.parentId)?.name ?? t('common.root') : t('common.root')}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
      {siteQuery.data ? (
        <SiteFormDialog wsId={wsId} open={editOpen} onOpenChange={setEditOpen} site={siteQuery.data} />
      ) : null}
    </PageShell>
  );
}
