import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Button, Input, Typography } from 'antd';
import { ROUTES } from '@/constants/routes';
import { createRegisterSchema, type RegisterValues } from '@/features/auth/validation/registerSchema';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { authStore } from '@/stores/auth.store';
import { useI18n } from '@/hooks/useI18n';
import { isDemoModeEnabled } from '@/lib/demo-session';

export function RegisterPage() {
  const navigate = useNavigate();
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const registerMutation = useRegister();
  const { t } = useI18n();
  const isDemoMode = isDemoModeEnabled();
  const registerSchema = createRegisterSchema(t);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: 'Warehouse User',
      email: 'user@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await registerMutation.mutateAsync(values);
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.workspaces);
    }
  }, [isAuthenticated, navigate]);

  return (
    isDemoMode ? (
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Typography.Text className="text-sm font-medium">{t('auth.name')}</Typography.Text>
          <Input id="name" {...register('name')} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Typography.Text className="text-sm font-medium">{t('auth.email')}</Typography.Text>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Typography.Text className="text-sm font-medium">{t('auth.password')}</Typography.Text>
          <Input.Password id="password" autoComplete="new-password" {...register('password')} />
          {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Typography.Text className="text-sm font-medium">{t('auth.confirmPassword')}</Typography.Text>
          <Input.Password id="confirmPassword" autoComplete="new-password" {...register('confirmPassword')} />
          {errors.confirmPassword ? <p className="text-sm text-destructive">{errors.confirmPassword.message}</p> : null}
        </div>
        <Alert type="info" showIcon message={t('auth.register.mock')} />
        <Button className="w-full" type="primary" htmlType="submit" disabled={isSubmitting || registerMutation.isPending}>
          {isSubmitting || registerMutation.isPending ? `${t('common.createAccount')}...` : t('common.createAccount')}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {t('auth.login.forgot')}{' '}
          <Link className="text-primary underline-offset-4 hover:underline" to={ROUTES.login}>
            {t('auth.register.link')}
          </Link>
        </p>
      </form>
    ) : (
      <div className="space-y-4">
        <Alert type="info" showIcon message={t('auth.register.keycloak')} />
        <Button className="w-full" type="primary" onClick={() => navigate(ROUTES.login)}>
          {t('auth.register.keycloakAction')}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {t('auth.login.forgot')}{' '}
          <Link className="text-primary underline-offset-4 hover:underline" to={ROUTES.login}>
            {t('auth.register.link')}
          </Link>
        </p>
      </div>
    )
  );
}
