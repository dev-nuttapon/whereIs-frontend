import { useQuery } from '@tanstack/react-query';
import { listProducts } from '@/api/product.api';
import { queryKeys } from '@/lib/queryKeys';

export function useProducts(wsId: string) {
  return useQuery({
    queryKey: queryKeys.products(wsId),
    queryFn: () => listProducts(wsId),
    enabled: Boolean(wsId),
  });
}
