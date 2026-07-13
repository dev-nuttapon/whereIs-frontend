import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { Button } from '@/components/ui/button';
import { authStore } from '@/stores/auth.store';
import { workspaceStore } from '@/stores/workspace.store';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/hooks/useI18n';
import { LogoutIcon, MenuIcon, SettingsIcon, UserIcon } from '@/components/ui/icons';
import { useLogout } from '@/features/auth/hooks/useLogout';

export interface UserMenuProps {
  workspaceId?: string | null;
}

export function UserMenu({ workspaceId }: UserMenuProps) {
  const navigate = useNavigate();
  const { wsId } = useParams();
  const user = authStore((state) => state.user);
  const logoutMutation = useLogout();
  const { t } = useI18n();
  const activeWorkspaceId = workspaceId ?? wsId ?? workspaceStore.getState().currentWorkspaceId;
  const showWorkspaceLinks = Boolean(activeWorkspaceId);

  const items = useMemo<MenuProps['items']>(() => {
    const next: NonNullable<MenuProps['items']> = [
      {
        key: 'user',
        disabled: true,
        label: (
          <div className="space-y-0.5">
            <div className="truncate text-sm font-semibold text-foreground">{user?.name ?? 'Guest'}</div>
            <div className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</div>
          </div>
        ),
      },
      { type: 'divider' },
    ];

    if (showWorkspaceLinks) {
      next.push(
        { type: 'divider' },
        {
          key: 'profile',
          icon: <UserIcon className="h-4 w-4" />,
          label: t('nav.profile'),
        },
        {
          key: 'settings',
          icon: <SettingsIcon className="h-4 w-4" />,
          label: t('nav.settings'),
        },
      );
    }

    next.push(
      { type: 'divider' },
      {
        key: 'logout',
        danger: true,
        icon: <LogoutIcon className="h-4 w-4" />,
        label: t('common.logout'),
      },
    );

    return next;
  }, [showWorkspaceLinks, t, user?.email, user?.name]);

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{
        items,
        onClick: ({ key, keyPath }) => {
          if (key === 'profile' && activeWorkspaceId) {
            navigate(ROUTES.workspaceProfile(activeWorkspaceId));
            return;
          }

          if (key === 'settings' && activeWorkspaceId) {
            navigate(ROUTES.workspaceSettings(activeWorkspaceId));
            return;
          }

          if (key === 'logout') {
            logoutMutation.mutate();
          }
        },
      }}
      popupRender={(menu) => <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-lg backdrop-blur-xl">{menu}</div>}
    >
      <Button
        variant="outline"
        size="sm"
        className="h-10 w-10 rounded-full border-border/70 bg-card/80 shadow-none backdrop-blur transition-colors hover:bg-card"
        aria-label={t('common.menu')}
        title={t('common.menu')}
      >
        <MenuIcon className="h-4 w-4" />
      </Button>
    </Dropdown>
  );
}
