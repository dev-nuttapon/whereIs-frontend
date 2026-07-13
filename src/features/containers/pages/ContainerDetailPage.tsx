import { useParams } from 'react-router-dom';
import { Descriptions, Space, Typography } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useI18n } from '@/hooks/useI18n';
import { useContainer, useContainerItems } from '@/features/containers/hooks/useContainers';

export function ContainerDetailPage() {
  const { wsId = 'ws-warehouse', containerId } = useParams();
  const { t } = useI18n();
  const resolvedContainerId = containerId ?? '';
  const containerQuery = useContainer(wsId, resolvedContainerId);
  const itemsQuery = useContainerItems(wsId, resolvedContainerId);
  const container = containerQuery.data ?? null;
  const items = itemsQuery.data ?? [];

  return (
    <PageShell title={t('container.detail.title')} description={t('container.detail.description')}>
      <div className="space-y-4">
        {containerQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
        {containerQuery.isError ? <ErrorState message={t('container.detail.error', 'Unable to load container.')} onRetry={() => containerQuery.refetch()} /> : null}
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1">
              <CardTitle className="text-base">
                {t('container.detail.containerLabel')} {container?.name ?? containerId}
              </CardTitle>
              <CardDescription>{container?.typeLabel ?? t('container.detail.itemlist')}</CardDescription>
            </div>
            <Descriptions bordered column={{ xs: 1, md: 3 }} size="middle">
              <Descriptions.Item label={t('container.detail.containerLabel')}>{container?.name ?? containerId}</Descriptions.Item>
              <Descriptions.Item label={t('items.list.count')}>{items.length}</Descriptions.Item>
              <Descriptions.Item label={t('containers.list.title')}>{container?.name ?? '—'}</Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <CardTitle className="text-base">Items in this container</CardTitle>
            {itemsQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
            {itemsQuery.isError ? <ErrorState message={t('items.detail.loadError')} onRetry={() => itemsQuery.refetch()} /> : null}
            {items.length > 0 ? (
              <div className="divide-y divide-border rounded-lg border border-border">
                {items.map((item) => (
                  <div key={item.id} className="px-4 py-3">
                    <Space direction="vertical" size={0}>
                      <Typography.Text strong>{item.name}</Typography.Text>
                      <Typography.Text type="secondary">{item.code ?? t('items.detail.noCode')}</Typography.Text>
                    </Space>
                  </div>
                ))}
              </div>
            ) : (
              <CardDescription>{t('container.detail.itemlist')}</CardDescription>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
