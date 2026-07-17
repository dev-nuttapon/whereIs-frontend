import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Descriptions, Popconfirm, Tag } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useI18n } from '@/hooks/useI18n';
import { EditIcon } from '@/components/ui/icons';
import { ROUTES } from '@/constants/routes';
import { useContainer, useContainers, useDeleteContainer, useMoveContainer, useUpdateContainer } from '@/features/containers/hooks/useContainers';
import { ContainerFormDialog } from '@/features/containers/components/ContainerFormDialog';
import { CreateItemDialog } from '@/features/items/components/CreateItemDialog';
import { PlusIcon } from '@/components/ui/icons';
import { useLocations } from '@/features/locations/hooks/useLocations';
import { useSites } from '@/features/sites/hooks/useSites';
import { buildLocationLabelMap } from '@/features/containers/utils/locationOptions';

export function ContainerDetailPage() {
  const { wsId = 'ws-warehouse', containerId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const resolvedContainerId = containerId ?? '';
  const containerQuery = useContainer(wsId, resolvedContainerId);
  const containersQuery = useContainers(wsId);
  const locationsQuery = useLocations(wsId);
  const sitesQuery = useSites(wsId);
  const container = containerQuery.data ?? null;
  const locationLabelById = useMemo(
    () => buildLocationLabelMap(locationsQuery.data ?? [], sitesQuery.data ?? []),
    [locationsQuery.data, sitesQuery.data],
  );
  const parentContainerNameById = useMemo(
    () => new Map((containersQuery.data ?? []).map((entry) => [entry.id, entry.name] as const)),
    [containersQuery.data],
  );
  const [editOpen, setEditOpen] = useState(false);
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const updateContainer = useUpdateContainer(wsId, resolvedContainerId);
  const moveContainer = useMoveContainer(wsId, resolvedContainerId);
  const deleteContainer = useDeleteContainer(wsId, resolvedContainerId);

  return (
    <PageShell title={t('container.detail.title')} description={t('container.detail.description')}>
      <div className="component-stack">
        {containerQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
        {containerQuery.isError ? <ErrorState message={t('container.detail.error', 'Unable to load container.')} onRetry={() => containerQuery.refetch()} /> : null}
        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="space-y-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    {t('container.detail.containerLabel')} {container?.name ?? containerId}
                  </CardTitle>
                  <CardDescription>{container?.typeLabel ?? t('container.detail.itemlist')}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setCreateItemOpen(true)} disabled={!container}>
                    <PlusIcon className="h-4 w-4" />
                    {t('items.list.create', 'เพิ่มของ')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} disabled={!container}>
                    <EditIcon className="h-4 w-4" />
                    {t('common.edit', 'แก้ไข')}
                  </Button>
                  <Popconfirm
                    title={t('containers.detail.deleteConfirmTitle', 'ลบ container นี้?')}
                    description={t('containers.detail.deleteConfirmDescription', 'container ที่มี container ลูกจะลบไม่ได้')}
                    okText={t('common.delete', 'ลบ')}
                    cancelText={t('common.cancel', 'ยกเลิก')}
                    okButtonProps={{ danger: true }}
                    onConfirm={async () => {
                      await deleteContainer.mutateAsync();
                      navigate(ROUTES.workspaceContainers(wsId), { replace: true });
                    }}
                  >
                    <Button variant="destructive" size="sm" disabled={!container || deleteContainer.isPending}>
                      {deleteContainer.isPending ? t('common.deleting', 'กำลังลบ...') : t('common.delete', 'ลบ')}
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            </div>
            {container?.photoUrl ? (
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
                <img src={container.photoUrl} alt={container.name} className="h-64 w-full object-cover" />
              </div>
            ) : null}
            <div className="responsive-descriptions">
              <Descriptions bordered column={{ xs: 1, md: 3 }} size="middle">
                <Descriptions.Item label={t('container.detail.containerLabel')}>{container?.name ?? containerId}</Descriptions.Item>
                <Descriptions.Item label={t('items.list.count')}>{container?.itemCount ?? 0}</Descriptions.Item>
                <Descriptions.Item label={t('containers.list.title')}>
                  {container?.parentId ? parentContainerNameById.get(container.parentId) ?? container.parentId : <Tag>{t('container.detail.noParent', 'Root container')}</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label={t('container.detail.location', 'Location')}>
                  {container?.locationId ? locationLabelById.get(container.locationId) ?? container.locationId : <Tag>{t('container.detail.noLocation', 'No location')}</Tag>}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </CardContent>
        </Card>
      </div>

      <ContainerFormDialog
        wsId={wsId}
        open={editOpen}
        onOpenChange={setEditOpen}
        title={t('containers.detail.editTitle', 'แก้ไข container')}
        description={t('containers.detail.editDescription', 'แก้ไขข้อมูล container นี้')}
        submitLabel={t('common.save', 'บันทึก')}
        initialValues={container ? {
          name: container.name,
          type: container.typeLabel === 'Container' ? '' : container.typeLabel,
          code: container.code ?? '',
          qrCode: container.qrCode ?? '',
          photoUrl: container.photoUrl ?? '',
          locationId: container.locationId ?? '',
          parentContainerId: container.parentId ?? '',
        } : undefined}
        onSubmit={async (values) => {
          const nextLocationId = values.locationId.trim() || null;
          const nextParentContainerId = values.parentContainerId.trim() || null;
          const nextName = values.name.trim();
          const nextType = values.type.trim() || null;
          const nextCode = values.code.trim() || null;
          const nextQrCode = values.qrCode.trim() || null;
          const nextPhotoUrl = values.photoUrl.trim() || null;
          const shouldUpdateMeta =
            nextName !== container?.name ||
            nextType !== (container?.typeLabel === 'Container' ? null : container?.typeLabel ?? null) ||
            nextCode !== (container?.code ?? null) ||
            nextQrCode !== (container?.qrCode ?? null) ||
            nextPhotoUrl !== (container?.photoUrl ?? null);
          const shouldMove =
            nextLocationId !== (container?.locationId ?? null) ||
            nextParentContainerId !== (container?.parentId ?? null);

          if (shouldUpdateMeta) {
            await updateContainer.mutateAsync({
              name: nextName,
              type: nextType,
              code: nextCode,
              qrCode: nextQrCode,
              photoUrl: nextPhotoUrl,
            });
          }
          if (shouldMove) {
            await moveContainer.mutateAsync({
              locationId: nextLocationId,
              parentContainerId: nextParentContainerId,
            });
          }

          setEditOpen(false);
        }}
        isSubmitting={updateContainer.isPending || moveContainer.isPending}
      />

      <CreateItemDialog
        wsId={wsId}
        open={createItemOpen}
        onOpenChange={setCreateItemOpen}
        initialValues={{
          containerId: container?.id ?? undefined,
        }}
      />
    </PageShell>
  );
}
