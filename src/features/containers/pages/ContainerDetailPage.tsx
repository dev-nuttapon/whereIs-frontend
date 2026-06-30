import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { MOCK_CONTAINERS, MOCK_LOCATIONS, MOCK_SITES } from '@/mocks/mock-data';
import { useSearchItems } from '@/features/items/hooks/useItems';

export function ContainerDetailPage() {
  const { wsId = 'ws-warehouse', containerId } = useParams();
  const { t } = useI18n();
  const itemsQuery = useSearchItems(wsId, { page: 1, limit: 200 });
  const container = MOCK_CONTAINERS.find((entry) => entry.id === containerId) ?? null;
  const location = container ? MOCK_LOCATIONS.find((entry) => entry.id === container.locationId) ?? null : null;
  const site = location ? MOCK_SITES.find((entry) => entry.id === location.siteId) ?? null : null;
  const items = (itemsQuery.data?.data ?? []).filter((item) => item.containerId === containerId);

  return (
    <PageShell title={t('container.detail.title')} description={t('container.detail.description')}>
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1">
              <CardTitle className="text-base">
                {t('container.detail.containerLabel')} {container?.code ?? containerId}
              </CardTitle>
              <CardDescription>{container?.name ?? t('container.detail.itemlist')}</CardDescription>
            </div>
            <div className="grid gap-3 text-sm md:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Site</p>
                <p className="font-medium">{site?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('locations.list.title')}</p>
                <p className="font-medium">{location?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('items.list.count')}</p>
                <p className="font-medium">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <CardTitle className="text-base">Items in this container</CardTitle>
            {items.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border/70 bg-background/70 p-3 text-sm">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground">{item.code ?? t('items.detail.noCode')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <CardDescription>{t('container.detail.itemlist')}</CardDescription>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
