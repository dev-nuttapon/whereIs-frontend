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
import {
  useMarkAllMyNotificationsRead,
  useMarkAllNotificationsRead,
  useMarkMyNotificationRead,
  useMarkNotificationRead,
  useMyNotifications,
  useNotifications,
} from '@/features/notifications/hooks/useNotifications';
import { ROUTES } from '@/constants/routes';

export interface NotificationsPageProps {
  global?: boolean;
}

export function NotificationsPage({ global = false }: NotificationsPageProps) {
  const { wsId = '' } = useParams();
  const { t } = useI18n();
  const workspaceNotificationsQuery = useNotifications(wsId, {}, !global);
  const globalNotificationsQuery = useMyNotifications({}, global);
  const notificationsQuery = global ? globalNotificationsQuery : workspaceNotificationsQuery;
  const notifications = notificationsQuery.data?.items ?? [];
  const markWorkspaceOne = useMarkNotificationRead(wsId);
  const markGlobalOne = useMarkMyNotificationRead();
  const markOne = global ? markGlobalOne : markWorkspaceOne;
  const markWorkspaceAll = useMarkAllNotificationsRead(wsId);
  const markGlobalAll = useMarkAllMyNotificationsRead();
  const markAll = global ? markGlobalAll : markWorkspaceAll;
  const sourceLink = (workspaceId: string, type?: string | null, id?: string | null) => {
    if (!type || !id) return null;
    if (type === 'Product') return ROUTES.workspaceProductDetail(workspaceId, id);
    if (type === 'Asset') return ROUTES.workspaceAssetDetail(workspaceId, id);
    if (type === 'StockEntry') return ROUTES.workspaceStockDetail(workspaceId, id);
    if (type === 'BorrowOrder') return ROUTES.workspaceBorrowOrderDetail(workspaceId, id);
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
      description={global ? 'การแจ้งเตือนจากทุก workspace ของคุณ' : t('notifications.description', 'Reminders, workflow alerts, and important dates.')}
      actions={(
        <Popconfirm
          title={t('notifications.markAllConfirmTitle', 'Mark all notifications as read?')}
          description={global ? 'การทำงานนี้จะล้างสถานะยังไม่อ่านของทุก workspace' : t('notifications.markAllConfirmDescription', 'This will clear the unread state for the current workspace.')}
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
                    {notification.type === 'workspace_invite' ? <Link className="text-sm font-medium text-primary hover:underline" to={ROUTES.invitationsInbox}>{t('members.myInvitations', 'ไปยังคำเชิญของฉัน')}</Link> : null}
                    {sourceLink(notification.workspaceId, notification.sourceType, notification.sourceId) ? <Link className="text-sm font-medium text-primary hover:underline" to={sourceLink(notification.workspaceId, notification.sourceType, notification.sourceId)!}>{t('common.open', 'เปิดรายการ')}</Link> : null}
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
