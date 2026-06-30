import { useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ROUTES } from '@/constants/routes';
import { useSearchItems } from '@/features/items/hooks/useItems';
import { useI18n } from '@/hooks/useI18n';
import { FilterIcon, OpenIcon, SearchIcon } from '@/components/ui/icons';
import { MOCK_CONTAINERS } from '@/mocks/mock-data';

export function SearchPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();
  const q = searchParams.get('q') ?? '';

  const query = useSearchItems(wsId, {
    q,
    page: Number(searchParams.get('page') ?? 1),
    limit: 20,
  });

  const items = useMemo(() => query.data?.data ?? [], [query.data]);
  const containerMap = useMemo(() => new Map(MOCK_CONTAINERS.map((container) => [container.id, container])), []);

  return (
    <PageShell
      title={t('search.title')}
      description={t('search.description')}
      actions={
        <>
          <Button variant="outline" onClick={() => setSearchParams({})}>
            <FilterIcon className="h-4 w-4" />
            {t('search.clear')}
          </Button>
        </>
      }
    >
      {query.isLoading ? <LoadingState label={t('search.loading')} /> : null}
      {query.isError ? <ErrorState message={t('search.error')} onRetry={() => query.refetch()} /> : null}
      {items.length === 0 && query.data ? (
        <EmptyState
          title={t('search.emptyTitle')}
          description={t('search.emptyDescription')}
          icon={<SearchIcon className="h-5 w-5" />}
        />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="space-y-3 p-6">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <CardDescription>{item.code ?? t('search.noCode')}</CardDescription>
              <CardDescription className="text-sm">{item.description ?? t('items.detail.noDescription')}</CardDescription>
              {item.containerId ? (
                <CardDescription className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {containerMap.get(item.containerId)?.code ?? item.containerId}
                </CardDescription>
              ) : null}
              <StatusBadge status={item.status} />
              <Button variant="outline" asChild>
                <Link to={ROUTES.workspaceItemDetail(wsId, item.id)}>
                  <OpenIcon className="h-4 w-4" />
                  {t('search.openDetail')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
