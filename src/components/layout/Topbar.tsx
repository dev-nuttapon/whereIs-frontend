import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher';
import { GlobalSearchBar } from '@/components/layout/GlobalSearchBar';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';
import { uiStore } from '@/stores/ui.store';
import { MenuIcon } from '@/components/ui/icons';
import { useI18n } from '@/hooks/useI18n';

export function Topbar() {
  const toggleSidebar = uiStore((state) => state.toggleSidebar);
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background px-3 py-3 sm:px-4">
      <div className="flex w-full items-center gap-3">
        <Button variant="outline" size="sm" className="h-10 w-10 rounded-lg lg:hidden" onClick={toggleSidebar} aria-label={t('common.menu')}>
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
