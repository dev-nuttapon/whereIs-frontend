import { Link, useParams } from 'react-router-dom';
import { uiStore } from '@/stores/ui.store';
import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher';
import { GlobalSearchBar } from '@/components/layout/GlobalSearchBar';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';
import { BellIcon, MenuIcon } from '@/components/ui/icons';
import { ROUTES } from '@/constants/routes';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useI18n } from '@/hooks/useI18n';

export function Topbar() {
  const setSidebarOpen = uiStore((state) => state.setSidebarOpen);
  const { wsId = '' } = useParams();
  const { t } = useI18n();
  const notificationsQuery = useNotifications(wsId);
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

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
          <Button
            asChild
            variant="outline"
            size="sm"
            className="relative h-10 w-10 rounded-full border-border/70 bg-background p-0 shadow-none"
          >
            <Link to={ROUTES.workspaceNotifications(wsId)} aria-label={t('notifications.title', 'Notifications')} title={t('notifications.title', 'Notifications')}>
              <BellIcon className="h-4 w-4 text-teal-700" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-[0.65rem] font-semibold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </Link>
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
