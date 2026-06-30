import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { StatCard } from '@/components/common/StatCard';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { MOCK_CONTAINERS, MOCK_LOCATIONS, MOCK_SITES } from '@/mocks/mock-data';
import { LocationIcon, OpenIcon } from '@/components/ui/icons';

export function LocationsPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t } = useI18n();

  const locations = useMemo(() => MOCK_LOCATIONS.filter((location) => location.workspaceId === wsId), [wsId]);
  const containers = useMemo(() => MOCK_CONTAINERS.filter((container) => container.workspaceId === wsId), [wsId]);
  const sites = useMemo(() => MOCK_SITES.filter((site) => site.workspaceId === wsId), [wsId]);
  const siteMap = useMemo(() => new Map(sites.map((site) => [site.id, site])), [sites]);

  const childrenByParent = useMemo(() => {
    const map = new Map<string, string[]>();
    locations.forEach((location) => {
      const key = location.parentId ?? 'root';
      map.set(key, [...(map.get(key) ?? []), location.id]);
    });
    return map;
  }, [locations]);

  return (
    <PageShell title={t('locations.list.title')} description={t('locations.list.description')}>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t('locations.list.title')} value={locations.length} />
        <StatCard label={t('sites.title')} value={siteMap.size} />
        <StatCard label={t('containers.list.title')} value={containers.length} />
      </div>

      {locations.length === 0 ? (
        <EmptyState
          title={t('locations.list.emptyTitle')}
          description={t('locations.list.emptyDescription')}
          icon={<LocationIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="space-y-4">
          {sites.map((site) => {
            const siteLocations = locations.filter((location) => location.siteId === site.id);
            if (siteLocations.length === 0) {
              return null;
            }

            return (
              <Card key={site.id} className="overflow-hidden">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{site.name}</CardTitle>
                      <CardDescription>{site.description}</CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link to={ROUTES.workspaceSiteExplorer(wsId, site.id)}>
                        <OpenIcon className="h-4 w-4" />
                        {t('locations.list.site')}
                      </Link>
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {siteLocations.map((location) => {
                      const childCount = childrenByParent.get(location.id)?.length ?? 0;
                      const parent = location.parentId ? locations.find((item) => item.id === location.parentId) : null;

                      return (
                        <div key={location.id} className="rounded-xl border border-border/70 bg-background/70 p-4">
                          <div className="space-y-1">
                            <p className="font-medium">{location.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {t('locations.list.parent')}: {parent?.name ?? t('common.root')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('locations.list.children')}: {childCount}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
