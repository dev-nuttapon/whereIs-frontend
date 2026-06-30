import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { uiStore } from '@/stores/ui.store';
import { authStore } from '@/stores/auth.store';
import { workspaceStore } from '@/stores/workspace.store';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { LogoutIcon, MenuIcon, SettingsIcon, UserIcon } from '@/components/ui/icons';

export function UserMenu() {
  const navigate = useNavigate();
  const { wsId = workspaceStore.getState().currentWorkspaceId ?? 'ws-warehouse' } = useParams();
  const user = authStore((state) => state.user);
  const logout = authStore((state) => state.logout);
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={menuRef} className="relative flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-10 w-10 rounded-full bg-card/80 shadow-none backdrop-blur"
        onClick={() => setOpen((state) => !state)}
        aria-label={t('common.menu')}
        title={t('common.menu')}
      >
        <MenuIcon className="h-4 w-4" />
      </Button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-[0_20px_45px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="border-b border-border/70 px-3 py-3">
            <p className="truncate text-sm font-medium">{user?.name ?? 'Guest'}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</p>
          </div>
          <div className="p-2">
            <Link
              to={ROUTES.workspaceProfile(wsId)}
              onClick={() => setOpen(false)}
              className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <UserIcon className="h-4 w-4" />
              {t('nav.profile')}
            </Link>
            <Link
              to={ROUTES.workspaceSettings(wsId)}
              onClick={() => setOpen(false)}
              className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <SettingsIcon className="h-4 w-4" />
              {t('nav.settings')}
            </Link>
            <Button
              className="h-10 w-full justify-start rounded-lg px-3 font-normal"
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                navigate(ROUTES.login);
              }}
            >
              <LogoutIcon className="h-4 w-4" />
              {t('common.logout')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
