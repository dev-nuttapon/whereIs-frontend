import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROUTES } from '@/constants/routes';
import { createRegisterSchema, type RegisterValues } from '@/features/auth/validation/registerSchema';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { authStore } from '@/stores/auth.store';
import { useI18n } from '@/hooks/useI18n';

export function RegisterPage() {
  const navigate = useNavigate();
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const registerMutation = useRegister();
  const { t } = useI18n();
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
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">{t('auth.name')}</Label>
        <Input id="name" {...register('name')} />
        {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t('auth.email')}</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.password')}</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
        {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
        <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} />
        {errors.confirmPassword ? <p className="text-sm text-destructive">{errors.confirmPassword.message}</p> : null}
      </div>
      <Alert>
        <AlertDescription>{t('auth.register.mock')}</AlertDescription>
      </Alert>
      <Button className="w-full" type="submit" disabled={isSubmitting || registerMutation.isPending}>
        {isSubmitting || registerMutation.isPending ? `${t('common.createAccount')}...` : t('common.createAccount')}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t('auth.login.forgot')}{' '}
        <Link className="text-primary underline-offset-4 hover:underline" to={ROUTES.login}>
          {t('auth.register.link')}
        </Link>
      </p>
    </form>
  );
}
