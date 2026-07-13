import type { AuthState } from '@/stores/auth.store';
import { MOCK_USER } from '@/mocks/mock-data';

export function isDemoModeEnabled() {
  return import.meta.env.VITE_DEMO_MODE !== 'false';
}

export function getInitialAuthState(): Pick<AuthState, 'accessToken' | 'refreshToken' | 'idToken' | 'expiresAt' | 'user' | 'isAuthenticated' | 'password'> {
  if (!isDemoModeEnabled()) {
    return {
      accessToken: null,
      refreshToken: null,
      idToken: null,
      expiresAt: null,
      user: null,
      isAuthenticated: false,
      password: null,
    };
  }

  return {
    accessToken: 'demo-token',
    refreshToken: 'demo-refresh-token',
    idToken: 'demo-id-token',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    user: MOCK_USER,
    isAuthenticated: true,
    password: 'Password123!',
  };
}
