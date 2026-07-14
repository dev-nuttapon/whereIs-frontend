import { client } from '@/api/client';
import type { AssetPhoto } from '@/types/domain.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface AssetPhotoDto {
  id: string;
  url: string;
  isMain: boolean;
  sortOrder: number;
}

function toAssetPhoto(dto: AssetPhotoDto): AssetPhoto {
  return {
    id: dto.id,
    url: dto.url,
    isMain: dto.isMain,
    sortOrder: dto.sortOrder,
  };
}

export async function uploadAssetPhoto(
  wsId: string,
  assetId: string,
  file: File,
  setAsMain = false,
): Promise<AssetPhoto> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await client.post<ApiResponse<AssetPhotoDto>>(
    `/workspaces/${encodeURIComponent(wsId)}/assets/${encodeURIComponent(assetId)}/photos`,
    formData,
    {
      params: { setAsMain },
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return toAssetPhoto(response.data.data);
}

export async function deleteAssetPhoto(wsId: string, assetId: string, photoId: string): Promise<{ success: true }> {
  await client.delete(`/workspaces/${encodeURIComponent(wsId)}/assets/${encodeURIComponent(assetId)}/photos/${encodeURIComponent(photoId)}`);
  return { success: true };
}
