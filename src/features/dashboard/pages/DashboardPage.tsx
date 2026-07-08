import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Avatar, List, Space, Tag, Typography } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { queryKeys } from '@/lib/queryKeys';
import { getDashboardSummary } from '@/api/dashboard.api';
import { ROUTES } from '@/constants/routes';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useActivity } from '@/features/items/hooks/useItems';
import { useI18n } from '@/hooks/useI18n';
import { SearchIcon } from '@/components/ui/icons';
import { buildActivityDisplay } from '@/features/activity/lib/activityDisplay';
import { MOCK_CONTAINERS, MOCK_ITEMS, MOCK_MEMBERS } from '@/mocks/mock-data';

const activityToneClasses: Record<'blue' | 'emerald' | 'amber' | 'rose' | 'slate', string> = {
  blue: 'border-blue-500/20 bg-blue-500/10 text-blue-700',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  amber: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  rose: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  slate: 'border-slate-500/20 bg-slate-500/10 text-slate-700',
};

export function DashboardPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t, locale } = useI18n();
  const summaryQuery = useQuery({
    queryKey: queryKeys.dashboard(wsId),
    queryFn: () => getDashboardSummary(wsId),
  });
  const activityQuery = useActivity(wsId);
  const recentActivity = useMemo(() => activityQuery.data?.slice(0, 5) ?? [], [activityQuery.data]);
  const itemsLink = (params?: Record<string, string>) =>
    params ? `${ROUTES.workspaceItems(wsId)}?${new URLSearchParams(params).toString()}` : ROUTES.workspaceItems(wsId);
  const eventTime = (value: string) =>
    new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  return (
    <PageShell
      title={t('dashboard.title')}
      description={t('dashboard.description')}
      actions={
        <Button asChild>
          <Link to={ROUTES.workspaceSearch(wsId)}>
            <SearchIcon className="h-4 w-4" />
            {t('dashboard.search')}
          </Link>
        </Button>
      }
    >

      {summaryQuery.isLoading ? <LoadingState label={t('dashboard.loadingSummary')} /> : null}
      {summaryQuery.isError ? <ErrorState message={t('dashboard.summaryError')} onRetry={() => summaryQuery.refetch()} /> : null}
      {summaryQuery.data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t('dashboard.totalItems')} value={summaryQuery.data.totalItems} to={itemsLink()} />
          <StatCard label={t('dashboard.stored')} value={summaryQuery.data.stored} to={itemsLink({ status: 'stored' })} />
          <StatCard label={t('dashboard.takenOut')} value={summaryQuery.data.takenOut} to={itemsLink({ status: 'taken_out' })} />
          <StatCard label={t('dashboard.missing')} value={summaryQuery.data.missing} to={itemsLink({ status: 'missing' })} />
          <StatCard label={t('dashboard.lowStock')} value={summaryQuery.data.lowStock} to={itemsLink({ stock: 'low' })} />
          <StatCard label={t('dashboard.outOfStock')} value={summaryQuery.data.outOfStock} to={itemsLink({ stock: 'out' })} />
          <StatCard
            label={t('dashboard.returnableItems')}
            value={summaryQuery.data.returnableItems}
            to={itemsLink({ usageType: 'returnable' })}
          />
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">{t('dashboard.recentActivity')}</CardTitle>
            <CardDescription>{t('dashboard.recentDescription')}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to={ROUTES.workspaceActivity(wsId)}>{t('dashboard.viewAll')}</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {activityQuery.isLoading ? <LoadingState label={t('dashboard.loadingActivity')} /> : null}
          {activityQuery.isError ? <ErrorState message={t('dashboard.activityError')} onRetry={() => activityQuery.refetch()} /> : null}
          {recentActivity.length > 0 ? (
            <List
              dataSource={recentActivity}
              renderItem={(event) => {
                const display = buildActivityDisplay(event, {
                  events: activityQuery.data ?? [],
                  items: MOCK_ITEMS,
                  containers: MOCK_CONTAINERS,
                  members: MOCK_MEMBERS,
                  locale,
                  t,
                });

                return (
                  <List.Item className="!px-0">
                    <List.Item.Meta
                      avatar={<Avatar className={`${activityToneClasses[display.tone]}`}>{display.glyph}</Avatar>}
                      title={
                        <Space size={8} wrap>
                          <Typography.Text strong>{event.actor.name}</Typography.Text>
                          <Tag className={`uppercase tracking-[0.18em] ${activityToneClasses[display.tone]}`}>{display.eventLabel}</Tag>
                          <Typography.Text type="secondary" className="truncate text-xs">
                            {display.itemName}
                          </Typography.Text>
                        </Space>
                      }
                      description={
                        <div className="space-y-2">
                          <Typography.Paragraph className="!mb-0 text-sm text-muted-foreground">
                            {display.summary}
                          </Typography.Paragraph>
                          <div className="flex flex-wrap gap-2 text-[0.7rem]">
                            {display.currentStateLabel ? <Tag>{t('activity.current.status')}: {display.currentStateLabel}</Tag> : null}
                            {display.currentLocationLabel ? <Tag>{t('activity.current.location')}: {display.currentLocationLabel}</Tag> : null}
                            {display.currentReturnLabel ? <Tag>{t('activity.current.return')}: {display.currentReturnLabel}</Tag> : null}
                          </div>
                          {display.detail ? <Typography.Text type="secondary" className="text-xs">{display.detail}</Typography.Text> : null}
                        </div>
                      }
                    />
                    <Typography.Text type="secondary" className="shrink-0 text-xs">
                      {eventTime(event.createdAt)}
                    </Typography.Text>
                  </List.Item>
                );
              }}
            />
          ) : (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
              {t('dashboard.recentEmpty')}
            </p>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
