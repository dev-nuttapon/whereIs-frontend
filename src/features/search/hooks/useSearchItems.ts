import { useQuery } from '@tanstack/react-query';
import { listItems, type ListItemsParams } from '@/api/item.api';
import { queryKeys } from '@/lib/queryKeys';

export function useSearchItems(wsId: string, params: ListItemsParams) {
  return useQuery({
    queryKey: queryKeys.items.list(wsId, params as Record<string, string | number | undefined>),
    queryFn: () => listItems(wsId, params),
    enabled: Boolean(wsId),
    placeholderData: (previous) => previous,
  });
}
