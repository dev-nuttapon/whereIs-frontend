import { useParams } from 'react-router-dom';
import { Descriptions, List, Space, Typography } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { MOCK_CONTAINERS } from '@/mocks/mock-data';
import { useSearchItems } from '@/features/items/hooks/useItems';

export function ContainerDetailPage() {
  const { wsId = 'ws-warehouse', containerId } = useParams();
  const { t } = useI18n();
  const itemsQuery = useSearchItems(wsId, { page: 1, limit: 200 });
  const container = MOCK_CONTAINERS.find((entry) => entry.id === containerId) ?? null;
  const items = (itemsQuery.data?.data ?? []).filter((item) => item.containerId === containerId);

  return (
    <PageShell title={t('container.detail.title')} description={t('container.detail.description')}>
      <div className="space-y-4">
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
            {items.length > 0 ? (
              <List
                bordered
                dataSource={items}
                renderItem={(item) => (
                  <List.Item>
                    <Space direction="vertical" size={0}>
                      <Typography.Text strong>{item.name}</Typography.Text>
                      <Typography.Text type="secondary">{item.code ?? t('items.detail.noCode')}</Typography.Text>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <CardDescription>{t('container.detail.itemlist')}</CardDescription>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
