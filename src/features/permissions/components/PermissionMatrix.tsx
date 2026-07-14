import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useMemberPermissions, useUpdatePermissions } from '@/features/permissions/hooks/usePermissions';
import { useContainers } from '@/features/containers/hooks/useContainers';
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
    permissions: ['container.view', 'container.create', 'container.update', 'container.move', 'container.delete', 'container.visibility.manage', 'container.access.manage'],
  },
  {
    title: 'permissions.group.stock',
    permissions: ['stock.view', 'stock.consume', 'stock.restock', 'stock.count', 'stock.adjust'],
  },
  {
    title: 'permissions.group.roles',
    permissions: ['role.view', 'role.manage'],
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
  const containersQuery = useContainers(wsId);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [scopeEnabled, setScopeEnabled] = useState(false);
  const [selectedContainerIds, setSelectedContainerIds] = useState<string[]>([]);
  const [includeDescendants, setIncludeDescendants] = useState(true);
  const { t } = useI18n();

  const effective = useMemo(() => permissionsQuery.data?.effective ?? [], [permissionsQuery.data?.effective]);
  const containers = containersQuery.data ?? [];

  useEffect(() => {
    if (permissionsQuery.data) {
      setOverrides(permissionsQuery.data.overrides);
      setScopeEnabled(Boolean(permissionsQuery.data.containerAccessScope));
      setSelectedContainerIds(permissionsQuery.data.containerAccessScope?.containerIds ?? []);
      setIncludeDescendants(permissionsQuery.data.containerAccessScope?.includeDescendants ?? true);
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

  const toggleContainer = (containerId: string) => {
    setSelectedContainerIds((current) =>
      current.includes(containerId)
        ? current.filter((id) => id !== containerId)
        : [...current, containerId],
    );
  };

  const save = () => {
    updateMutation.mutate({
      overrides,
      containerAccessScope: scopeEnabled && selectedContainerIds.length > 0
        ? {
          containerIds: selectedContainerIds,
          includeDescendants,
        }
        : null,
    });
  };

  const resetDefaults = () => {
    setOverrides({});
    setScopeEnabled(false);
    setSelectedContainerIds([]);
    setIncludeDescendants(true);
  };

  return (
    <Card>
      <CardContent className="component-stack p-5 sm:p-6">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">{t('permissions.title')}</CardTitle>
          <CardDescription>{t('permissions.description')}</CardDescription>
        </div>
        <div className="component-stack">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t(group.title)}</h3>
              <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
                {group.permissions.map((permission) => (
                  <label key={permission} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
                    <div className="min-w-0 space-y-0.5">
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
        <div className="space-y-3 rounded-2xl border border-border/70 bg-background/60 p-4">
          <div className="space-y-1">
            <CardTitle className="text-base">{t('permissions.scope.title', 'Workspace / container access')}</CardTitle>
            <CardDescription>
              {t('permissions.scope.description', 'เลือกว่าจะให้สมาชิกเห็นและแก้ไขได้เฉพาะ container ไหนใน workspace นี้')}
            </CardDescription>
          </div>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox
              checked={scopeEnabled}
              onChange={(event) => setScopeEnabled(event.target.checked)}
            />
            <span>
              <span className="block font-medium">{t('permissions.scope.restrict', 'จำกัดให้เห็นเฉพาะ container ที่เลือก')}</span>
              <span className="block text-xs leading-5 text-muted-foreground">
                {t('permissions.scope.unrestricted', 'ถ้าปิดไว้ สมาชิกจะเห็น container ตามสิทธิ์ workspace ปกติ')}
              </span>
            </span>
          </label>
          {scopeEnabled ? (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={includeDescendants}
                  onChange={(event) => setIncludeDescendants(event.target.checked)}
                />
                {t('permissions.scope.includeDescendants', 'รวม container ลูกทั้งหมด')}
              </label>
              <p className="rounded-xl border border-border/70 bg-card px-3 py-2 text-sm text-muted-foreground">
                {t('permissions.scope.selectedCount', 'เลือกแล้ว {count} container', { count: selectedContainerIds.length })}
              </p>
              {containers.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                  {t('permissions.scope.emptyContainers', 'No containers available in this workspace.')}
                </p>
              ) : (
                <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
                  {containers.map((container) => (
                    <label key={container.id} className="flex items-start gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm">
                      <Checkbox
                        checked={selectedContainerIds.includes(container.id)}
                        onChange={() => toggleContainer(container.id)}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{container.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{container.typeLabel}</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <Button className="w-full sm:w-auto" onClick={save} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? t('permissions.saving') : t('permissions.saveChanges')}
          </Button>
          <Button className="w-full sm:w-auto" variant="outline" onClick={resetDefaults} disabled={updateMutation.isPending}>
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
