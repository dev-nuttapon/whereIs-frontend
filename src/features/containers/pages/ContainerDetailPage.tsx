import { useParams } from 'react-router-dom';
import { Descriptions } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useI18n } from '@/hooks/useI18n';
import { useContainer } from '@/features/containers/hooks/useContainers';

export function ContainerDetailPage() {
  const { wsId = 'ws-warehouse', containerId } = useParams();
  const { t } = useI18n();
  const resolvedContainerId = containerId ?? '';
  const containerQuery = useContainer(wsId, resolvedContainerId);
  const container = containerQuery.data ?? null;

  return (
    <PageShell title={t('container.detail.title')} description={t('container.detail.description')}>
      <div className="component-stack">
        {containerQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
        {containerQuery.isError ? <ErrorState message={t('container.detail.error', 'Unable to load container.')} onRetry={() => containerQuery.refetch()} /> : null}
        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="space-y-1">
              <CardTitle className="text-base">
                {t('container.detail.containerLabel')} {container?.name ?? containerId}
              </CardTitle>
              <CardDescription>{container?.typeLabel ?? t('container.detail.itemlist')}</CardDescription>
            </div>
            <div className="responsive-descriptions">
              <Descriptions bordered column={{ xs: 1, md: 3 }} size="middle">
                <Descriptions.Item label={t('container.detail.containerLabel')}>{container?.name ?? containerId}</Descriptions.Item>
                <Descriptions.Item label={t('items.list.count')}>{container?.itemCount ?? 0}</Descriptions.Item>
                <Descriptions.Item label={t('containers.list.title')}>{container?.parentId ?? '—'}</Descriptions.Item>
              </Descriptions>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
