import { useEffect } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { authStore } from '@/stores/auth.store';

export function AuthBootstrap() {
  const query = useCurrentUser();
  const updateUser = authStore((state) => state.updateUser);

  useEffect(() => {
    if (query.data) {
      updateUser(query.data);
    }
  }, [query.data, updateUser]);

  return null;
}
