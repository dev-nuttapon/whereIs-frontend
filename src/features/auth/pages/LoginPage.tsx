import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Alert, Button } from 'antd';
import { ROUTES } from '@/constants/routes';
import { authStore } from '@/stores/auth.store';
import { useI18n } from '@/hooks/useI18n';
import { beginKeycloakLogin } from '@/api/auth.api';

export function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const { t } = useI18n();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.workspaces);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="space-y-4">
      <Alert type="info" showIcon message={t('auth.login.keycloak')} />
      <Button className="w-full" type="primary" onClick={() => void beginKeycloakLogin()}>
        {t('auth.login.keycloakAction')}
      </Button>
    </div>
  );
}
