import { useParams } from 'react-router-dom';
import { PageShell } from '@/components/common/PageShell';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/common/StatCard';
import { ActivityIcon } from '@/components/ui/icons';
import { useI18n } from '@/hooks/useI18n';
import { useActivity } from '@/features/activity/hooks/useActivity';

export function ActivityPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t } = useI18n();
  const activityQuery = useActivity(wsId, { limit: 20 });
  const events = activityQuery.data?.items ?? [];

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
                <CardTitle className="text-base">{event.type}</CardTitle>
                <CardDescription>
                  {event.actor.name} · {event.itemId} · {new Date(event.createdAt).toLocaleString()}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
