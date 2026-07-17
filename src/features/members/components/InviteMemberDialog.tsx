import { useEffect, useState } from 'react';
import { Alert, Typography } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/forms/FormField';
import { createInviteMemberSchema, type InviteMemberValues } from '@/features/members/validation/inviteMemberSchema';
import { useInviteMember } from '@/features/members/hooks/useMembers';
import { useWorkspaces } from '@/features/workspaces/hooks/useWorkspaces';
import { useContainers } from '@/features/containers/hooks/useContainers';
import { usePermissionsCatalog } from '@/features/permissions/hooks/usePermissions';
import { useI18n } from '@/hooks/useI18n';
import { usePermission } from '@/hooks/usePermission';
import { MailIcon } from '@/components/ui/icons';
import type { PermissionKey } from '@/types/permission.types';

interface InviteScopeState {
  restricted: boolean;
  selectedContainerIds: string[];
  includeDescendants: boolean;
}

export interface InviteMemberDialogProps {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({ wsId, open, onOpenChange }: InviteMemberDialogProps) {
  const inviteMutation = useInviteMember(wsId);
  const workspacesQuery = useWorkspaces();
  const permissionsCatalogQuery = usePermissionsCatalog();
  const { can } = usePermission();
  const { t } = useI18n();
  const inviteMemberSchema = createInviteMemberSchema(t);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(wsId);
  const [containerSearch, setContainerSearch] = useState('');
  const [permissionOverrides, setPermissionOverrides] = useState<Partial<Record<PermissionKey, boolean>>>({});
  const [scope, setScope] = useState<InviteScopeState>({
    restricted: false,
    selectedContainerIds: [],
    includeDescendants: true,
  });
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });
  const email = watch('email').trim().toLowerCase();
  const availableWorkspaces = workspacesQuery.data ?? [];
  const selectedWorkspace = availableWorkspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? availableWorkspaces[0] ?? null;
  const canManageOverrides = selectedWorkspaceId === wsId && can('permission.override');
  const containersQuery = useContainers(selectedWorkspaceId);
  const containers = containersQuery.data ?? [];
  const filteredContainers = containers.filter((container) => {
    const term = containerSearch.trim().toLowerCase();
    if (!term) {
      return true;
    }
    return [container.name, container.typeLabel, container.code ?? '']
      .join(' ')
      .toLowerCase()
      .includes(term);
  });
  const hasInvalidScope = Boolean(scope.restricted && scope.selectedContainerIds.length === 0);

  useEffect(() => {
    if (open) {
      setSelectedWorkspaceId(wsId);
      setScope({
        restricted: false,
        selectedContainerIds: [],
        includeDescendants: true,
      });
      setContainerSearch('');
    }
  }, [open, wsId]);

  const resetDialog = () => {
    reset();
    setSelectedWorkspaceId(wsId);
    setContainerSearch('');
    setPermissionOverrides({});
    setScope({
      restricted: false,
      selectedContainerIds: [],
      includeDescendants: true,
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialog();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    await inviteMutation.mutateAsync({
      ...values,
      workspaceId: selectedWorkspaceId,
      containerAccessScope: scope.restricted && scope.selectedContainerIds.length > 0
        ? {
          containerIds: scope.selectedContainerIds,
          includeDescendants: scope.includeDescendants,
        }
        : null,
      permissionOverrides: canManageOverrides ? permissionOverrides : undefined,
    });
    resetDialog();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[42rem] p-0">
        <DialogHeader className="mb-0 border-b border-border/70 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MailIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <DialogTitle>{t('members.inviteTitle')}</DialogTitle>
              <DialogDescription>{t('members.inviteDescription')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="component-stack px-5 py-5 sm:px-6">
            <section className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">1</span>
                <Typography.Text strong>{t('members.inviteEmail', 'Email')}</Typography.Text>
              </div>
              <FormField label={t('members.inviteEmail')} htmlFor="member-email" error={errors.email?.message}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="member-email"
                      name={field.name}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(event) => field.onChange(event.target.value)}
                      type="email"
                      autoComplete="email"
                      placeholder={t('members.inviteEmailPlaceholder', 'name@example.com')}
                      prefix={<MailIcon className="h-4 w-4 text-muted-foreground" />}
                    />
                  )}
                />
              </FormField>
              <Typography.Text className="mt-2 block text-sm text-muted-foreground">
                {t('members.inviteEmailHelp', 'Send an invitation directly to any valid email address. The recipient can accept it from their invitation inbox.')}
              </Typography.Text>
            </section>

            <section className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">2</span>
                <Typography.Text strong>{t('members.visibilitySetupTitle', 'กำหนด workspace และ container ที่มองเห็น')}</Typography.Text>
              </div>
              <div className="space-y-3">
                {workspacesQuery.isLoading ? (
                  <p className="rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                    {t('common.loadingWorkspaces')}
                  </p>
                ) : null}
                <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
                  <div className="space-y-1">
                    <Typography.Text strong>{t('members.visibilityWorkspaceLabel', 'Workspace')}</Typography.Text>
                    <Typography.Paragraph className="!mb-0 text-sm text-muted-foreground">
                      {t('members.visibilityWorkspaceHelp', 'เลือก workspace ที่จะกำหนดสิทธิ์ให้คำเชิญนี้')}
                    </Typography.Paragraph>
                  </div>
                  <Select
                    className="w-full"
                    value={selectedWorkspaceId}
                    onChange={(event) => {
                      setSelectedWorkspaceId(event.target.value);
                      setScope({
                        restricted: false,
                        selectedContainerIds: [],
                        includeDescendants: true,
                      });
                      setPermissionOverrides({});
                      setContainerSearch('');
                    }}
                  >
                    {availableWorkspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </Select>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border/70 bg-background px-2 py-1">
                      {selectedWorkspace ? selectedWorkspace.name : selectedWorkspaceId}
                    </span>
                    <span className="rounded-full border border-border/70 bg-background px-2 py-1">
                      {selectedWorkspace?.id === wsId ? t('members.visibilityCurrentWorkspace', 'workspace ปัจจุบัน') : t('workspace.card.role') + ': ' + (selectedWorkspace?.myRole ?? '-')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Typography.Text strong className="block">
                        {scope.restricted
                          ? t('members.visibilityRestrictedSummary', 'เห็นเฉพาะ container ที่เลือก')
                          : t('members.visibilityAllContainers', 'เห็นทุก container ใน workspace นี้')}
                      </Typography.Text>
                      <Typography.Text className="block text-sm text-muted-foreground">
                        {t('members.visibilityContainerHelp', 'ค้นหาแล้วติ๊กเฉพาะ container ที่ต้องการ หรือปล่อยไว้เพื่อเห็นทั้งหมด')}
                      </Typography.Text>
                    </div>
                    <Select
                      className="w-full sm:w-56"
                      value={scope.restricted ? 'restricted' : 'all'}
                      onChange={(event) => setScope((current) => ({
                        ...current,
                        restricted: event.target.value === 'restricted',
                        selectedContainerIds: event.target.value === 'restricted' ? current.selectedContainerIds : [],
                      }))}
                    >
                      <option value="all">{t('members.visibilityAllContainers', 'เห็นทุก container')}</option>
                      <option value="restricted">{t('members.visibilitySelectedContainers', 'เลือกเฉพาะ container')}</option>
                    </Select>
                  </div>
                  {scope.restricted ? (
                    <div className="space-y-3">
                      <Input
                        value={containerSearch}
                        onChange={(event) => setContainerSearch(event.target.value)}
                        placeholder={t('members.visibilityContainerSearch', 'ค้นหา container')}
                      />
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Checkbox
                          checked={scope.includeDescendants}
                          onChange={(event) => setScope((current) => ({
                            ...current,
                            includeDescendants: event.target.checked,
                          }))}
                        />
                        {t('permissions.scope.includeDescendants', 'รวม container ลูกทั้งหมด')}
                      </label>
                      <p className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm text-muted-foreground">
                        {t('permissions.scope.selectedCount', 'เลือกแล้ว {count} container', { count: scope.selectedContainerIds.length })}
                      </p>
                      {containersQuery.isLoading ? (
                        <p className="rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                          {t('common.loading')}
                        </p>
                      ) : filteredContainers.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                          {t('members.visibilityNoContainers', 'ไม่พบ container ที่ตรงกับคำค้น')}
                        </p>
                      ) : (
                        <div className="max-h-72 space-y-2 overflow-auto pr-1">
                          {filteredContainers.map((container) => (
                            <label key={container.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background/70 px-3 py-2 text-sm transition-colors hover:bg-background">
                              <Checkbox
                                checked={scope.selectedContainerIds.includes(container.id)}
                                onChange={() => setScope((current) => ({
                                  ...current,
                                  selectedContainerIds: current.selectedContainerIds.includes(container.id)
                                    ? current.selectedContainerIds.filter((id) => id !== container.id)
                                    : [...current.selectedContainerIds, container.id],
                                }))}
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
                {hasInvalidScope ? (
                  <Alert
                    type="warning"
                    showIcon
                    message={t('members.visibilityInvalidScope', 'เลือก container อย่างน้อย 1 รายการใน workspace ที่จำกัดการมองเห็น')}
                  />
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">3</span>
                <Typography.Text strong>{t('members.roleSetupTitle', 'กำหนดบทบาทเริ่มต้น')}</Typography.Text>
              </div>
              <FormField label={t('members.inviteRole')} htmlFor="member-role" error={errors.role?.message}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="member-role"
                      className="w-full"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                    >
                      <option value="admin">{t('members.role.admin')}</option>
                      <option value="member">{t('members.role.member')}</option>
                      <option value="viewer">{t('members.role.viewer')}</option>
                    </Select>
                  )}
                />
              </FormField>
            </section>

            {canManageOverrides ? (
              <section className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">4</span>
                  <Typography.Text strong>{t('members.specialPermissions', 'Special permissions')}</Typography.Text>
                </div>
                <Typography.Text className="mb-3 block text-sm text-muted-foreground">
                  {t('members.specialPermissionsHelp', 'Grant extra permissions in this workspace only. Role permissions remain the default.')}
                </Typography.Text>
                {permissionsCatalogQuery.isLoading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> : null}
                <div className="grid gap-2 sm:grid-cols-2">
                  {(permissionsCatalogQuery.data ?? []).map((permission) => {
                    const key = permission.code as PermissionKey;
                    return (
                      <label key={permission.id} className="flex items-start gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm">
                        <Checkbox
                          checked={Boolean(permissionOverrides[key])}
                          onChange={(event) => setPermissionOverrides((current) => ({
                            ...current,
                            [key]: event.target.checked,
                          }))}
                        />
                        <span className="min-w-0">
                          <span className="block font-medium">{permission.name}</span>
                          <span className="block text-xs text-muted-foreground">{permission.code}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border/70 bg-muted/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => handleOpenChange(false)}>
              {t('members.inviteCancel')}
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting || inviteMutation.isPending || !email || !selectedWorkspaceId || hasInvalidScope}
            >
              {isSubmitting || inviteMutation.isPending ? t('members.inviteSaving') : t('members.inviteAction')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
