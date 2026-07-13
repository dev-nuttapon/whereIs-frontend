import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useMemberPermissions, useUpdatePermissions } from '@/features/permissions/hooks/usePermissions';
import { useI18n } from '@/hooks/useI18n';
import type { PermissionKey } from '@/types/permission.types';

const PERMISSION_GROUPS: Array<{ title: string; permissions: PermissionKey[] }> = [
  {
    title: 'permissions.group.items',
    permissions: [
      'item.view',
      'item.create',
      'item.update',
      'item.delete',
      'item.move',
      'item.borrow',
      'item.return',
      'item.withdraw',
      'item.reserve',
      'item.mark_missing',
      'item.mark_found',
      'item.repair',
      'item.dispose',
    ],
  },
  {
    title: 'permissions.group.workspace',
    permissions: ['workspace.view', 'workspace.update', 'workspace.delete'],
  },
  {
    title: 'permissions.group.members',
    permissions: ['member.view', 'member.invite', 'member.update_role', 'member.remove', 'permission.override'],
  },
  {
    title: 'permissions.group.structure',
    permissions: ['container.view', 'container.create', 'container.update', 'container.delete', 'container.visibility.manage', 'container.access.manage'],
  },
  {
    title: 'permissions.group.stock',
    permissions: ['stock.view', 'stock.consume', 'stock.restock', 'stock.count', 'stock.adjust'],
  },
  {
    title: 'permissions.group.reports',
    permissions: ['report.view', 'report.export'],
  },
  {
    title: 'permissions.group.notifications',
    permissions: ['notification.view', 'notification.manage'],
  },
  {
    title: 'permissions.group.activity',
    permissions: ['activity.view'],
  },
];

const permissionLabelKey = (permission: PermissionKey) => `permissions.label.${permission}`;

export interface PermissionMatrixProps {
  wsId: string;
  memberId: string;
}

export function PermissionMatrix({ wsId, memberId }: PermissionMatrixProps) {
  const permissionsQuery = useMemberPermissions(wsId, memberId);
  const updateMutation = useUpdatePermissions(wsId, memberId);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const { t } = useI18n();

  const effective = useMemo(() => permissionsQuery.data?.effective ?? [], [permissionsQuery.data?.effective]);

  useEffect(() => {
    if (permissionsQuery.data) {
      setOverrides(permissionsQuery.data.overrides);
    }
  }, [permissionsQuery.data]);

  const toggle = (key: PermissionKey) => {
    setOverrides((current) => {
      const next = { ...current, [key]: !current[key] };
      if (key === 'item.create' && next[key]) {
        next['item.view'] = true;
      }
      return next;
    });
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-1">
          <CardTitle className="text-lg">{t('permissions.title')}</CardTitle>
          <CardDescription>{t('permissions.description')}</CardDescription>
        </div>
        <div className="space-y-6">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t(group.title)}</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {group.permissions.map((permission) => (
                  <label key={permission} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">{t(permissionLabelKey(permission), permission)}</div>
                      <div className="text-xs text-muted-foreground">
                        {effective.includes(permission) ? t('permissions.enabled') : t('permissions.disabled')}
                      </div>
                    </div>
                    <Switch
                      checked={Boolean(overrides[permission])}
                      onChange={() => toggle(permission)}
                      disabled={permissionsQuery.data?.primaryRole === 'owner'}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => updateMutation.mutate(overrides)} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? t('permissions.saving') : t('permissions.saveChanges')}
          </Button>
          <Button variant="outline" onClick={() => setOverrides({})} disabled={updateMutation.isPending}>
            {t('permissions.resetDefault')}
          </Button>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={overrides['item.create'] ? true : false} disabled />
            {t('permissions.implication')}
          </label>
          {permissionsQuery.data?.primaryRole === 'owner' ? (
            <span className="text-sm text-muted-foreground">{t('permissions.ownerLocked')}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
