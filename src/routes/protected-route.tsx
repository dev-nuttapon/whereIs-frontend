import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { authStore } from '@/stores/auth.store';
import { isSessionExpired } from '@/lib/session';
import { LoadingState } from '@/components/feedback/LoadingState';

export function ProtectedRoute() {
  const location = useLocation();
  const authStatus = authStore((state) => state.authStatus);
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const expiresAt = authStore((state) => state.expiresAt);
  const markUnauthenticated = authStore((state) => state.markUnauthenticated);

  const isExpired = isSessionExpired(expiresAt);

  useEffect(() => {
    if (isExpired) {
      markUnauthenticated();
    }
  }, [isExpired, markUnauthenticated]);

  if (authStatus === 'loading') {
    return <LoadingState />;
  }

  if (!isAuthenticated || isExpired) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
