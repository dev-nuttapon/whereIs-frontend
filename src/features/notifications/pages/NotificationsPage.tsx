import { useParams } from 'react-router-dom';
import { Popconfirm } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { BellIcon } from '@/components/ui/icons';
import { useI18n } from '@/hooks/useI18n';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/features/notifications/hooks/useNotifications';

export function NotificationsPage() {
  const { wsId = 'ws-warehouse' } = useParams();
  const { t } = useI18n();
  const notificationsQuery = useNotifications(wsId);
  const notifications = notificationsQuery.data?.items ?? [];
  const markOne = useMarkNotificationRead(wsId);
  const markAll = useMarkAllNotificationsRead(wsId);

  return (
    <PageShell
      title={t('notifications.title', 'Notifications')}
      description={t('notifications.description', 'Reminders, workflow alerts, and important dates.')}
      actions={(
        <Popconfirm
          title={t('notifications.markAllConfirmTitle', 'Mark all notifications as read?')}
          description={t('notifications.markAllConfirmDescription', 'This will clear the unread state for the current workspace.')}
          okText={t('common.confirm', 'Confirm')}
          cancelText={t('common.cancel', 'Cancel')}
          onConfirm={() => markAll.mutate()}
        >
          <Button disabled={markAll.isPending || notifications.length === 0}>
            {t('notifications.markAllRead', 'Mark all read')}
          </Button>
        </Popconfirm>
      )}
    >
      {notificationsQuery.isLoading ? <LoadingState label={t('notifications.loading', 'Loading notifications...')} /> : null}
      {notificationsQuery.isError ? <ErrorState message={t('notifications.error', 'Notifications failed to load.')} onRetry={() => notificationsQuery.refetch()} /> : null}

      {notifications.length === 0 ? (
        <EmptyState
          title={t('notifications.emptyTitle', 'ยังไม่มีการแจ้งเตือน')}
          description={t('notifications.emptyDescription', 'ระบบจะแสดง reminder และ workflow alerts ที่ยังไม่ถูกอ่าน')}
          icon={<BellIcon className="h-5 w-5" />}
        />
      ) : (
        <div className="component-stack">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="space-y-3 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="text-base">{notification.title}</CardTitle>
                    <CardDescription>{notification.message}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markOne.mutate(notification.id)}
                    disabled={markOne.isPending || Boolean(notification.readAt)}
                  >
                    {notification.readAt ? t('notifications.read', 'Read') : t('notifications.markRead', 'Mark read')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
