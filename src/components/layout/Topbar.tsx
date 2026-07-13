import { Link, useParams } from 'react-router-dom';
import { Badge as AntBadge } from 'antd';
import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher';
import { GlobalSearchBar } from '@/components/layout/GlobalSearchBar';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';
import { uiStore } from '@/stores/ui.store';
import { MenuIcon, BellIcon, ClipboardCheckIcon } from '@/components/ui/icons';
import { useI18n } from '@/hooks/useI18n';
import { ROUTES } from '@/constants/routes';

export function Topbar() {
  const toggleSidebar = uiStore((state) => state.toggleSidebar);
  const { t } = useI18n();
  const { wsId } = useParams();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 px-3 py-3 backdrop-blur-xl sm:px-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" className="h-10 w-10 rounded-full border-border/70 bg-card/70 shadow-none lg:hidden" onClick={toggleSidebar} aria-label={t('common.menu')}>
          <MenuIcon className="h-4 w-4" />
        </Button>

        <div className="min-w-[14rem] flex-1 lg:max-w-[18rem]">
          <WorkspaceSwitcher />
        </div>

        <div className="hidden min-w-0 flex-[2] lg:block">
          <GlobalSearchBar />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {wsId ? (
            <Button
              size="sm"
              className="h-10 rounded-full border-border/70 bg-card/80 px-4 shadow-none"
              asChild
            >
              <Link to={ROUTES.workspaceMembers(wsId)}>
                <ClipboardCheckIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.approvals')}</span>
              </Link>
            </Button>
          ) : null}
          {wsId ? (
            <Button
              size="sm"
              className="h-10 rounded-full border-border/70 bg-card/80 px-4 shadow-none"
              asChild
            >
              <Link to={ROUTES.workspaceNotifications(wsId)}>
                <AntBadge dot offset={[-2, 2]}>
                  <BellIcon className="h-4 w-4" />
                </AntBadge>
                <span className="hidden sm:inline">{t('nav.notifications')}</span>
              </Link>
            </Button>
          ) : null}
          <UserMenu />
        </div>
      </div>

      <div className="mt-3 flex gap-2 lg:hidden">
        <GlobalSearchBar />
      </div>
    </header>
  );
}
