import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/forms/FormField';
import { FormActions } from '@/components/forms/FormActions';
import { createInviteMemberSchema, type InviteMemberValues } from '@/features/members/validation/inviteMemberSchema';
import { useInviteMember } from '@/features/members/hooks/useMembers';
import { useI18n } from '@/hooks/useI18n';

export interface InviteMemberDialogProps {
  wsId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({ wsId, open, onOpenChange }: InviteMemberDialogProps) {
  const inviteMutation = useInviteMember(wsId);
  const { t } = useI18n();
  const inviteMemberSchema = createInviteMemberSchema(t);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: 'new.member@example.com',
      role: 'member',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await inviteMutation.mutateAsync(values);
    reset();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('members.inviteTitle')}</DialogTitle>
          <DialogDescription>{t('members.inviteDescription')}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField label={t('members.inviteEmail')} htmlFor="member-email" error={errors.email?.message}>
            <Input id="member-email" type="email" autoComplete="email" {...register('email')} />
          </FormField>
          <FormField label={t('members.inviteRole')} htmlFor="member-role" error={errors.role?.message}>
            <Select id="member-role" {...register('role')}>
              <option value="admin">{t('members.role.admin')}</option>
              <option value="member">{t('members.role.member')}</option>
              <option value="viewer">{t('members.role.viewer')}</option>
            </Select>
          </FormField>
          <FormActions>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('members.inviteCancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || inviteMutation.isPending}>
              {isSubmitting || inviteMutation.isPending ? t('members.inviteSaving') : t('members.inviteAction')}
            </Button>
          </FormActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
