import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Avatar, Button, Card, Divider, Input, Typography } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { authStore } from '@/stores/auth.store';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { UserIcon } from '@/components/ui/icons';
import {
  createPasswordSchema,
  createProfileSchema,
  type PasswordValues,
  type ProfileValues,
} from '@/features/profile/validation/profileSchema';

export function ProfilePage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const user = authStore((state) => state.user);
  const password = authStore((state) => state.password);
  const updateUser = authStore((state) => state.updateUser);
  const updatePassword = authStore((state) => state.updatePassword);
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const schema = createProfileSchema(t);
  const passwordSchema = createPasswordSchema(t);

  const defaultValues = useMemo<ProfileValues>(
    () => ({
      name: user?.name ?? '',
      email: user?.email ?? '',
    }),
    [user?.email, user?.name],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (isDirty) {
      setSaved(false);
    }
  }, [isDirty]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting, isDirty: isPasswordDirty },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (isPasswordDirty) {
      setPasswordSaved(false);
      setPasswordError(null);
    }
  }, [isPasswordDirty]);

  const initials = (user?.name ?? 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const onSubmit = handleSubmit(async (values) => {
    const nextUser = {
      ...(user ?? { id: 'user-admin', name: values.name, email: values.email }),
      name: values.name.trim(),
      email: values.email.trim(),
    };

    updateUser(nextUser);
    queryClient.setQueryData(queryKeys.auth.me, nextUser);
    reset({
      name: nextUser.name,
      email: nextUser.email,
    });
    setSaved(true);
  });

  const onPasswordSubmit = handlePasswordSubmit(async (values) => {
    if (values.currentPassword !== (password ?? '')) {
      setPasswordError(t('profile.passwordInvalid'));
      setPasswordSaved(false);
      return;
    }

    updatePassword(values.newPassword);
    resetPassword({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError(null);
    setPasswordSaved(true);
  });

  return (
    <PageShell title={t('profile.title')} description={t('profile.description')}>
      <Card className="overflow-hidden">
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <Avatar size={48} className="bg-primary text-primary-foreground">
              {initials}
            </Avatar>
            <div className="space-y-1">
              <Typography.Title level={5} className="!mb-0 !mt-0 text-base">
                {t('profile.cardTitle')}
              </Typography.Title>
              <Typography.Paragraph className="!mb-0 text-muted-foreground">
                {t('profile.cardDescription')}
              </Typography.Paragraph>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Typography.Text className="flex items-center gap-2 font-medium">
                <UserIcon className="h-4 w-4" />
                <span>{t('profile.name')}</span>
              </Typography.Text>
              <Input id="name" autoComplete="name" {...register('name')} />
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Typography.Text className="text-sm font-medium">{t('profile.email')}</Typography.Text>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
            </div>
            {saved ? (
              <Alert className="border-border/80 bg-muted/40" type="success" showIcon message={t('profile.saved')} />
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <Button type="primary" htmlType="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? t('profile.saving') : t('profile.save')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
      <Divider />
      <Card className="overflow-hidden">
        <div className="space-y-5 p-5 sm:p-6">
          <div className="space-y-1">
            <Typography.Title level={5} className="!mb-0 !mt-0 text-base">
              {t('profile.securityTitle')}
            </Typography.Title>
            <Typography.Paragraph className="!mb-0 text-muted-foreground">
              {t('profile.securityDescription')}
            </Typography.Paragraph>
          </div>

          <form className="space-y-4" onSubmit={onPasswordSubmit}>
            <div className="space-y-2">
              <Typography.Text className="text-sm font-medium">{t('profile.currentPassword')}</Typography.Text>
              <Input.Password id="currentPassword" autoComplete="current-password" {...registerPassword('currentPassword')} />
              {passwordErrors.currentPassword ? <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Typography.Text className="text-sm font-medium">{t('profile.newPassword')}</Typography.Text>
              <Input.Password id="newPassword" autoComplete="new-password" {...registerPassword('newPassword')} />
              {passwordErrors.newPassword ? <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Typography.Text className="text-sm font-medium">{t('profile.confirmNewPassword')}</Typography.Text>
              <Input.Password id="confirmPassword" autoComplete="new-password" {...registerPassword('confirmPassword')} />
              {passwordErrors.confirmPassword ? <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p> : null}
            </div>
            {passwordError ? <Alert type="error" showIcon message={passwordError} /> : null}
            {passwordSaved ? (
              <Alert className="border-border/80 bg-muted/40" type="success" showIcon message={t('profile.passwordChanged')} />
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <Button type="primary" htmlType="submit" disabled={isPasswordSubmitting || !isPasswordDirty}>
                {isPasswordSubmitting ? t('profile.saving') : t('profile.changePassword')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </PageShell>
  );
}
