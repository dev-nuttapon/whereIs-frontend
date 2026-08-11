import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { authStore } from '@/stores/auth.store';
import { isSessionExpired } from '@/lib/session';
export function ProtectedRoute() {
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const expiresAt = authStore((state) => state.expiresAt);
  const markUnauthenticated = authStore((state) => state.markUnauthenticated);

  const isExpired = isSessionExpired(expiresAt);

  useEffect(() => {
    if (isExpired) {
      markUnauthenticated();
    }
  }, [isExpired, markUnauthenticated]);

  if (!isAuthenticated || isExpired) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}
