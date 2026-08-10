import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'antd';
import { uiStore } from '@/stores/ui.store';
import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher';
import { GlobalSearchBar } from '@/components/layout/GlobalSearchBar';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';
import { BellIcon, MailIcon, MenuIcon } from '@/components/ui/icons';
import { ROUTES } from '@/constants/routes';
import { useMarkAllMyNotificationsRead, useMarkMyNotificationRead, useMyNotifications } from '@/features/notifications/hooks/useNotifications';
import { useI18n } from '@/hooks/useI18n';
import type { Notification } from '@/types/domain.types';

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function notificationTypeLabel(type: string, t: ReturnType<typeof useI18n>['t']) {
  return ({
    low_stock: 'Stock ต่ำ',
    expiring_soon: 'ใกล้หมดอายุ',
    expired: 'หมดอายุแล้ว',
    due_soon: 'ใกล้ครบกำหนด',
    overdue: 'เกินกำหนด',
    workspace_invite: t('notifications.workspaceInvite', 'คำเชิญเข้าร่วม workspace'),
  } as Record<string, string>)[type] ?? type;
}

export function Topbar() {
  const setSidebarOpen = uiStore((state) => state.setSidebarOpen);
  const navigate = useNavigate();
  const { t } = useI18n();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsQuery = useMyNotifications({ limit: 20 });
  const markOne = useMarkMyNotificationRead();
  const markAll = useMarkAllMyNotificationsRead();
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
  const notifications = notificationsQuery.data?.items ?? [];

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      await markOne.mutateAsync(notification.id);
    }

    setNotificationsOpen(false);
    if (notification.type === 'workspace_invite') {
      navigate(ROUTES.invitationsInbox);
      return;
    }

    navigate(ROUTES.workspaceNotifications(notification.workspaceId));
  };

  const notificationDropdown = (
    <div className="w-[min(92vw,24rem)] overflow-hidden rounded-2xl border border-border/70 bg-background/95 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{t('notifications.title', 'การแจ้งเตือน')}</p>
          <p className="text-xs text-muted-foreground">{unreadCount > 0 ? `${unreadCount} รายการยังไม่อ่าน` : 'ไม่มีรายการใหม่'}</p>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          disabled={markAll.isPending || unreadCount === 0}
          onClick={() => markAll.mutate()}
        >
          {t('notifications.markAllRead', 'อ่านทั้งหมดแล้ว')}
        </button>
      </div>

      <div className="max-h-[min(70vh,28rem)] overflow-y-auto p-2">
        {notificationsQuery.isLoading ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t('notifications.loading', 'กำลังโหลดการแจ้งเตือน...')}</p>
        ) : notificationsQuery.isError ? (
          <p className="px-3 py-8 text-center text-sm text-destructive">{t('notifications.errorAction', 'โหลดการแจ้งเตือนไม่สำเร็จ')}</p>
        ) : notifications.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t('notifications.emptyTitleAction', 'ยังไม่มีการแจ้งเตือน')}</p>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className="flex w-full gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted/70"
                onClick={() => void handleNotificationClick(notification)}
                disabled={markOne.isPending}
              >
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notification.type === 'workspace_invite' ? 'bg-teal-50 text-teal-700' : 'bg-muted text-muted-foreground'}`}>
                  {notification.type === 'workspace_invite' ? <MailIcon className="h-4 w-4" /> : <BellIcon className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${notification.readAt ? 'font-medium text-foreground' : 'font-semibold text-foreground'}`}>
                    {notification.title}
                  </span>
                  <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">{notification.message}</span>
                  <span className="mt-1 block text-[0.68rem] text-muted-foreground/80">
                    {notificationTypeLabel(notification.type, t)} · {formatNotificationDate(notification.createdAt)}
                  </span>
                </span>
                {!notification.readAt ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-600" aria-label="ยังไม่อ่าน" /> : null}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border/60 px-4 py-2.5 text-right">
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline"
          onClick={() => {
            setNotificationsOpen(false);
            navigate(ROUTES.notifications);
          }}
        >
          {t('notifications.viewAll', 'ดูการแจ้งเตือนทั้งหมด')}
        </button>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 px-3 py-2.5 backdrop-blur-xl sm:px-5 lg:px-8">
      <div className="mx-auto flex min-h-14 w-full max-w-screen-xl items-center gap-3 rounded-2xl border border-border/70 bg-card/90 px-3 py-2 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.65)] sm:px-4">
        <div className="flex shrink-0 lg:hidden">
          <Button
            size="sm"
            className="h-10 w-10 rounded-full border-border/70 bg-background shadow-none"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-w-0 flex-1 sm:max-w-sm lg:max-w-[18rem]">
          <WorkspaceSwitcher />
        </div>

        <div className="min-w-0 flex-[1.5]">
          <GlobalSearchBar />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Dropdown
            open={notificationsOpen}
            onOpenChange={setNotificationsOpen}
            trigger={['click']}
            placement="bottomRight"
            popupRender={() => notificationDropdown}
          >
            <Button
              variant="outline"
              size="sm"
              className="relative h-10 w-10 rounded-full border-border/70 bg-background p-0 shadow-none"
              aria-label={t('notifications.title', 'Notifications')}
              title={t('notifications.title', 'Notifications')}
            >
              <BellIcon className="h-4 w-4 text-teal-700" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-[0.65rem] font-semibold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </Button>
          </Dropdown>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
