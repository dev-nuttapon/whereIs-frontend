import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { listOptions, type RemoteOption } from '@/api/options.api';

export function useRemoteOptions(wsId: string, resource: Parameters<typeof listOptions>[1], value?: string, enabled = true) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => setPage(1), [debouncedSearch]);

  const query = useQuery({
    queryKey: ['remote-options', wsId, resource, debouncedSearch, page],
    queryFn: () => listOptions(wsId, resource, { search: debouncedSearch, page, pageSize: 20 }),
    enabled: Boolean(wsId && enabled),
  });
  const selectedQuery = useQuery({
    queryKey: ['remote-options-selected', wsId, resource, value],
    queryFn: () => listOptions(wsId, resource, { ids: value ? [value] : [] }),
    enabled: Boolean(wsId && enabled && value && !query.data?.items.some((item) => item.id === value)),
  });
  const options = useMemo(() => {
    const merged = [...(selectedQuery.data?.items ?? []), ...(query.data?.items ?? [])];
    return merged.filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index);
  }, [query.data?.items, selectedQuery.data?.items]);

  return {
    ...query,
    options,
    search,
    setSearch,
    page,
    hasNextPage: Boolean(query.data && query.data.page * query.data.pageSize < query.data.totalCount),
    loadNextPage: () => { if (!query.isFetching && query.data && query.data.page * query.data.pageSize < query.data.totalCount) setPage((current) => current + 1); },
  };
}
