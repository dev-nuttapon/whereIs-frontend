import { useMemo, useRef, useState } from 'react';
import { Popconfirm, Tag } from 'antd';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ItemIcon, PlusIcon } from '@/components/ui/icons';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/cn';
import type { AssetPhoto } from '@/types/domain.types';
import { useDeleteAssetPhoto, useUploadAssetPhoto } from '@/features/assets/hooks/useAssets';

interface AssetPhotoManagerProps {
  wsId: string;
  assetId: string;
  photos?: AssetPhoto[];
}

function sortPhotos(photos: AssetPhoto[]) {
  return [...photos].sort((left, right) => {
    if (left.isMain && !right.isMain) return -1;
    if (!left.isMain && right.isMain) return 1;
    return left.sortOrder - right.sortOrder;
  });
}

export function AssetPhotoManager({ wsId, assetId, photos = [] }: AssetPhotoManagerProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [setAsMain, setSetAsMain] = useState(true);
  const uploadPhoto = useUploadAssetPhoto(wsId, assetId);
  const deletePhoto = useDeleteAssetPhoto(wsId, assetId);

  const orderedPhotos = useMemo(() => sortPhotos(photos), [photos]);
  const mainPhoto = orderedPhotos.find((photo) => photo.isMain) ?? orderedPhotos[0] ?? null;

  const resetSelection = () => {
    setSelectedFile(null);
    setSetAsMain(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{t('items.photo.title', 'Photos')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('items.photo.description', 'Upload, preview, and remove photos for this item.')}</p>
          </div>
          <div className="flex items-center gap-2">
            {mainPhoto ? <Tag color="blue">{t('items.photo.main', 'Main photo')}</Tag> : null}
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadPhoto.isPending}
            >
              <PlusIcon className="h-4 w-4" />
              {t('items.photo.add', 'Add photo')}
            </Button>
          </div>
        </div>

        <div className="grid gap-[18px] lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
            <div className="space-y-2.5">
              <label className="text-sm font-medium leading-none" htmlFor="asset-photo-file">
                {t('items.photo.file', 'Photo file')}
              </label>
              <input
                id="asset-photo-file"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setSelectedFile(file);
                }}
                className={cn(
                  'flex h-10 w-full rounded-full border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                  'file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary-foreground',
                )}
              />
              <p className="text-xs leading-5 text-muted-foreground">{t('items.photo.fileHelp', 'Choose an image file from your device.')}</p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/80 p-3">
              <Checkbox checked={setAsMain} onChange={(event) => setSetAsMain(Boolean(event.target.checked))} />
              <div className="space-y-1">
                <p className="text-sm font-medium">{t('items.photo.setMain', 'Set as main photo')}</p>
                <p className="text-xs leading-5 text-muted-foreground">{t('items.photo.setMainHelp', 'Mark the uploaded photo as the primary image for this item.')}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={async () => {
                  if (!selectedFile) return;
                  await uploadPhoto.mutateAsync({ file: selectedFile, setAsMain });
                  resetSelection();
                }}
                disabled={!selectedFile || uploadPhoto.isPending}
              >
                {uploadPhoto.isPending ? t('common.saving', 'Saving...') : t('items.photo.upload', 'Upload')}
              </Button>
              <Button type="button" variant="outline" onClick={resetSelection}>
                {t('common.cancel', 'Cancel')}
              </Button>
            </div>

            {selectedFile ? (
              <p className="text-xs text-muted-foreground">
                {t('items.photo.selected', 'Selected')}: {selectedFile.name}
              </p>
            ) : null}
          </div>

          <div className="space-y-4">
            {orderedPhotos.length === 0 ? (
              <EmptyState
                title={t('items.photo.emptyTitle', 'No photos yet')}
                description={t('items.photo.emptyDescription', 'Add the first photo to help identify this item faster.')}
                icon={<ItemIcon className="h-5 w-5" />}
              />
            ) : (
              <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
                {orderedPhotos.map((photo) => (
                  <div key={photo.id} className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-3">
                    <div className="relative overflow-hidden rounded-xl border border-border/70 bg-muted/30">
                      <img
                        src={photo.url}
                        alt={t('items.photo.alt', 'Item photo')}
                        className={cn('h-44 w-full object-cover', photo.isMain ? 'ring-2 ring-primary/60' : '')}
                      />
                      {photo.isMain ? (
                        <Tag className="absolute left-3 top-3 m-0" color="blue">
                          {t('items.photo.main', 'Main photo')}
                        </Tag>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-xs text-muted-foreground">{photo.url}</p>
                      <Popconfirm
                        title={t('items.photo.deleteConfirmTitle', 'Delete this photo?')}
                        description={t('items.photo.deleteConfirmDescription', 'This will remove the photo from the item.')}
                        okText={t('common.delete', 'Delete')}
                        cancelText={t('common.cancel', 'Cancel')}
                        okButtonProps={{ danger: true }}
                        onConfirm={async () => {
                          await deletePhoto.mutateAsync(photo.id);
                        }}
                      >
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={deletePhoto.isPending}
                        >
                          {deletePhoto.isPending ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
                        </Button>
                      </Popconfirm>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
