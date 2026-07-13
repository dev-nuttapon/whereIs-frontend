import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Alert, Button, Form, Input } from 'antd';
import { ROUTES } from '@/constants/routes';
import { authStore } from '@/stores/auth.store';
import { useI18n } from '@/hooks/useI18n';
import { getCurrentUser, login } from '@/api/auth.api';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
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

  const onFinish = async (values: LoginFormValues) => {
    setError(null);
    setSubmitting(true);

    try {
      const session = await login(values.email, values.password);
      updateTokens(session);
      const user = await getCurrentUser();

      setAuth({
        ...session,
        user,
      });
      navigate(ROUTES.workspaces, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('auth.login.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form<LoginFormValues> layout="vertical" requiredMark={false} onFinish={onFinish}>
      {error ? <Alert className="mb-4" type="error" showIcon message={t('auth.login.error')} description={error} /> : null}
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
      <Form.Item
        className="!mb-3"
        label={t('auth.password')}
        name="password"
        rules={[{ required: true, message: t('auth.password.required') }]}
      >
        <Input.Password autoComplete="current-password" placeholder={t('auth.password.placeholder')} />
      </Form.Item>
      <div className="auth-action-stack">
        <Button type="primary" htmlType="submit" loading={submitting}>
          {t('auth.login.action')}
        </Button>
        <Link to={ROUTES.register}>
          <Button type="default">
            {t('auth.login.link')}
          </Button>
        </Link>
      </div>
    </Form>
  );
}
