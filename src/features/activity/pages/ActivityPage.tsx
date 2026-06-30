import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useActivity } from '@/features/items/hooks/useItems';
import { useI18n } from '@/hooks/useI18n';
import { Badge } from '@/components/ui/badge';
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
        <div className="relative space-y-0">
          <div className="absolute left-[17px] top-3 bottom-3 w-px bg-border" />
          {query.data.map((event) => {
            const display = buildActivityDisplay(event, {
              events: query.data ?? [],
              items: MOCK_ITEMS,
              containers: MOCK_CONTAINERS,
              members: MOCK_MEMBERS,
              locale,
              t,
            });

            return (
              <div key={event.id} className="relative flex gap-3 py-3 pl-10">
                <div className={`absolute left-0 top-3 flex h-9 w-9 items-center justify-center rounded-full border ${activityToneClasses[display.tone]}`}>
                  <span className="text-sm leading-none">{display.glyph}</span>
                </div>
                <div className="min-w-0 flex-1 rounded-xl border border-border bg-card p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="font-medium">{event.actor.name}</p>
                      <Badge variant="outline" className={`text-[0.65rem] uppercase tracking-[0.18em] ${activityToneClasses[display.tone]}`}>
                        {display.eventLabel}
                      </Badge>
                      <span className="truncate text-xs text-muted-foreground">{display.itemName}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-muted-foreground">{display.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[0.7rem]">
                    {display.currentStateLabel ? (
                      <Badge variant="secondary" className="rounded-full px-2 py-0.5 font-medium">
                        {t('activity.current.status')}: {display.currentStateLabel}
                      </Badge>
                    ) : null}
                    {display.currentLocationLabel ? (
                      <Badge variant="outline" className="rounded-full px-2 py-0.5 font-medium">
                        {t('activity.current.location')}: {display.currentLocationLabel}
                      </Badge>
                    ) : null}
                    {display.currentReturnLabel ? (
                      <Badge variant="outline" className="rounded-full px-2 py-0.5 font-medium">
                        {t('activity.current.return')}: {display.currentReturnLabel}
                      </Badge>
                    ) : null}
                  </div>
                  {display.detail ? <p className="mt-1 text-xs text-muted-foreground">{display.detail}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </PageShell>
  );
}
