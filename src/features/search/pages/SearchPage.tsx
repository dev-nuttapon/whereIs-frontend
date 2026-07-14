import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { StatCard } from '@/components/common/StatCard';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { useSearchItems } from '@/features/search/hooks/useSearchItems';
import { SearchFilters, type SearchFilterValues } from '@/features/search/components/SearchFilters';
import { SearchResults } from '@/features/search/components/SearchResults';
import { useI18n } from '@/hooks/useI18n';

function readParams(searchParams: URLSearchParams): SearchFilterValues {
  return {
    q: searchParams.get('q') ?? '',
    kind: searchParams.get('kind') ?? '',
    status: searchParams.get('status') ?? '',
    containerId: searchParams.get('containerId') ?? '',
  };
}

export function SearchPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();
  const [filters, setFilters] = useState<SearchFilterValues>(() => readParams(searchParams));
  const containersQuery = useContainers(wsId);

  useEffect(() => {
    setFilters(readParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextParams = new URLSearchParams();
      if (filters.q.trim()) nextParams.set('q', filters.q.trim());
      if (filters.kind) nextParams.set('kind', filters.kind);
      if (filters.status) nextParams.set('status', filters.status);
      if (filters.containerId) nextParams.set('containerId', filters.containerId);
      setSearchParams(nextParams, { replace: true });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [filters, setSearchParams]);

  const query = useSearchItems(wsId, {
    q: filters.q.trim() || undefined,
    kind: filters.kind || undefined,
    status: filters.status || undefined,
    containerId: filters.containerId || undefined,
    page: 1,
    limit: 24,
  });

  const items = query.data?.items ?? [];
  const containerNameById = useMemo(
    () => new Map((containersQuery.data ?? []).map((container) => [container.id, container.name])),
    [containersQuery.data],
  );

  const activeFilters = Boolean(filters.q || filters.kind || filters.status || filters.containerId);

  return (
    <PageShell
      title={t('search.title', 'Search')}
      description={t('search.description', 'Search items and open the detail page.')}
    >
      {query.isLoading ? <LoadingState label={t('search.loading', 'Searching...')} /> : null}
      {query.isError ? <ErrorState message={t('search.error', 'Search failed.')} onRetry={() => query.refetch()} /> : null}

      <div className="grid gap-[18px] md:grid-cols-3">
        <StatCard label={t('search.resultsCount', '{count} results', { count: items.length })} value={items.length} />
        <StatCard label={t('search.activeFilters', 'Active filters')} value={activeFilters ? 1 : 0} />
        <StatCard label={t('containers.list.total', 'Containers')} value={containersQuery.data?.length ?? 0} />
      </div>

      <SearchFilters
        value={filters}
        onChange={setFilters}
        containerOptions={(containersQuery.data ?? []).map((container) => ({ value: container.id, label: container.name }))}
      />

      <SearchResults wsId={wsId} items={items} containerNameById={containerNameById} />
    </PageShell>
  );
}
