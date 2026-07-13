import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Avatar, Button, Card, Input, Typography } from 'antd';
import { PageShell } from '@/components/common/PageShell';
import { UserIcon } from '@/components/ui/icons';
import { authStore } from '@/stores/auth.store';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';
import { client } from '@/api/client';
import { getCurrentUser } from '@/api/auth.api';
import { createProfileSchema, type ProfileValues } from '@/features/profile/validation/profileSchema';
import type { User } from '@/types/domain.types';

interface UpdateMeRequest {
  displayName?: string | null;
  avatarUrl?: string | null;
}

interface MeEnvelope {
  success: boolean;
  data: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

async function updateMe(request: UpdateMeRequest): Promise<User> {
  const response = await client.patch<MeEnvelope>('/users/me', request);
  const me = response.data.data;
  return {
    id: me.id,
    email: me.email,
    name: me.displayName,
    avatarUrl: me.avatarUrl ?? undefined,
  };
}

export function ProfilePage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const user = authStore((state) => state.user);
  const setUser = authStore((state) => state.updateUser);
  const profileQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getCurrentUser,
  });
  const [saved, setSaved] = useState(false);
  const schema = createProfileSchema(t);

  const currentUser = profileQuery.data ?? user;
  const defaultValues = useMemo<ProfileValues>(
    () => ({
      name: currentUser?.name ?? '',
      email: currentUser?.email ?? '',
    }),
    [currentUser?.email, currentUser?.name],
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

  const updateMutation = useMutation({
    mutationFn: (values: ProfileValues) =>
      updateMe({
        displayName: values.name.trim(),
        avatarUrl: null,
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

  return (
    <PageShell title={t('profile.title')} description={t('profile.description')}>
      <Card className="overflow-hidden">
        <div className="space-y-5 p-5 sm:p-6">
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
              <Input id="email" type="email" autoComplete="email" {...register('email')} disabled />
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
