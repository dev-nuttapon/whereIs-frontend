import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Avatar, Button, Card, Input, Typography } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { UserIcon } from '@/components/ui/icons';
import { authStore } from '@/stores/auth.store';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { getCurrentUser, updateCurrentUser } from '@/api/auth.api';
import { createProfileSchema, type ProfileValues } from '@/features/profile/validation/profileSchema';

export function ProfilePage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const setUser = authStore((state) => state.updateUser);
  const profileQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const [saved, setSaved] = useState(false);
  const schema = createProfileSchema(t);

  const currentUser = profileQuery.data;
  const defaultValues = useMemo<ProfileValues>(
    () => ({
      name: currentUser?.name ?? '',
      email: currentUser?.email ?? '',
    }),
    [currentUser?.email, currentUser?.name],
  );

  const {
    control,
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

  useEffect(() => {
    if (profileQuery.data) {
      setUser(profileQuery.data);
    }
  }, [profileQuery.data, setUser]);

  const updateMutation = useMutation({
    mutationFn: (values: ProfileValues) =>
      updateCurrentUser({
        displayName: values.name.trim(),
      }),
    onSuccess: async (nextUser) => {
      setUser(nextUser);
      queryClient.setQueryData(queryKeys.auth.me, nextUser);
      reset({
        name: nextUser.name,
        email: nextUser.email,
      });
      setSaved(true);
    },
  });

  const initials = (currentUser?.name ?? 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const onSubmit = handleSubmit(async (values) => {
    await updateMutation.mutateAsync(values);
  });

  if (profileQuery.isLoading) {
    return (
      <PageShell title={t('profile.title')} description={t('profile.description')}>
        <LoadingState label={t('profile.loading', 'กำลังโหลดข้อมูลโปรไฟล์...')} />
      </PageShell>
    );
  }

  if (profileQuery.isError || !currentUser) {
    return (
      <PageShell title={t('profile.title')} description={t('profile.description')}>
        <ErrorState
          message={t('profile.error', 'โหลดข้อมูลโปรไฟล์ไม่สำเร็จ')}
          onRetry={() => profileQuery.refetch()}
        />
      </PageShell>
    );
  }

  return (
    <PageShell title={t('profile.title')} description={t('profile.description')}>
      <Card className="overflow-hidden">
        <div className="component-stack p-5 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar size={48} className="bg-primary text-primary-foreground">
              {initials}
            </Avatar>
            <div className="min-w-0 space-y-1">
              <Typography.Title level={5} className="!mb-0 !mt-0 text-base">
                {t('profile.cardTitle')}
              </Typography.Title>
              <Typography.Paragraph className="!mb-0 text-muted-foreground">
                {t('profile.cardDescription')}
              </Typography.Paragraph>
            </div>
          </div>

          <form className="component-stack" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Typography.Text className="flex items-center gap-2 font-medium">
                <UserIcon className="h-4 w-4" />
                <span>{t('profile.name')}</span>
              </Typography.Text>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    id="name"
                    name={field.name}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(event) => field.onChange(event.target.value)}
                    autoComplete="name"
                  />
                )}
              />
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Typography.Text className="text-sm font-medium">{t('profile.email')}</Typography.Text>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    id="email"
                    name={field.name}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(event) => field.onChange(event.target.value)}
                    type="email"
                    autoComplete="email"
                    disabled
                  />
                )}
              />
            </div>
            {saved ? <Alert className="border-border/80 bg-muted/40" type="success" showIcon message={t('profile.saved')} /> : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <Button className="w-full sm:w-auto" type="primary" htmlType="submit" disabled={isSubmitting || !isDirty || updateMutation.isPending}>
                {isSubmitting || updateMutation.isPending ? t('profile.saving') : t('profile.save')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </PageShell>
  );
}
