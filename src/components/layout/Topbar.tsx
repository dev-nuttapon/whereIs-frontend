import { uiStore } from '@/stores/ui.store';
import { WorkspaceSwitcher } from '@/components/layout/WorkspaceSwitcher';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';
import { MenuIcon } from '@/components/ui/icons';

export function Topbar() {
  const setSidebarOpen = uiStore((state) => state.setSidebarOpen);

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

        <div className="min-w-0 flex-1 sm:max-w-sm lg:max-w-[20rem]">
          <WorkspaceSwitcher />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
