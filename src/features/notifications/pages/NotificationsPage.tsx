import { Link, useParams } from 'react-router-dom';
import { Popconfirm } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { BellIcon, MailIcon } from '@/components/ui/icons';
import { useI18n } from '@/hooks/useI18n';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/features/notifications/hooks/useNotifications';
import { ROUTES } from '@/constants/routes';

export function NotificationsPage() {
  const { wsId = '' } = useParams();
  const { t } = useI18n();
  const notificationsQuery = useNotifications(wsId);
  const notifications = notificationsQuery.data?.items ?? [];
  const markOne = useMarkNotificationRead(wsId);
  const markAll = useMarkAllNotificationsRead(wsId);
  const sourceLink = (type?: string | null, id?: string | null) => {
    if (!type || !id) return null;
    if (type === 'Product') return ROUTES.workspaceProductDetail(wsId, id);
    if (type === 'Asset') return ROUTES.workspaceAssetDetail(wsId, id);
    if (type === 'StockEntry') return ROUTES.workspaceStockDetail(wsId, id);
    if (type === 'BorrowOrder') return ROUTES.workspaceBorrowOrderDetail(wsId, id);
    return null;
  };
  const typeLabel = (type: string) => ({
    low_stock: 'Stock ต่ำ',
    expiring_soon: 'ใกล้หมดอายุ',
    expired: 'หมดอายุแล้ว',
    due_soon: 'ใกล้ครบกำหนด',
    overdue: 'เกินกำหนด',
    workspace_invite: 'คำเชิญเข้าร่วม workspace',
  }[type] ?? type);

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
          <Button className="w-full sm:w-auto" disabled={markAll.isPending || notifications.length === 0}>
            {t('notifications.markAllRead', 'Mark all read')}
          </Button>
        </Popconfirm>
      )}
    >
      {notificationsQuery.isLoading ? <LoadingState label={t('notifications.loading', 'Loading notifications...')} /> : null}
      {notificationsQuery.isError ? <ErrorState message={t('notifications.errorAction', 'We could not load notifications. Try again.')} onRetry={() => notificationsQuery.refetch()} /> : null}

      {notificationsQuery.isSuccess && notifications.length === 0 ? (
        <EmptyState
          title={t('notifications.emptyTitleAction', 'No notifications yet')}
          description={t('notifications.emptyDescriptionAction', 'Continue working in your workspace. Reminders and workflow alerts will appear here when action is needed.')}
          icon={<BellIcon className="h-5 w-5" />}
        />
      ) : notificationsQuery.isSuccess ? (
        <div className="component-stack">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="space-y-3 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="text-base">{notification.title}</CardTitle>
                    <CardDescription>{notification.message}</CardDescription>
                    <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      {notification.type === 'workspace_invite' ? <MailIcon className="h-3.5 w-3.5" /> : <BellIcon className="h-3.5 w-3.5" />}
                      {typeLabel(notification.type)}
                    </p>
                    {sourceLink(notification.sourceType, notification.sourceId) ? <Link className="text-sm font-medium text-primary hover:underline" to={sourceLink(notification.sourceType, notification.sourceId)!}>{t('common.open', 'เปิดรายการ')}</Link> : null}
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
      ) : null}
    </PageShell>
  );
}
