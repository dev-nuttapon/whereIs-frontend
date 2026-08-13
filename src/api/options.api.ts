import { client } from '@/api/client';

export interface RemoteOption {
  id: string;
  label: string;
  code?: string | null;
}

export interface OptionsResult {
  items: RemoteOption[];
  page: number;
  pageSize: number;
  totalCount: number;
}

type OptionResource = 'products' | 'assets' | 'stock' | 'locations' | 'containers';

export async function listOptions(
  wsId: string,
  resource: OptionResource,
  params: { search?: string; ids?: string[]; page?: number; pageSize?: number } = {},
): Promise<OptionsResult> {
  const response = await client.get<{ success: boolean; data: OptionsResult }>(
    `/workspaces/${encodeURIComponent(wsId)}/${resource}/options`,
    { params: {
      search: params.search?.trim() || undefined,
      ids: params.ids?.length ? params.ids.join(',') : undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    } },
  );
  return response.data.data;
}
