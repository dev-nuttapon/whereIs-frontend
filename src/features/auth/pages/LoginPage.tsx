import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Button, Input, Typography } from 'antd';
import { ROUTES } from '@/constants/routes';
import { createLoginSchema, type LoginValues } from '@/features/auth/validation/loginSchema';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { authStore } from '@/stores/auth.store';
import { useI18n } from '@/hooks/useI18n';

export function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const loginMutation = useLogin();
  const { t } = useI18n();
  const loginSchema = createLoginSchema(t);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'Password123!',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await loginMutation.mutateAsync(values);
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.workspaces);
    }
  }, [isAuthenticated, navigate]);

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Typography.Text className="text-sm font-medium">{t('auth.email')}</Typography.Text>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Typography.Text className="text-sm font-medium">{t('auth.password')}</Typography.Text>
        <Input.Password id="password" autoComplete="current-password" {...register('password')} />
        {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
      </div>
      <Alert type="info" showIcon message={t('auth.login.mock')} />
      <Button className="w-full" type="primary" htmlType="submit" disabled={isSubmitting || loginMutation.isPending}>
        {isSubmitting || loginMutation.isPending ? `${t('common.signIn')}...` : t('common.signIn')}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t('auth.login.forgot')}{' '}
        <Link className="text-primary underline-offset-4 hover:underline" to={ROUTES.register}>
          {t('auth.login.link')}
        </Link>
      </p>
    </form>
  );
}
