import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';
import { uiStore } from '@/stores/ui.store';
import { MenuIcon } from '@/components/ui/icons';
import { useI18n } from '@/hooks/useI18n';

export function Topbar() {
  const toggleSidebar = uiStore((state) => state.toggleSidebar);
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 px-3 py-3 backdrop-blur-xl sm:px-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" className="h-10 w-10 rounded-full border-border/70 bg-card/70 shadow-none lg:hidden" onClick={toggleSidebar} aria-label={t('common.menu')}>
          <MenuIcon className="h-4 w-4" />
        </Button>

        <div className="min-w-[14rem] flex-1 lg:max-w-[18rem]">
          <WorkspaceSwitcher />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
