import { useEffect } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { authStore } from '@/stores/auth.store';

export function AuthBootstrap() {
  const query = useCurrentUser();
  const setAuth = authStore((state) => state.setAuth);

  useEffect(() => {
    if (query.data) {
      const token = authStore.getState().accessToken;
      if (token) {
        setAuth(token, query.data);
      }
    }
  }, [query.data, setAuth]);

  return null;
}

