import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Select as AntSelect } from 'antd';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ROUTES } from '@/constants/routes';
import { useSearchItems } from '@/features/items/hooks/useItems';
import { useI18n } from '@/hooks/useI18n';
import { ContainerIcon, FilterIcon, MemberIcon, OpenIcon, SearchIcon } from '@/components/ui/icons';
import { MOCK_CONTAINERS, MOCK_MEMBERS } from '@/mocks/mock-data';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <AntSelect
        className="w-full"
        size="large"
        value={value}
        options={options}
        onChange={(nextValue) => onChange(String(nextValue))}
      />
    </label>
  );
}

export function SearchPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();
  const q = searchParams.get('q') ?? '';
  const filterKind = searchParams.get('kind') ?? 'all';
  const filterUsageType = searchParams.get('usageType') ?? 'all';
  const filterStatus = searchParams.get('status') ?? 'all';
  const hasAdvancedFilters = Boolean(
    searchParams.get('kind') || searchParams.get('usageType') || searchParams.get('status'),
  );
  const isAdvancedOpen = searchParams.get('advanced') === '1' || hasAdvancedFilters;
  const [draftQuery, setDraftQuery] = useState(q);

  useEffect(() => {
    setDraftQuery(q);
  }, [q]);

  useEffect(() => {
    const normalizedQuery = draftQuery.trim();
    const timeoutId = window.setTimeout(() => {
      if (normalizedQuery === q) {
        return;
      }

      setSearchParams((previousParams) => {
        const nextParams = new URLSearchParams(previousParams);
        if (normalizedQuery) {
          nextParams.set('q', normalizedQuery);
        } else {
          nextParams.delete('q');
        }
        nextParams.delete('page');
        return nextParams;
      }, { replace: true });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [draftQuery, q, setSearchParams]);

  function updateSearchParams(updates: Record<string, string>) {
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'all') {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      });
      nextParams.delete('page');
      nextParams.set('advanced', '1');
      return nextParams;
    }, { replace: true });
  }

  function clearSearch() {
    setSearchParams({});
  }

  function toggleAdvancedSearch() {
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);
      if (isAdvancedOpen) {
        nextParams.delete('advanced');
        nextParams.delete('kind');
        nextParams.delete('usageType');
        nextParams.delete('status');
      } else {
        nextParams.set('advanced', '1');
      }
      nextParams.delete('page');
      return nextParams;
    }, { replace: true });
  }

  const query = useSearchItems(wsId, {
    q,
    advanced: isAdvancedOpen ? '1' : undefined,
    kind: filterKind === 'all' ? undefined : filterKind,
    usageType: filterUsageType === 'all' ? undefined : filterUsageType,
    status: filterStatus === 'all' ? undefined : filterStatus,
    page: Number(searchParams.get('page') ?? 1),
    limit: 20,
  });

  const items = useMemo(() => query.data?.data ?? [], [query.data]);
  const containerMap = useMemo(() => new Map(MOCK_CONTAINERS.map((container) => [container.id, container])), []);
  const holderMap = useMemo(() => new Map(MOCK_MEMBERS.map((member) => [member.id, member])), []);
  const totalResults = query.data?.meta.total ?? items.length;
  const hasActiveSearch = Boolean(q.trim() || isAdvancedOpen || Number(searchParams.get('page') ?? 1) > 1);

  return (
    <div className="space-y-4 sm:space-y-6">
      {query.isLoading ? <LoadingState label={t('search.loading')} /> : null}
      {query.isError ? <ErrorState message={t('search.error')} onRetry={() => query.refetch()} /> : null}
      {!query.isLoading && !query.isError ? (
        <div className="space-y-4 sm:space-y-6">
          <Card className="border-border/70 bg-card/95 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl tracking-tight sm:text-2xl">{t('search.title')}</CardTitle>
                  <CardDescription className="max-w-2xl">{t('search.description')}</CardDescription>
                </div>
                {hasActiveSearch ? (
                  <Button variant="outline" onClick={clearSearch} className="md:self-start">
                    <FilterIcon className="h-4 w-4" />
                    {t('search.clear')}
                  </Button>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    aria-label={t('search.placeholder')}
                    className="h-12 rounded-2xl border-border/70 bg-background/90 pl-11 pr-4 text-[0.95rem] shadow-none placeholder:text-muted-foreground/90"
                    placeholder={t('search.placeholder')}
                    value={draftQuery}
                    onChange={(event) => setDraftQuery(event.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Badge variant="secondary">{t('search.resultsCount', undefined, { count: totalResults })}</Badge>
                  {q ? <Badge variant="outline">{q}</Badge> : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleAdvancedSearch}>
                  <FilterIcon className="h-4 w-4" />
                  {isAdvancedOpen ? t('search.advancedHide') : t('search.advanced')}
                </Button>
              </div>

              {isAdvancedOpen ? (
                <div className="space-y-4 border-t border-border/60 pt-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{t('search.filtersTitle')}</CardTitle>
                    <CardDescription>{t('search.filtersDescription')}</CardDescription>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <FilterSelect
                      label={t('search.kind')}
                      value={filterKind}
                      onChange={(value) => updateSearchParams({ kind: value })}
                      options={[
                        { value: 'all', label: t('search.all') },
                        { value: 'single', label: t('items.detail.kindSingle') },
                        { value: 'bulk', label: t('items.detail.kindBulk') },
                      ]}
                    />
                    <FilterSelect
                      label={t('search.usageType')}
                      value={filterUsageType}
                      onChange={(value) => updateSearchParams({ usageType: value })}
                      options={[
                        { value: 'all', label: t('search.all') },
                        { value: 'consumable', label: t('items.detail.usageTypeConsumable') },
                        { value: 'returnable', label: t('items.detail.usageTypeReturnable') },
                      ]}
                    />
                    <FilterSelect
                      label={t('search.status')}
                      value={filterStatus}
                      onChange={(value) => updateSearchParams({ status: value })}
                      options={[
                        { value: 'all', label: t('search.all') },
                        { value: 'stored', label: t('items.status.stored') },
                        { value: 'taken_out', label: t('items.status.taken_out') },
                        { value: 'missing', label: t('items.status.missing') },
                        { value: 'disposed', label: t('items.status.disposed') },
                      ]}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">{t('search.filtersHint')}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {items.length === 0 && query.data ? (
            <EmptyState
              title={t('search.emptyTitle')}
              description={t('search.emptyDescription')}
              actionLabel={q ? t('search.clear') : undefined}
              onAction={q ? clearSearch : undefined}
              icon={<SearchIcon className="h-5 w-5" />}
            />
          ) : null}

          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item) => {
                const container = item.containerId ? containerMap.get(item.containerId) : null;
                const holder = item.currentHolderId ? holderMap.get(item.currentHolderId) : null;
                const itemQuantity = item.kind === 'bulk' ? item.quantity ?? 1 : 1;
                const containerText = container ? `${container.code}${container.name ? ` · ${container.name}` : ''}` : t('items.detail.noContainer');
                return (
                  <Card key={item.id} className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardContent className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-lg sm:text-xl">{item.name}</CardTitle>
                          <Badge variant="outline">{item.code ?? t('items.detail.noCode')}</Badge>
                          <Badge variant="secondary">
                            {t('items.detail.quantity')}: {itemQuantity}
                          </Badge>
                          <StatusBadge status={item.status} />
                        </div>

                        <CardDescription className="max-w-3xl leading-6">
                          {item.description ?? t('items.detail.noDescription')}
                        </CardDescription>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <ContainerIcon className="h-4 w-4 shrink-0" />
                            <span>{containerText}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MemberIcon className="h-4 w-4 shrink-0" />
                            <span>{holder?.user.name ?? t('items.detail.noHolder')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-start gap-3 border-t border-border/60 pt-4 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                        <Button variant="outline" asChild>
                          <Link to={ROUTES.workspaceItemDetail(wsId, item.code ?? item.id)}>
                            <OpenIcon className="h-4 w-4" />
                            {t('search.openDetail')}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
