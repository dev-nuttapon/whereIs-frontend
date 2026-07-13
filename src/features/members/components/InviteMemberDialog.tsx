import { useEffect, useState } from 'react';
import { Alert, Avatar, Typography } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/forms/FormField';
import { createInviteMemberSchema, type InviteMemberValues } from '@/features/members/validation/inviteMemberSchema';
import { useInviteMember, useLookupUserByEmail } from '@/features/members/hooks/useMembers';
import { useI18n } from '@/hooks/useI18n';
import { MailIcon, SearchIcon, UserIcon } from '@/components/ui/icons';
import type { UserLookupDto } from '@/api/member.api';

export interface InviteMemberDialogProps {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({ wsId, open, onOpenChange }: InviteMemberDialogProps) {
  const inviteMutation = useInviteMember(wsId);
  const lookupMutation = useLookupUserByEmail();
  const { t } = useI18n();
  const inviteMemberSchema = createInviteMemberSchema(t);
  const [foundUser, setFoundUser] = useState<UserLookupDto | null>(null);
  const [lookupEmail, setLookupEmail] = useState('');
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
  const lookupMatchesInput = Boolean(foundUser && lookupEmail === email);
  const foundUserInitial = foundUser?.displayName?.slice(0, 1).toUpperCase() ?? foundUser?.email.slice(0, 1).toUpperCase() ?? 'U';

  useEffect(() => {
    if (lookupEmail && lookupEmail !== email) {
      setFoundUser(null);
      lookupMutation.reset();
    }
  }, [email, lookupEmail, lookupMutation]);

  const handleLookup = async () => {
    setFoundUser(null);
    const user = await lookupMutation.mutateAsync(email);
    setFoundUser(user);
    setLookupEmail(email);
  };

  const resetDialog = () => {
    reset();
    setFoundUser(null);
    setLookupEmail('');
    lookupMutation.reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialog();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!lookupMatchesInput) {
      return;
    }
    await inviteMutation.mutateAsync(values);
    resetDialog();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[34rem] p-0">
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
                <Typography.Text strong>{t('members.lookupTitle', 'ค้นหาผู้ใช้ในระบบ')}</Typography.Text>
              </div>
              <FormField label={t('members.inviteEmail')} htmlFor="member-email" error={errors.email?.message}>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
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
                        placeholder={t('members.inviteEmailPlaceholder', 'กรอกอีเมลสมาชิก')}
                        prefix={<MailIcon className="h-4 w-4 text-muted-foreground" />}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={!email || lookupMutation.isPending}
                    onClick={handleLookup}
                  >
                    <SearchIcon className="h-4 w-4" />
                    {lookupMutation.isPending ? t('members.lookupSearching', 'กำลังค้นหา...') : t('members.lookupAction', 'ค้นหา')}
                  </Button>
                </div>
              </FormField>
              {lookupMutation.isError ? (
                <Alert
                  className="mt-3"
                  type="error"
                  showIcon
                  message={t('members.lookupNotFound', 'ไม่พบผู้ใช้อีเมลนี้ในระบบ')}
                  description={t('members.lookupNotFoundDescription', 'ให้ผู้ใช้สมัครสมาชิกหรือเข้าสู่ระบบก่อน แล้วค่อยเชิญเข้าร่วม workspace')}
                />
              ) : null}
            </section>

            <section className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">2</span>
                <Typography.Text strong>{t('members.confirmUserTitle', 'ยืนยันผู้รับคำเชิญ')}</Typography.Text>
              </div>
              {lookupMatchesInput && foundUser ? (
                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <Avatar className="bg-primary text-primary-foreground">{foundUserInitial}</Avatar>
                  <div className="min-w-0">
                    <Typography.Text strong className="block truncate">
                      {foundUser.displayName}
                    </Typography.Text>
                    <Typography.Text className="block truncate text-sm text-muted-foreground">
                      {foundUser.email}
                    </Typography.Text>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-background/60 p-3 text-muted-foreground">
                  <UserIcon className="h-5 w-5" />
                  <Typography.Text className="text-sm text-muted-foreground">
                    {t('members.lookupRequired', 'ค้นหาอีเมลก่อน เพื่อยืนยันว่าผู้ใช้นี้มีอยู่จริง')}
                  </Typography.Text>
                </div>
              )}
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
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border/70 bg-muted/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => handleOpenChange(false)}>
              {t('members.inviteCancel')}
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting || inviteMutation.isPending || !lookupMatchesInput}
            >
              {isSubmitting || inviteMutation.isPending ? t('members.inviteSaving') : t('members.inviteAction')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
