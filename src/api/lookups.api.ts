import { client } from '@/api/client';
import type { LookupOption } from '@/types/domain.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface AllLookups {
  siteTypes: LookupOption[];
  locationTypes: LookupOption[];
  containerTypes: LookupOption[];
  unitTypes: LookupOption[];
}

export async function getLookups(): Promise<AllLookups> {
  const response = await client.get<ApiResponse<AllLookups>>('/lookups');
  return response.data.data;
}
