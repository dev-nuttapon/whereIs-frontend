import { useParams } from 'react-router-dom';
import { Tag, Timeline, Typography } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useActivity } from '@/features/items/hooks/useItems';
import { useI18n } from '@/hooks/useI18n';
import { MOCK_CONTAINERS, MOCK_ITEMS, MOCK_MEMBERS } from '@/mocks/mock-data';
import { buildActivityDisplay } from '@/features/activity/lib/activityDisplay';

const activityToneClasses: Record<'blue' | 'emerald' | 'amber' | 'rose' | 'slate', string> = {
  blue: 'border-blue-500/20 bg-blue-500/10 text-blue-700',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  amber: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  rose: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  slate: 'border-slate-500/20 bg-slate-500/10 text-slate-700',
};

export function ActivityPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const query = useActivity(wsId);
  const { t, locale } = useI18n();

  return (
    <PageShell title={t('activity.title')} description={t('activity.description')}>
      {query.isLoading ? <LoadingState label={t('activity.loading')} /> : null}
      {query.isError ? <ErrorState message={t('activity.error')} onRetry={() => query.refetch()} /> : null}
      {query.data ? (
        <Timeline
          items={query.data.map((event) => {
            const display = buildActivityDisplay(event, {
              events: query.data ?? [],
              items: MOCK_ITEMS,
              containers: MOCK_CONTAINERS,
              members: MOCK_MEMBERS,
              locale,
              t,
            });

            return {
              color: display.tone === 'emerald' ? 'green' : display.tone === 'amber' ? 'gold' : display.tone === 'rose' ? 'red' : 'blue',
              dot: <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm ${activityToneClasses[display.tone]}`}>{display.glyph}</span>,
              children: (
                <div className="space-y-2 rounded-2xl border border-border/70 bg-card/80 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Typography.Text strong>{event.actor.name}</Typography.Text>
                    <Tag className={`uppercase tracking-[0.18em] ${activityToneClasses[display.tone]}`}>{display.eventLabel}</Tag>
                    <Typography.Text type="secondary" className="truncate text-xs">
                      {display.itemName}
                    </Typography.Text>
                  </div>
                  <Typography.Paragraph className="!mb-0 text-muted-foreground">{display.summary}</Typography.Paragraph>
                  <div className="flex flex-wrap gap-2 text-[0.7rem]">
                    {display.currentStateLabel ? <Tag>{t('activity.current.status')}: {display.currentStateLabel}</Tag> : null}
                    {display.currentLocationLabel ? <Tag>{t('activity.current.location')}: {display.currentLocationLabel}</Tag> : null}
                    {display.currentReturnLabel ? <Tag>{t('activity.current.return')}: {display.currentReturnLabel}</Tag> : null}
                  </div>
                  {display.detail ? <Typography.Text type="secondary" className="text-xs">{display.detail}</Typography.Text> : null}
                </div>
              ),
            };
          })}
        />
      ) : null}
    </PageShell>
  );
}
