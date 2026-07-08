import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher';
import { GlobalSearchBar } from '@/components/layout/GlobalSearchBar';
import { UserMenu } from '@/components/layout/UserMenu';
import { uiStore } from '@/stores/ui.store';
import { MenuIcon } from '@/components/ui/icons';
import { useI18n } from '@/hooks/useI18n';
import { Button } from 'antd';

export function Topbar() {
  const toggleSidebar = uiStore((state) => state.toggleSidebar);
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 px-3 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 sm:px-4">
      <div className="flex w-full items-center gap-3">
        <Button size="small" className="h-10 w-10 rounded-full border-border/70 bg-card/70 shadow-none lg:hidden" onClick={toggleSidebar} aria-label={t('common.menu')}>
          <MenuIcon className="h-4 w-4" />
        </Button>
        <div className="hidden w-[21rem] shrink-0 lg:block">
          <WorkspaceSwitcher />
        </div>
        <div className="hidden min-w-0 flex-1 lg:block">
          <GlobalSearchBar />
        </div>
        <div className="ml-auto shrink-0">
          <UserMenu />
        </div>
      </div>
      <div className="mt-3 w-full lg:hidden">
        <GlobalSearchBar />
      </div>
    </header>
  );
}
