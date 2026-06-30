import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useSites } from '@/features/sites/hooks/useSites';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { SiteFormDialog } from '@/features/sites/components/SiteFormDialog';
import { useI18n } from '@/hooks/useI18n';
import { OpenIcon, PlusIcon, SiteIcon } from '@/components/ui/icons';

export function SitesPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const sitesQuery = useSites(wsId);
  const [createOpen, setCreateOpen] = useState(false);
  const { t } = useI18n();

  return (
    <PageShell title={t('sites.title')} description={t('sites.description')}>
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          {t('sites.create')}
        </Button>
      </div>
      {sitesQuery.isLoading ? <LoadingState label={t('sites.loading')} /> : null}
      {sitesQuery.isError ? <ErrorState message={t('sites.error')} onRetry={() => sitesQuery.refetch()} /> : null}
      {sitesQuery.data?.length === 0 ? (
        <EmptyState
          title={t('sites.emptyTitle')}
          description={t('sites.emptyDescription')}
          actionLabel={t('sites.create')}
          onAction={() => setCreateOpen(true)}
          icon={<SiteIcon className="h-5 w-5" />}
        />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sitesQuery.data?.map((site) => (
          <Card key={site.id}>
            <CardContent className="space-y-2 p-6">
              <CardTitle className="text-lg">{site.name}</CardTitle>
              <CardDescription>{site.description}</CardDescription>
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.workspaceSiteDetail(wsId, site.id)}>
                  <OpenIcon className="h-4 w-4" />
                  {t('sites.open')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <SiteFormDialog wsId={wsId} open={createOpen} onOpenChange={setCreateOpen} />
    </PageShell>
  );
}
