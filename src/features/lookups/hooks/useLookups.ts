import { useQuery } from '@tanstack/react-query';
import { getLookups } from '@/api/lookups.api';
import { queryKeys } from '@/lib/queryKeys';

export function useLookups() {
  return useQuery({
    queryKey: queryKeys.lookups.all,
    queryFn: () => getLookups(),
  });
}
