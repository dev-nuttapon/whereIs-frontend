import type { AuthState } from '@/stores/auth.store';
import { MOCK_USER } from '@/mocks/mock-data';

export function isDemoModeEnabled() {
  return import.meta.env.VITE_DEMO_MODE !== 'false';
}

export function getInitialAuthState(): Pick<AuthState, 'accessToken' | 'user' | 'isAuthenticated' | 'password'> {
  if (!isDemoModeEnabled()) {
    return {
      accessToken: null,
      user: null,
      isAuthenticated: false,
      password: null,
    };
  }

  return {
    accessToken: 'demo-token',
    user: MOCK_USER,
    isAuthenticated: true,
    password: 'Password123!',
  };
}
