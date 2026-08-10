import { Link, useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { ActivityIcon } from '@/components/ui/icons';
import { Tag } from 'antd';
import { useI18n } from '@/hooks/useI18n';
import { useActivity } from '@/features/activity/hooks/useActivity';
import { ROUTES } from '@/constants/routes';

export function ActivityPage() {
  const { wsId = '' } = useParams();
  const { t } = useI18n();
  const activityQuery = useActivity(wsId, { limit: 20 });
  const events = activityQuery.data?.items ?? [];
  const eventLabel = (type: string) => {
    const labels: Record<string, string> = {
      created: 'สร้างรายการ',
      updated: 'แก้ไขข้อมูล',
      moved: 'ย้ายตำแหน่ง',
      borrowed: 'เบิก/ยืม',
      returned: 'คืนรายการ',
      stockadjusted: 'ปรับ stock',
      checkedout: 'เบิกออก',
      received: 'รับเข้า',
      disposed: 'จำหน่าย',
    };
    return labels[type.toLowerCase()] ?? type;
  };
  const sourceLink = (sourceType: string, sourceId: string) => {
    if (sourceType === 'Product') return ROUTES.workspaceProductDetail(wsId, sourceId);
    if (sourceType === 'Asset') return ROUTES.workspaceAssetDetail(wsId, sourceId);
    if (sourceType === 'StockEntry') return ROUTES.workspaceStockDetail(wsId, sourceId);
    if (sourceType === 'Container') return ROUTES.workspaceContainerDetail(wsId, sourceId);
    if (sourceType === 'BorrowOrder') return ROUTES.workspaceBorrowOrderDetail(wsId, sourceId);
    if (sourceType === 'Category') return ROUTES.workspaceMasterData(wsId);
    return null;
  };

  return (
    <PageShell title={t('activity.title', 'Activity')} description={t('activity.description', 'All workspace actions in one feed.')}>
      {activityQuery.isLoading ? <LoadingState label={t('activity.loading', 'Loading activity...')} /> : null}
      {activityQuery.isError ? <ErrorState message={t('activity.errorAction', 'We could not load activity. Try again.')} onRetry={() => activityQuery.refetch()} /> : null}

      {activityQuery.isSuccess ? (
        <div className="grid gap-[18px] md:grid-cols-3">
          <StatCard label={t('activity.title', 'Activity')} value={events.length} />
          <StatCard label={t('activity.feed', 'Feed items')} value={events.length} />
          <StatCard label={t('activity.scope', 'Workspace')} value={1} />
        </div>
      ) : null}

      {activityQuery.isSuccess && events.length === 0 ? (
        <EmptyState
          title={t('activity.emptyTitleAction', 'No activity yet')}
          description={t('activity.emptyDescriptionAction', 'Create the first product, add the first container, or invite the first member to start generating activity.')}
          icon={<ActivityIcon className="h-5 w-5" />}
        />
      ) : activityQuery.isSuccess ? (
        <div className="component-stack">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="space-y-1 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">{eventLabel(event.eventType)}</CardTitle>
                <Tag>{event.sourceType}</Tag>
              </div>
              <CardDescription>
                  {event.actor.name} · {new Date(event.createdAt).toLocaleString()}
              </CardDescription>
              {event.metadata ? (
                <p className="text-xs text-muted-foreground">{Object.entries(event.metadata).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</p>
              ) : null}
              {sourceLink(event.sourceType, event.sourceId) ? <Link className="text-sm font-medium text-primary hover:underline" to={sourceLink(event.sourceType, event.sourceId)!}>{t('common.open', 'เปิดรายการ')}</Link> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
