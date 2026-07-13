import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { PageShell } from '@/components/common/PageShell';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/api/notification.api';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { BellIcon } from '@/components/ui/icons';

function formatDateTime(locale: 'en' | 'th', value: string) {
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function NotificationsPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications(wsId),
    queryFn: () => getNotifications(wsId),
    enabled: Boolean(wsId),
  });
  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications(wsId) }),
  });
  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(wsId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications(wsId) }),
  });
  const unreadCount = notificationsQuery.data?.filter((notification) => !notification.readAt).length ?? 0;

  return (
    <PageShell
      title={t('nav.notifications')}
      description={t('notifications.description', 'Workspace alerts and reminders.')}
      actions={
        unreadCount > 0 ? (
          <Button variant="outline" onClick={() => markAllReadMutation.mutate()} disabled={markAllReadMutation.isPending}>
            {t('notifications.markAllRead', 'Mark all read')}
          </Button>
        ) : undefined
      }
    >
      {notificationsQuery.isLoading ? <LoadingState label={t('common.loading')} /> : null}
      {notificationsQuery.isError ? <ErrorState message={t('notifications.error', 'Unable to load notifications.')} onRetry={() => notificationsQuery.refetch()} /> : null}
      {notificationsQuery.data?.length === 0 ? (
        <EmptyState
          title={t('notifications.emptyTitle', 'No notifications')}
          description={t('notifications.emptyDescription', 'New reminders and alerts will appear here.')}
          icon={<BellIcon className="h-5 w-5" />}
        />
      ) : null}
      {notificationsQuery.data && notificationsQuery.data.length > 0 ? (
        <div className="space-y-3">
          {notificationsQuery.data.map((notification) => (
            <Card key={notification.id} className={!notification.readAt ? 'border-primary/40' : undefined}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{notification.title}</CardTitle>
                  <CardDescription>{notification.message}</CardDescription>
                  <p className="text-xs text-muted-foreground">{formatDateTime(locale, notification.createdAt)}</p>
                </div>
                {!notification.readAt ? (
                  <Button variant="outline" size="sm" onClick={() => markReadMutation.mutate(notification.id)} disabled={markReadMutation.isPending}>
                    {t('notifications.markRead', 'Mark read')}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}
