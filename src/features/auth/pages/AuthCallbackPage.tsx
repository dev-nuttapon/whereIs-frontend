import { useEffect, useState } from 'react';
import { Alert } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ROUTES } from '@/constants/routes';
import { completeKeycloakLogin, getCurrentUser } from '@/api/auth.api';
import { authStore } from '@/stores/auth.store';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { useI18n } from '@/hooks/useI18n';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const setAuth = authStore((state) => state.setAuth);
  const updateTokens = authStore((state) => state.updateTokens);
  const updateUser = authStore((state) => state.updateUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const keycloakError = url.searchParams.get('error');
        const keycloakErrorDescription = url.searchParams.get('error_description');

        if (keycloakError) {
          throw new Error(keycloakErrorDescription ?? keycloakError);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code.');
        }

        const session = await completeKeycloakLogin(code, state);
        updateTokens(session);

        const user = await getCurrentUser();
        if (!active) {
          return;
        }

        setAuth({
          ...session,
          user,
        });
        updateUser(user);
        await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
        navigate(ROUTES.workspaces, { replace: true });
      } catch (cause) {
        if (!active) {
          return;
        }

        const message = cause instanceof Error ? cause.message : t('auth.callback.error');
        setError(message);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [navigate, setAuth, t, updateTokens, updateUser]);

  if (error) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
        <Alert type="error" showIcon message={t('auth.callback.error')} description={error} />
          <Link className="text-sm text-primary underline-offset-4 hover:underline" to={ROUTES.login}>
            {t('auth.register.link')}
          </Link>
        </div>
      </div>
    );
  }

  return <LoadingState label={t('auth.callback.loading')} />;
}
