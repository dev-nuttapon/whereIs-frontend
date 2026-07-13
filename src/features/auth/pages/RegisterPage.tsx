import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Alert, Button, Form, Input } from 'antd';
import { ROUTES } from '@/constants/routes';
import { authStore } from '@/stores/auth.store';
import { useI18n } from '@/hooks/useI18n';
import { getCurrentUser, register } from '@/api/auth.api';

interface RegisterFormValues {
  username: string;
  email: string;
  displayName?: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const setAuth = authStore((state) => state.setAuth);
  const updateTokens = authStore((state) => state.updateTokens);
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.workspaces);
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: RegisterFormValues) => {
    setError(null);
    setSubmitting(true);

    try {
      const session = await register(values.username, values.email, values.password, values.displayName);
      updateTokens(session);
      const user = await getCurrentUser();

      setAuth({
        ...session,
        user,
      });
      navigate(ROUTES.workspaces, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('auth.register.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form<RegisterFormValues> layout="vertical" requiredMark={false} onFinish={onFinish}>
      {error ? <Alert className="mb-6" type="error" showIcon message={t('auth.register.error')} description={error} /> : null}
      <Form.Item
        label={t('auth.username')}
        name="username"
        rules={[{ required: true, message: t('auth.username.required') }]}
      >
        <Input autoComplete="username" placeholder={t('auth.username.placeholder')} />
      </Form.Item>
      <Form.Item
        label={t('auth.email')}
        name="email"
        rules={[
          { required: true, message: t('auth.email.required') },
          { type: 'email', message: t('auth.email.invalid') },
        ]}
      >
        <Input autoComplete="email" placeholder={t('auth.email.placeholder')} />
      </Form.Item>
      <Form.Item label={t('auth.name')} name="displayName">
        <Input autoComplete="name" placeholder={t('auth.name.placeholder')} />
      </Form.Item>
      <Form.Item
        label={t('auth.password')}
        name="password"
        rules={[{ required: true, message: t('auth.password.required') }]}
      >
        <Input.Password autoComplete="new-password" placeholder={t('auth.password.placeholder')} />
      </Form.Item>
      <Form.Item
        className="!mb-3"
        label={t('auth.confirmPassword')}
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: t('auth.confirmPassword.required') },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }

              return Promise.reject(new Error(t('auth.confirmPassword.mismatch')));
            },
          }),
        ]}
      >
        <Input.Password autoComplete="new-password" placeholder={t('auth.confirmPassword.placeholder')} />
      </Form.Item>
      <div className="auth-action-stack">
        <Button type="primary" htmlType="submit" loading={submitting}>
          {t('auth.register.action')}
        </Button>
        <Link to={ROUTES.login}>
          <Button type="default">
            {t('auth.register.link')}
          </Button>
        </Link>
      </div>
    </Form>
  );
}
